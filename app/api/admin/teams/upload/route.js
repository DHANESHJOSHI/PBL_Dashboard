import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import { requireAdmin } from "@/middleware/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";

async function handler(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(createResponse(false, "No file provided"), { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".csv")) {
      return NextResponse.json(createResponse(false, "Only CSV files are supported"), { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(createResponse(false, "Invalid CSV: No data rows found"), { status: 400 });
    }

    // ── Parse CSV headers (handle quoted fields) ──────────────────────────────
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
          else { inQuotes = !inQuotes; }
        } else if (ch === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      result.push(current.trim());
      return result;
    };

    const rawHeaders = parseCSVLine(lines[0]);

    // ── Normalise header names so both exported CSV and custom CSV work ────────
    // Exported CSV uses "Team ID", custom CSV uses "teamId" — handle both.
    const normaliseHeader = (h) =>
      h.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    const headerMap = {};
    rawHeaders.forEach((h, i) => { headerMap[normaliseHeader(h)] = i; });

    const getField = (values, ...keys) => {
      for (const key of keys) {
        const idx = headerMap[normaliseHeader(key)];
        if (idx !== undefined && values[idx] !== undefined) return (values[idx] || '').trim();
      }
      return '';
    };

    const data = lines.slice(1).map((line) => parseCSVLine(line));

    const batchSize = 3000;
    let successful = 0;
    let failed = 0;
    const errors = [];
    const processedTeams = [];

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const result = await processBatch(batch, getField, i + 2);
      successful += result.successful;
      failed += result.failed;
      errors.push(...result.errors);
      processedTeams.push(...result.processedTeams);
    }

    return NextResponse.json(
      createResponse(true, "File processed", { total: data.length, successful, failed, errors, processedTeams })
    );
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(createResponse(false, "Server error: " + error.message), { status: 500 });
  }
}

async function processBatch(data, getField, startRowNumber) {
  // ── Group rows by teamId ──────────────────────────────────────────────────
  const teamGroups = {};
  const errors = [];
  const processedTeams = [];
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < data.length; i++) {
    const values = data[i];
    const rowNumber = startRowNumber + i;

    // Support both "Team ID" (exported CSV) and "teamId" (custom CSV)
    const teamId = getField(values, 'Team ID', 'teamId', 'TeamID', 'team_id');
    const memberName = getField(values, 'Member Name', 'memberName', 'fullName', 'name');
    const email = getField(values, 'Member Email', 'email', 'memberEmail');

    if (!teamId) {
      errors.push({ row: rowNumber, name: memberName || '-', email: email || '-', error: 'Missing Team ID' });
      continue;
    }
    if (!memberName || !email) {
      errors.push({ row: rowNumber, name: memberName || '-', email: email || '-', error: 'Missing memberName or email' });
      continue;
    }

    if (!teamGroups[teamId]) {
      teamGroups[teamId] = {
        teamInfo: {
          teamId,
          teamName:            getField(values, 'Team Name', 'teamName'),
          collegeName:         getField(values, 'College Name', 'collegeName'),
          collegeId:           getField(values, 'College ID', 'collegeId'),
          collegePincode:      getField(values, 'College Pincode', 'collegePincode'),
          internshipName:      getField(values, 'Internship Name', 'internshipName'),
          courseName:          getField(values, 'Course Name', 'courseName'),
          leaderName:          getField(values, 'Leader Name', 'leaderName'),
          totalMembers:        parseInt(getField(values, 'Total Members', 'totalMembers')) || 1,
          totalFemaleMembers:  parseInt(getField(values, 'Total Female Members', 'totalFemaleMembers')) || 0,
        },
        members: [],
        rows: [],
      };
    }

    const leaderName = teamGroups[teamId].teamInfo.leaderName;
    teamGroups[teamId].members.push({
      fullName:               memberName,
      email:                  email.toLowerCase(),
      learningPlanCompletion: getField(values, 'Learning Plan Completion', 'learningPlanCompletion') || '0%',
      currentMarks:           getField(values, 'Current Marks', 'currentMarks') || '0',
      certificateLink:        getField(values, 'Certificate Link', 'certificateLink') || '',
      certificateFile:        getField(values, 'Certificate File', 'certificateFile') || '',
      resumeLink:             getField(values, 'Resume Link', 'resumeLink') || '',
      resumeFile:             getField(values, 'Resume File', 'resumeFile') || '',
      linkedinLink:           getField(values, 'LinkedIn Link', 'linkedinLink') || '',
      portfolioLink:          getField(values, 'Portfolio Link', 'portfolioLink') || '',
      githubLink:             getField(values, 'GitHub Link', 'githubLink') || '',
      additionalNotes:        getField(values, 'Additional Notes', 'additionalNotes') || '',
      isLeader:               memberName === leaderName,
      memberRole:             getField(values, 'Member Role', 'memberRole'),
    });
    teamGroups[teamId].rows.push(rowNumber);
  }

  // ── Upsert each team ──────────────────────────────────────────────────────
  for (const [teamId, group] of Object.entries(teamGroups)) {
    const { teamInfo, members, rows } = group;

    try {
      // Look up by teamID first (primary key), then fallback to collegeId+leaderName
      const existingTeam = await Team.findOne({ teamID: teamId });

      if (existingTeam) {
        // ── UPDATE existing team ────────────────────────────────────────────
        let membersAdded = 0;
        let membersUpdated = 0;

        for (const incomingMember of members) {
          const existingIdx = existingTeam.members.findIndex(
            (m) => m.email.toLowerCase() === incomingMember.email.toLowerCase()
          );

          if (existingIdx >= 0) {
            // ✅ UPDATE existing member's data (marks, progress, links, etc.)
            const m = existingTeam.members[existingIdx];
            if (incomingMember.learningPlanCompletion) m.learningPlanCompletion = incomingMember.learningPlanCompletion;
            if (incomingMember.currentMarks)           m.currentMarks           = incomingMember.currentMarks;
            if (incomingMember.certificateLink)        m.certificateLink        = incomingMember.certificateLink;
            if (incomingMember.certificateFile)        m.certificateFile        = incomingMember.certificateFile;
            if (incomingMember.resumeLink)             m.resumeLink             = incomingMember.resumeLink;
            if (incomingMember.resumeFile)             m.resumeFile             = incomingMember.resumeFile;
            if (incomingMember.linkedinLink)           m.linkedinLink           = incomingMember.linkedinLink;
            if (incomingMember.portfolioLink)          m.portfolioLink          = incomingMember.portfolioLink;
            if (incomingMember.githubLink)             m.githubLink             = incomingMember.githubLink;
            if (incomingMember.additionalNotes)        m.additionalNotes        = incomingMember.additionalNotes;
            if (incomingMember.fullName)               m.fullName               = incomingMember.fullName;
            membersUpdated++;
          } else {
            // ✅ ADD new member that doesn't exist yet
            const hasLeader = existingTeam.members.some((m) => m.isLeader);
            existingTeam.members.push({
              ...incomingMember,
              isLeader: incomingMember.isLeader && !hasLeader,
            });
            membersAdded++;
          }
        }

        // Also update team-level info if provided
        if (teamInfo.teamName)       existingTeam.teamName       = teamInfo.teamName;
        if (teamInfo.collegeName)    existingTeam.collegeName    = teamInfo.collegeName;
        if (teamInfo.collegeId)      existingTeam.collegeId      = teamInfo.collegeId;
        if (teamInfo.internshipName) existingTeam.internshipName = teamInfo.internshipName;
        if (teamInfo.courseName)     existingTeam.courseName     = teamInfo.courseName;
        if (teamInfo.leaderName)     existingTeam.leaderName     = teamInfo.leaderName;

        existingTeam.totalMembers = existingTeam.members.length;
        existingTeam.updatedAt = new Date();

        await existingTeam.save();
        successful++;
        processedTeams.push({
          teamID: teamId,
          teamName: existingTeam.teamName,
          action: `Updated: ${membersUpdated} member(s) updated, ${membersAdded} new member(s) added`,
          members: existingTeam.members.length,
          rows,
        });
        continue;
      }

      // ── CREATE new team ─────────────────────────────────────────────────────
      const missing = [];
      if (!teamInfo.collegeName) missing.push('collegeName');
      if (!teamInfo.collegeId)   missing.push('collegeId');
      if (!teamInfo.leaderName)  missing.push('leaderName');

      if (missing.length > 0) {
        failed++;
        errors.push({ row: rows[0], email: members[0]?.email || '-', error: `Missing: ${missing.join(', ')}` });
        continue;
      }

      // Determine leader from role or name match
      let leader = members.find((m) => m.memberRole?.toLowerCase() === 'leader' || m.isLeader);
      if (!leader) leader = members.find((m) => m.fullName === teamInfo.leaderName);
      if (!leader) leader = members[0]; // fallback to first member

      // Mark leader correctly
      members.forEach((m) => { m.isLeader = m.email === leader.email; });

      const teamDoc = new Team({
        teamID:             teamId,
        teamName:           teamInfo.teamName || `Team ${teamId.slice(-6)}`,
        collegeName:        teamInfo.collegeName,
        collegeId:          teamInfo.collegeId,
        collegePincode:     teamInfo.collegePincode,
        internshipName:     teamInfo.internshipName || '',
        courseName:         teamInfo.courseName || '',
        leaderName:         teamInfo.leaderName,
        email:              leader.email,
        totalMembers:       teamInfo.totalMembers || members.length,
        totalFemaleMembers: teamInfo.totalFemaleMembers || 0,
        folderStructureEnabled: false,
        members,
      });

      await teamDoc.save();
      successful++;
      processedTeams.push({
        teamID: teamId,
        teamName: teamDoc.teamName,
        leaderName: teamDoc.leaderName,
        email: leader.email,
        memberCount: members.length,
        action: 'Created new team',
      });

    } catch (err) {
      failed++;
      errors.push({ row: rows[0], email: members[0]?.email || '-', error: err.message });
    }
  }

  return { successful, failed, errors, processedTeams };
}

export const POST = requireAdmin(handler);

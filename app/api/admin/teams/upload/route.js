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
      return NextResponse.json(createResponse(false, "No file provided"), {
        status: 400,
      });
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".csv")) {
      return NextResponse.json(
        createResponse(false, "Only CSV files are supported"),
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        createResponse(false, "Invalid CSV: No data rows found"),
        { status: 400 }
      );
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const data = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      return row;
    });

    const batchSize = 3000;
    let successful = 0;
    let failed = 0;
    const errors = [];
    const processedTeams = [];

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const result = await processBatch(batch);
      successful += result.successful;
      failed += result.failed;
      errors.push(...result.errors);
      processedTeams.push(...result.processedTeams);
    }

    return NextResponse.json(
      createResponse(true, "File processed", {
        total: data.length,
        successful,
        failed,
        errors, // ✅ return ALL errors, not sliced
        processedTeams,
      })
    );
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      createResponse(false, "Server error: " + error.message),
      { status: 500 }
    );
  }
}

async function processBatch(data) {
  const teamGroups = {};
  const errors = [];
  const processedTeams = [];
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 2;
    const { teamId, memberName, email, leaderName } = row;

    if (!teamId || !memberName || !email) {
      errors.push({
        row: rowNumber,
        name: memberName || "-",
        email: email || "-",
        error: "Missing teamId, memberName, or email",
      });
      continue;
    }

    if (!teamGroups[teamId]) {
      teamGroups[teamId] = {
        teamInfo: {
          teamId,
          teamName: row.teamName,
          collegeName: row.collegeName,
          collegeId: row.collegeId,
          internshipName: row.internshipName,
          leaderName: leaderName,
          totalMembers: parseInt(row.totalMembers) || 1,
          totalFemaleMembers: parseInt(row.totalFemaleMembers) || 0,
          collegePincode: row.collegePincode || "",
        },
        members: [],
        rows: [],
      };
    }

    teamGroups[teamId].members.push({
      fullName: memberName,
      email: email.toLowerCase(),
      learningPlanCompletion: row.learningPlanCompletion || "0%",
      currentMarks: row.currentMarks || "0",
      certificateLink: row.certificateLink || "",
      resumeLink: row.resumeLink || "",
      linkedinLink: row.linkedinLink || "",
      portfolioLink: row.portfolioLink || "",
      githubLink: row.githubLink || "",
      additionalNotes: row.additionalNotes || "",
      isLeader: memberName === leaderName,
    });

    teamGroups[teamId].rows.push(rowNumber);
  }

  for (const [teamId, group] of Object.entries(teamGroups)) {
    const { teamInfo, members, rows } = group;

    const missing = [];
    if (!teamInfo.collegeName) missing.push("collegeName");
    if (!teamInfo.collegeId) missing.push("collegeId");
    if (!teamInfo.leaderName) missing.push("leaderName");

    if (missing.length > 0) {
      failed++;
      errors.push({
        row: rows[0],
        email: members[0]?.email || "-",
        error: `Missing: ${missing.join(", ")}`,
      });
      continue;
    }

    try {
      const exists = await Team.findOne({
        $or: [
          { teamID: teamId },
          {
            collegeId: teamInfo.collegeId,
            leaderName: teamInfo.leaderName,
          },
        ],
      });

      if (exists) {
        // Team exists, check if we need to add new members
        let membersAdded = 0;
        let membersSkipped = 0;
        
        for (const newMember of members) {
          // Check if member email already exists in the team
          const emailExists = exists.members.some(existingMember => 
            existingMember.email.toLowerCase() === newMember.email.toLowerCase()
          );
          
          if (!emailExists) {
            // Check for leader conflicts
            const hasExistingLeader = exists.members.some(member => member.isLeader);
            const isNewMemberLeader = newMember.isLeader;
            
            // If trying to add a new leader but team already has a leader, make the new member a regular member
            const finalIsLeader = isNewMemberLeader && hasExistingLeader ? false : (newMember.isLeader || false);
            
            // Add new member to existing team
            exists.members.push({
              fullName: newMember.fullName,
              email: newMember.email.toLowerCase(),
              learningPlanCompletion: newMember.learningPlanCompletion || "0%",
              currentMarks: newMember.currentMarks || "0",
              certificateLink: newMember.certificateLink || "",
              certificateFile: newMember.certificateFile || "",
              resumeLink: newMember.resumeLink || "",
              resumeFile: newMember.resumeFile || "",
              linkedinLink: newMember.linkedinLink || "",
              portfolioLink: newMember.portfolioLink || "",
              githubLink: newMember.githubLink || "",
              additionalNotes: newMember.additionalNotes || "",
              isLeader: finalIsLeader,
            });
            membersAdded++;
          } else {
            membersSkipped++;
          }
        }
        
        if (membersAdded > 0) {
          // Update total members count
          exists.totalMembers = exists.members.length;
          
          // Save the updated team
          await exists.save();
          successful++;
          
          processedTeams.push({
            teamID: teamId,
            teamName: exists.teamName,
            action: `Updated existing team: ${membersAdded} new member(s) added, ${membersSkipped} member(s) skipped (already exist)`,
            members: exists.members.length,
            rows: rows
          });
        } else {
          // All members already exist, skip
          errors.push({
            row: rows[0],
            email: members[0]?.email || "-",
            error: `All members already exist in team ${teamId}`,
          });
        }
        continue;
      }

      const leader = members.find((m) => m.isLeader);
      if (!leader) {
        failed++;
        errors.push({
          row: rows[0],
          email: "-",
          error: `Leader "${teamInfo.leaderName}" not found in members`,
        });
        continue;
      }

      if (members.length !== teamInfo.totalMembers) {
        errors.push({
          row: rows[0],
          email: leader.email,
          error: `Expected ${teamInfo.totalMembers} members, found ${members.length}`,
        });
      }

      const teamDoc = new Team({
        teamID: teamId,
        teamName: teamInfo.teamName || `Team ${teamId.slice(-6)}`,
        collegeName: teamInfo.collegeName,
        collegeId: teamInfo.collegeId,
        collegePincode: teamInfo.collegePincode,
        internshipName: teamInfo.internshipName || "",
        leaderName: teamInfo.leaderName,
        email: leader.email,
        totalMembers: teamInfo.totalMembers,
        totalFemaleMembers: teamInfo.totalFemaleMembers,
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
      });
    } catch (err) {
      failed++;
      errors.push({
        row: rows[0],
        email: members[0]?.email || "-",
        error: err.message,
      });
    }
  }

  return { successful, failed, errors, processedTeams };
}

export const POST = requireAdmin(handler);

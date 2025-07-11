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
      return NextResponse.json(
        createResponse(false, "No file provided"), 
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    
    if (!isCSV && !isExcel) {
      return NextResponse.json(
        createResponse(false, "Only CSV and Excel files are supported"), 
        { status: 400 }
      );
    }

    let data = [];
    
    if (isCSV) {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        return NextResponse.json(
          createResponse(false, "Invalid CSV format - no data rows found"), 
          { status: 400 }
        );
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const dataLines = lines.slice(1);
      
      data = dataLines.map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });
    } else {
      // For Excel files, we'll need to handle them differently
      // For now, return an error asking for CSV format
      return NextResponse.json(
        createResponse(false, "Excel support coming soon. Please use CSV format for now."), 
        { status: 400 }
      );
    }

    // Group data by teamId since each row represents a team member
    const teamGroups = {};
    const errors = [];
    
    // First pass: group rows by teamId and validate basic fields
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;
      
      const teamId = row.teamId;
      const memberName = row.memberName;
      const memberEmail = row.email;
      
      if (!teamId || !memberName || !memberEmail) {
        errors.push(`Row ${rowNumber}: Missing teamId, memberName, or email`);
        continue;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(memberEmail)) {
        errors.push(`Row ${rowNumber}: Invalid email address format for ${memberEmail}`);
        continue;
      }
      
      if (!teamGroups[teamId]) {
        teamGroups[teamId] = {
          teamInfo: {
            teamId: teamId,
            teamName: row.teamName,
            collegeName: row.collegeName,
            collegeId: row.collegeId,
            internshipName: row.internshipName,
            leaderName: row.leaderName,
            totalMembers: parseInt(row.totalMembers) || 1,
            totalFemaleMembers: parseInt(row.totalFemaleMembers) || 0,
            collegePincode: row.collegePincode || ''
          },
          members: [],
          rows: []
        };
      }
      
      // Add member to the team
      teamGroups[teamId].members.push({
        fullName: memberName,
        email: memberEmail.toLowerCase(),
        learningPlanCompletion: row.learningPlanCompletion || "0%",
        currentMarks: row.currentMarks || "0",
        certificateLink: row.certificateLink || "",
        resumeLink: row.resumeLink || "",
        linkedinLink: row.linkedinLink || "",
        portfolioLink: row.portfolioLink || "",
        githubLink: row.githubLink || "",
        additionalNotes: row.additionalNotes || "",
        isLeader: memberName === row.leaderName
      });
      
      teamGroups[teamId].rows.push(rowNumber);
    }

    let successful = 0;
    let failed = 0;
    const processedTeams = [];

    // Second pass: create teams from grouped data
    for (const [teamId, teamGroup] of Object.entries(teamGroups)) {
      try {
        const { teamInfo, members } = teamGroup;
        
        // Validate required team fields
        const missingFields = [];
        if (!teamInfo.collegeName) missingFields.push('College Name');
        if (!teamInfo.collegeId) missingFields.push('College ID');
        if (!teamInfo.leaderName) missingFields.push('Leader Name');
        
        if (missingFields.length > 0) {
          failed++;
          errors.push(`Team ${teamId}: Missing required fields: ${missingFields.join(', ')}`);
          continue;
        }

        // Check if team already exists
        const existingTeam = await Team.findOne({ 
          $or: [
            { teamID: teamId },
            { collegeId: teamInfo.collegeId, leaderName: teamInfo.leaderName }
          ]
        });
        
        if (existingTeam) {
          failed++;
          errors.push(`Team ${teamId}: Team already exists`);
          continue;
        }

        // Validate member count
        if (members.length !== teamInfo.totalMembers) {
          errors.push(`Team ${teamId}: Warning - Expected ${teamInfo.totalMembers} members but found ${members.length}`);
        }

        // Find leader in members
        const leader = members.find(m => m.isLeader);
        if (!leader) {
          failed++;
          errors.push(`Team ${teamId}: Leader ${teamInfo.leaderName} not found in members list`);
          continue;
        }

        // Create team object
        const teamData = {
          teamID: teamId,
          teamName: teamInfo.teamName || `Team ${teamId.slice(-6)}`,
          collegeName: teamInfo.collegeName,
          collegePincode: teamInfo.collegePincode,
          collegeId: teamInfo.collegeId,
          internshipName: teamInfo.internshipName || "",
          leaderName: teamInfo.leaderName,
          email: leader.email,
          totalMembers: teamInfo.totalMembers,
          totalFemaleMembers: teamInfo.totalFemaleMembers,
          folderStructureEnabled: false,
          members: members
        };

        // Create and save team
        const newTeam = new Team(teamData);
        await newTeam.save();
        
        successful++;
        processedTeams.push({
          teamID: teamId,
          teamName: teamData.teamName,
          leaderName: teamData.leaderName,
          email: teamData.email,
          memberCount: members.length
        });

      } catch (error) {
        failed++;
        errors.push(`Team ${teamId}: ${error.message}`);
      }
    }

    return NextResponse.json(
      createResponse(true, "File processed successfully", {
        successful,
        failed,
        total: data.length,
        errors: errors.slice(0, 20), // Limit error messages to first 20
        processedTeams: processedTeams.slice(0, 10) // Show first 10 successful teams
      })
    );

  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error during file processing"), 
      { status: 500 }
    );
  }
}

export const POST = requireAdmin(handler);
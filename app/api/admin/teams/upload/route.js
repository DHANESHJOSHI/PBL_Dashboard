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

    let successful = 0;
    let failed = 0;
    const errors = [];
    const processedTeams = [];

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        const rowNumber = i + 2; // +2 because we start from row 2 (after header)

        // Required fields validation
        const requiredFields = {
          'teamId': row.teamId || row['Team ID'] || row['team_id'],
          'teamName': row.teamName || row['Team Name'] || row['team_name'],
          'collegeName': row.collegeName || row['College Name'] || row['college_name'],
          'collegeId': row.collegeId || row['College ID'] || row['college_id'],
          'internshipName': row.internshipName || row['Internship Name'] || row['internship_name'],
          'leaderName': row.leaderName || row['Leader Name'] || row['leader_name'],
          'memberName': row.memberName || row['Member Name'] || row['member_name'],
          'email': row.email || row['Email'] || row['leader_email'],
          'totalMembers': row.totalMembers || row['Total Members'] || row['total_members'] || '1',
          'totalFemaleMembers': row.totalFemaleMembers || row['Female Members'] || row['female_members'] || '0',
          'collegePincode': row.collegePincode || row['College Pincode'] || row['college_pincode'],
          'learningPlanCompletion': row.learningPlanCompletion || row['Learning Plan Completion'] || row['learning_plan_completion'],
          'currentMarks': row.currentMarks || row['Current Marks'] || row['current_marks'],
          'certificateLink': row.certificateLink || row['Certificate Link'] || row['certificate_link'],
          'resumeLink': row.resumeLink || row['Resume Link'] || row['resume_link'],
          'linkedinLink': row.linkedinLink || row['LinkedIn Link'] || row['linkedin_link'],
          'portfolioLink': row.portfolioLink || row['Portfolio Link'] || row['portfolio_link'],
          'githubLink': row.githubLink || row['Github Link'] || row['github_link']
        };
        

        // Check for missing required fields
        const missingFields = [];
        if (!requiredFields.collegeName) missingFields.push('College Name');
        if (!requiredFields.collegeId) missingFields.push('College ID');
        if (!requiredFields.leaderName) missingFields.push('Leader Name');
        if (!requiredFields.email) missingFields.push('Email');

        if (missingFields.length > 0) {
          failed++;
          errors.push(`Row ${rowNumber}: Missing required fields: ${missingFields.join(', ')}`);
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@gmail\.com$/i;
        if (!emailRegex.test(requiredFields.email)) {
          failed++;
          errors.push(`Row ${rowNumber}: Invalid Gmail address format`);
          continue;
        }

        // Check if team already exists
        const existingTeam = await Team.findOne({ 
          $or: [
            { email: requiredFields.email.toLowerCase() },
            { collegeId: requiredFields.collegeId, leaderName: requiredFields.leaderName }
          ]
        });
        
        if (existingTeam) {
          failed++;
          errors.push(`Row ${rowNumber}: Team with email ${requiredFields.email} or same leader already exists`);
          continue;
        }

        // Generate unique team ID
        const generateTeamID = () => {
          const prefix = "IBMSB2025";
          const randomString = Math.random().toString(36).substring(2, 12).toUpperCase();
          return `${prefix}${randomString}`;
        };

        let teamID;
        let isUnique = false;
        let attempts = 0;
        
        while (!isUnique && attempts < 10) {
          teamID = generateTeamID();
          const existingTeamWithID = await Team.findOne({ teamID });
          if (!existingTeamWithID) {
            isUnique = true;
          }
          attempts++;
        }

        if (!isUnique) {
          failed++;
          errors.push(`Row ${rowNumber}: Could not generate unique team ID after multiple attempts`);
          continue;
        }

        // Parse numeric fields
        const totalMembers = Math.max(1, parseInt(requiredFields.totalMembers) || 1);
        const totalFemaleMembers = Math.max(0, Math.min(totalMembers, parseInt(requiredFields.totalFemaleMembers) || 0));

        // Create team object
        const teamData = {
          teamID,
          teamName: requiredFields.teamName || `Team ${teamID.slice(-6)}`,
          collegeName: requiredFields.collegeName,
          collegePincode: requiredFields.collegePincode || '',
          collegeId: requiredFields.collegeId,
          leaderName: requiredFields.leaderName,
          email: requiredFields.email.toLowerCase(),
          totalMembers,
          totalFemaleMembers,
          folderStructureEnabled: false,
          members: [
            {
              fullName: requiredFields.leaderName,
              email: requiredFields.email.toLowerCase(),
              learningPlanCompletion: requiredFields.learningPlanCompletion || "0%",
              currentMarks: requiredFields.currentMarks || "0",
              certificateLink: requiredFields.certificateLink || "",
              resumeLink: requiredFields.resumeLink || "",
              linkedinLink: requiredFields.linkedinLink || "",
              portfolioLink: requiredFields.portfolioLink || "",
              githubLink: requiredFields.githubLink || "",
              additionalNotes: row.additionalNotes || row['Additional Notes'] || "",
              isLeader: true,
            }
          ],
        };

        // Add additional members if specified
        for (let memberIndex = 2; memberIndex <= totalMembers && memberIndex <= 8; memberIndex++) {
          const memberName = row[`member${memberIndex}Name`] || row[`Member ${memberIndex} Name`] || '';
          const memberEmail = row[`member${memberIndex}Email`] || row[`Member ${memberIndex} Email`] || '';
          
          if (memberName || memberEmail) {
            teamData.members.push({
              fullName: memberName || `Member ${memberIndex}`,
              email: memberEmail || '',
              learningPlanCompletion: "0%",
              currentMarks: "0",
              certificateLink: "",
              resumeLink: "",
              linkedinLink: "",
              portfolioLink: "",
              githubLink: "",
              additionalNotes: "",
              isLeader: false,
            });
          }
        }

        // Create and save team
        const newTeam = new Team(teamData);
        await newTeam.save();
        
        successful++;
        processedTeams.push({
          teamID,
          teamName: teamData.teamName,
          leaderName: teamData.leaderName,
          email: teamData.email
        });

      } catch (error) {
        failed++;
        errors.push(`Row ${i + 2}: ${error.message}`);
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
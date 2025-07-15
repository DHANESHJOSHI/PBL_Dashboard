import { NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";

async function getHandler(request) {
  try {
    await connectDB();
    
    // Fetch all teams with complete details
    const teams = await Team.find({}).sort({ createdAt: -1 });
    
    // Prepare CSV headers
    const csvHeaders = [
      'Team ID',
      'Team Name',
      'College Name',
      'College ID',
      'College Pincode',
      'Leader Name',
      'Leader Email',
      'Total Members',
      'Total Female Members',
      'Created At',
      'Concept Note Submitted',
      'Final Deliverable Submitted',
      'Folder Structure Enabled',
      'Team Folder Link',
      'Concept Note Folder Link',
      'Final Deliverable Folder Link',
      'Member Submissions Folder Link',
      'Member Name',
      'Member Email',
      'Member Role',
      'Learning Plan Completion',
      'Current Marks',
      'Certificate Link',
      'Certificate File',
      'Resume Link',
      'Resume File',
      'LinkedIn Link',
      'Portfolio Link',
      'GitHub Link',
      'Additional Notes',
      'Member Certificate Folder Link',
      'Member Resume Folder Link'
    ];
    
    // Prepare CSV data
    const csvData = [];
    csvData.push(csvHeaders);
    
    for (const team of teams) {
      const baseTeamData = [
        team.teamID || '',
        team.teamName || '',
        team.collegeName || '',
        team.collegeId || '',
        team.collegePincode || '',
        team.leaderName || '',
        team.email || '',
        team.totalMembers || 0,
        team.totalFemaleMembers || 0,
        team.createdAt ? new Date(team.createdAt).toLocaleDateString() : '',
        team.submitConceptNote ? 'Yes' : 'No',
        team.submitFinalDeliverable ? 'Yes' : 'No',
        team.folderStructureEnabled ? 'Yes' : 'No',
        team.folderStructure?.teamFolderLink || '',
        team.folderStructure?.conceptNoteFolderId ? `https://drive.google.com/drive/folders/${team.folderStructure.conceptNoteFolderId}` : '',
        team.folderStructure?.finalDeliverableFolderId ? `https://drive.google.com/drive/folders/${team.folderStructure.finalDeliverableFolderId}` : '',
        team.folderStructure?.membersSubmissionsFolderId ? `https://drive.google.com/drive/folders/${team.folderStructure.membersSubmissionsFolderId}` : ''
      ];
      
      // If team has members, add rows for each member
      if (team.members && team.members.length > 0) {
        team.members.forEach((member, index) => {
          const memberData = [
            ...baseTeamData,
            member.fullName || '',
            member.email || '',
            member.isLeader ? 'Leader' : 'Member',
            member.learningPlanCompletion || '0%',
            member.currentMarks || '0',
            member.certificateLink || '',
            member.certificateFile || '',
            member.resumeLink || '',
            member.resumeFile || '',
            member.linkedinLink || '',
            member.portfolioLink || '',
            member.githubLink || '',
            member.additionalNotes || '',
            team.folderStructure?.memberFolders?.[index]?.certificateFolderId ? `https://drive.google.com/drive/folders/${team.folderStructure.memberFolders[index].certificateFolderId}` : '',
            team.folderStructure?.memberFolders?.[index]?.resumeFolderId ? `https://drive.google.com/drive/folders/${team.folderStructure.memberFolders[index].resumeFolderId}` : ''
          ];
          csvData.push(memberData);
        });
      } else {
        // If no members, add team data with empty member fields
        const emptyMemberData = [
          ...baseTeamData,
          '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
        ];
        csvData.push(emptyMemberData);
      }
    }
    
    // Convert to CSV string
    const csvString = csvData.map(row => 
      row.map(field => {
        // Escape quotes and wrap in quotes if field contains comma, quote, or newline
        const fieldStr = String(field || '');
        if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
          return '"' + fieldStr.replace(/"/g, '""') + '"';
        }
        return fieldStr;
      }).join(',')
    ).join('\n');
    
    // Return CSV as response
    return new NextResponse(csvString, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="teams_export.csv"',
      },
    });
    
  } catch (error) {
    console.error("Export teams error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to export teams" },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(getHandler);

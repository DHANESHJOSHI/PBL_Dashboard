import { NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";

// Only fetch the fields we actually need in the CSV export
const EXPORT_SELECT = [
  'teamID', 'teamName', 'internshipName', 'courseName',
  'collegeName', 'collegeId', 'collegePincode',
  'leaderName', 'email', 'totalMembers', 'totalFemaleMembers',
  'createdAt', 'submitConceptNote', 'submitFinalDeliverable',
  'folderStructureEnabled', 'folderStructure', 'members'
].join(' ');

const BATCH_SIZE = 500; // process 500 teams at a time to avoid OOM

async function getHandler(request) {
  try {
    await connectDB();

    // CSV headers
    const csvHeaders = [
      'Team ID', 'Team Name', 'Internship Name', 'Course Name',
      'College Name', 'College ID', 'College Pincode',
      'Leader Name', 'Leader Email', 'Total Members', 'Total Female Members',
      'Created At', 'Concept Note Submitted', 'Final Deliverable Submitted',
      'Folder Structure Enabled', 'Team Folder Link',
      'Concept Note Folder Link', 'Final Deliverable Folder Link',
      'Member Submissions Folder Link',
      'Member Name', 'Member Email', 'Member Role',
      'Learning Plan Completion', 'Current Marks',
      'Certificate Link', 'Certificate File',
      'Resume Link', 'Resume File',
      'LinkedIn Link', 'Portfolio Link', 'GitHub Link',
      'Additional Notes',
      'Member Certificate Folder Link', 'Member Resume Folder Link'
    ];

    // Helper: escape a CSV field
    const escapeField = (val) => {
      const s = String(val ?? '');
      return (s.includes(',') || s.includes('"') || s.includes('\n'))
        ? '"' + s.replace(/"/g, '""') + '"'
        : s;
    };

    // Build CSV incrementally in chunks — avoids storing everything in memory at once
    const csvParts = [csvHeaders.map(escapeField).join(',')];

    const total = await Team.countDocuments({});
    let skip = 0;

    while (skip < total) {
      // .lean() returns plain JS objects — much faster & uses far less memory than Mongoose docs
      const teams = await Team.find({})
        .select(EXPORT_SELECT)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(BATCH_SIZE)
        .lean();

      for (const team of teams) {
        const baseTeamData = [
          team.teamID || '',
          team.teamName || '',
          team.internshipName || '',
          team.courseName || '',
          team.collegeName || '',
          team.collegeId || '',
          team.collegePincode || '',
          team.leaderName || '',
          team.email || '',
          team.totalMembers || 0,
          team.totalFemaleMembers || 0,
          team.createdAt ? new Date(team.createdAt).toLocaleDateString('en-IN') : '',
          team.submitConceptNote ? 'Yes' : 'No',
          team.submitFinalDeliverable ? 'Yes' : 'No',
          team.folderStructureEnabled ? 'Yes' : 'No',
          team.folderStructure?.teamFolderLink || '',
          team.folderStructure?.conceptNoteFolderId
            ? `https://drive.google.com/drive/folders/${team.folderStructure.conceptNoteFolderId}` : '',
          team.folderStructure?.finalDeliverableFolderId
            ? `https://drive.google.com/drive/folders/${team.folderStructure.finalDeliverableFolderId}` : '',
          team.folderStructure?.membersSubmissionsFolderId
            ? `https://drive.google.com/drive/folders/${team.folderStructure.membersSubmissionsFolderId}` : '',
        ];

        if (team.members && team.members.length > 0) {
          team.members.forEach((member, idx) => {
            const row = [
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
              team.folderStructure?.memberFolders?.[idx]?.certificateFolderId
                ? `https://drive.google.com/drive/folders/${team.folderStructure.memberFolders[idx].certificateFolderId}` : '',
              team.folderStructure?.memberFolders?.[idx]?.resumeFolderId
                ? `https://drive.google.com/drive/folders/${team.folderStructure.memberFolders[idx].resumeFolderId}` : '',
            ];
            csvParts.push(row.map(escapeField).join(','));
          });
        } else {
          // Team with no members — emit one row with empty member columns
          const emptyRow = [...baseTeamData, ...Array(15).fill('')];
          csvParts.push(emptyRow.map(escapeField).join(','));
        }
      }

      skip += BATCH_SIZE;
    }

    const csvString = csvParts.join('\n');

    return new NextResponse(csvString, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="teams_export_${new Date().toISOString().split('T')[0]}.csv"`,
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    console.error("Export teams error:", error);
    return NextResponse.json(
      { success: false, message: `Failed to export teams: ${error.message}` },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(getHandler);

// Allow up to 120 seconds for this route (large dataset export)
export const maxDuration = 120;

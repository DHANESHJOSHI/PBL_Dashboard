import { requireAdmin } from "@/middleware/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";

// Only select fields actually used in the CSV
const EXPORT_SELECT = [
  'teamID', 'teamName', 'internshipName', 'courseName',
  'collegeName', 'collegeId', 'collegePincode',
  'leaderName', 'email', 'totalMembers', 'totalFemaleMembers',
  'createdAt', 'submitConceptNote', 'submitFinalDeliverable',
  'folderStructureEnabled', 'folderStructure', 'members'
].join(' ');

// Escape a single CSV field
function escapeField(val) {
  const s = String(val ?? '');
  return (s.includes(',') || s.includes('"') || s.includes('\n'))
    ? '"' + s.replace(/"/g, '""') + '"'
    : s;
}

// Build one or more CSV row strings for a team
function teamToRows(team) {
  const base = [
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
    return team.members.map((m, idx) => [
      ...base,
      m.fullName || '',
      m.email || '',
      m.isLeader ? 'Leader' : 'Member',
      m.learningPlanCompletion || '0%',
      m.currentMarks || '0',
      m.certificateLink || '',
      m.certificateFile || '',
      m.resumeLink || '',
      m.resumeFile || '',
      m.linkedinLink || '',
      m.portfolioLink || '',
      m.githubLink || '',
      m.additionalNotes || '',
      team.folderStructure?.memberFolders?.[idx]?.certificateFolderId
        ? `https://drive.google.com/drive/folders/${team.folderStructure.memberFolders[idx].certificateFolderId}` : '',
      team.folderStructure?.memberFolders?.[idx]?.resumeFolderId
        ? `https://drive.google.com/drive/folders/${team.folderStructure.memberFolders[idx].resumeFolderId}` : '',
    ].map(escapeField).join(','));
  }

  // No members — one empty row
  return [[...base, ...Array(15).fill('')].map(escapeField).join(',')];
}

async function getHandler(request) {
  try {
    await connectDB();

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
    ].join(',');

    const encoder = new TextEncoder();

    // ── Streaming response via MongoDB cursor ──────────────────────────────────
    // Single pass through the collection — no skip() overhead.
    // Browser starts receiving & downloading data immediately.
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Write header row
          controller.enqueue(encoder.encode(csvHeaders + '\n'));

          // Open a cursor — fetches docs one-by-one, far less memory than find()
          const cursor = Team.find({})
            .select(EXPORT_SELECT)
            .sort({ createdAt: -1 })
            .lean()
            .cursor({ batchSize: 200 }); // fetch 200 docs per network round-trip

          for await (const team of cursor) {
            const rows = teamToRows(team);
            controller.enqueue(encoder.encode(rows.join('\n') + '\n'));
          }

          controller.close();
        } catch (err) {
          console.error('Export stream error:', err);
          controller.error(err);
        }
      }
    });
    // ──────────────────────────────────────────────────────────────────────────

    const filename = `teams_export_${new Date().toISOString().split('T')[0]}.csv`;

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error("Export teams error:", error);
    return Response.json(
      { success: false, message: `Failed to export teams: ${error.message}` },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(getHandler);

// Allow up to 120 seconds for this route
export const maxDuration = 120;

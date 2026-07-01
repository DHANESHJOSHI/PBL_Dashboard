import { requireAdmin } from "@/middleware/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";
import fs from "fs";
import path from "path";
import os from "os";

// ── Cache config ───────────────────────────────────────────────────────────────
const CACHE_DIR  = path.join(os.tmpdir(), "pbl_export_cache");
const CACHE_FILE = path.join(CACHE_DIR, "teams_export.csv");
const META_FILE  = path.join(CACHE_DIR, "teams_export.meta.json");
const CACHE_TTL  = 30 * 60 * 1000; // 30 minutes

// Only select fields we actually use in the CSV
const EXPORT_SELECT = [
  "teamID", "teamName", "internshipName", "courseName",
  "collegeName", "collegeId", "collegePincode",
  "leaderName", "email", "totalMembers", "totalFemaleMembers",
  "createdAt", "submitConceptNote", "submitFinalDeliverable",
  "folderStructureEnabled", "folderStructure", "members",
].join(" ");

// ── Helpers ────────────────────────────────────────────────────────────────────
function escapeField(val) {
  const s = String(val ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? '"' + s.replace(/"/g, '""') + '"'
    : s;
}

function teamToRows(team) {
  const base = [
    team.teamID || "",
    team.teamName || "",
    team.internshipName || "",
    team.courseName || "",
    team.collegeName || "",
    team.collegeId || "",
    team.collegePincode || "",
    team.leaderName || "",
    team.email || "",
    team.totalMembers || 0,
    team.totalFemaleMembers || 0,
    team.createdAt ? new Date(team.createdAt).toLocaleDateString("en-IN") : "",
    team.submitConceptNote ? "Yes" : "No",
    team.submitFinalDeliverable ? "Yes" : "No",
    team.folderStructureEnabled ? "Yes" : "No",
    team.folderStructure?.teamFolderLink || "",
    team.folderStructure?.conceptNoteFolderId
      ? `https://drive.google.com/drive/folders/${team.folderStructure.conceptNoteFolderId}` : "",
    team.folderStructure?.finalDeliverableFolderId
      ? `https://drive.google.com/drive/folders/${team.folderStructure.finalDeliverableFolderId}` : "",
    team.folderStructure?.membersSubmissionsFolderId
      ? `https://drive.google.com/drive/folders/${team.folderStructure.membersSubmissionsFolderId}` : "",
  ];

  if (team.members?.length > 0) {
    return team.members.map((m, idx) =>
      [
        ...base,
        m.fullName || "",
        m.email || "",
        m.isLeader ? "Leader" : "Member",
        m.learningPlanCompletion || "0%",
        m.currentMarks || "0",
        m.certificateLink || "",
        m.certificateFile || "",
        m.resumeLink || "",
        m.resumeFile || "",
        m.linkedinLink || "",
        m.portfolioLink || "",
        m.githubLink || "",
        m.additionalNotes || "",
        team.folderStructure?.memberFolders?.[idx]?.certificateFolderId
          ? `https://drive.google.com/drive/folders/${team.folderStructure.memberFolders[idx].certificateFolderId}` : "",
        team.folderStructure?.memberFolders?.[idx]?.resumeFolderId
          ? `https://drive.google.com/drive/folders/${team.folderStructure.memberFolders[idx].resumeFolderId}` : "",
      ].map(escapeField).join(",")
    );
  }
  return [[...base, ...Array(15).fill("")].map(escapeField).join(",")];
}

// ── Check if a fresh cached file exists ───────────────────────────────────────
function getFreshCache() {
  try {
    if (!fs.existsSync(CACHE_FILE) || !fs.existsSync(META_FILE)) return null;
    const meta = JSON.parse(fs.readFileSync(META_FILE, "utf8"));
    if (Date.now() - meta.generatedAt < CACHE_TTL) return CACHE_FILE;
  } catch (_) {}
  return null;
}

// ── Generate CSV to disk using a cursor (low memory) ──────────────────────────
async function generateCSVToDisk() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const CSV_HEADERS = [
    "Team ID", "Team Name", "Internship Name", "Course Name",
    "College Name", "College ID", "College Pincode",
    "Leader Name", "Leader Email", "Total Members", "Total Female Members",
    "Created At", "Concept Note Submitted", "Final Deliverable Submitted",
    "Folder Structure Enabled", "Team Folder Link",
    "Concept Note Folder Link", "Final Deliverable Folder Link",
    "Member Submissions Folder Link",
    "Member Name", "Member Email", "Member Role",
    "Learning Plan Completion", "Current Marks",
    "Certificate Link", "Certificate File",
    "Resume Link", "Resume File",
    "LinkedIn Link", "Portfolio Link", "GitHub Link",
    "Additional Notes",
    "Member Certificate Folder Link", "Member Resume Folder Link",
  ].join(",");

  const writeStream = fs.createWriteStream(CACHE_FILE, { encoding: "utf8" });

  await new Promise((resolve, reject) => {
    writeStream.write(CSV_HEADERS + "\n", (err) => { if (err) reject(err); });
    writeStream.on("error", reject);
    writeStream.on("finish", resolve);

    // Run DB cursor asynchronously and pipe rows to file
    (async () => {
      try {
        const cursor = Team.find({})
          .select(EXPORT_SELECT)
          .sort({ createdAt: -1 })
          .lean()
          .cursor({ batchSize: 300 });

        for await (const team of cursor) {
          const rows = teamToRows(team);
          for (const row of rows) {
            // Backpressure: pause when buffer is full
            const ok = writeStream.write(row + "\n");
            if (!ok) await new Promise((r) => writeStream.once("drain", r));
          }
        }
        writeStream.end();
      } catch (err) {
        writeStream.destroy(err);
        reject(err);
      }
    })();
  });

  // Write metadata
  fs.writeFileSync(META_FILE, JSON.stringify({ generatedAt: Date.now() }));
  return CACHE_FILE;
}

// ── Route handler ─────────────────────────────────────────────────────────────
async function getHandler(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get("refresh") === "1";

    // Serve from cache if fresh (unless force-refresh requested)
    const cachedPath = forceRefresh ? null : getFreshCache();

    let filePath;
    if (cachedPath) {
      filePath = cachedPath;
    } else {
      // Generate fresh CSV to disk
      filePath = await generateCSVToDisk();
    }

    // Stream the file to the client
    const fileBuffer = fs.readFileSync(filePath);
    const filename = `teams_export_${new Date().toISOString().split("T")[0]}.csv`;

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
        "X-Cache": cachedPath ? "HIT" : "MISS",
        "X-Cache-Age": cachedPath
          ? String(Math.round((Date.now() - JSON.parse(fs.readFileSync(META_FILE, "utf8")).generatedAt) / 1000)) + "s"
          : "0s",
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

// Allow up to 120 seconds for generation
export const maxDuration = 120;

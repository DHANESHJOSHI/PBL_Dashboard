import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import { requireTeam } from "@/middleware/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";
import GlobalSettings from "@/models/GlobalSettings";
import { getDriveClient, ensureTeamFolderStructure } from "@/lib/gdrive-utils";

// Robust findOrCreateFolder with supportsAllDrives (fixes 404 on shared drives)
async function findOrCreateFolderRobust(drive, folderName, parentId = null) {
  try {
    // Search for existing folder
    const query = parentId
      ? `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
      : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

    const response = await drive.files.list({
      q: query,
      fields: "files(id, name)",
      spaces: "drive",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Create new folder
    const folderMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      ...(parentId ? { parents: [parentId] } : {}),
    };

    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: "id",
      supportsAllDrives: true,
      supportsTeamDrives: true,
    });

    // Set public permissions
    try {
      await drive.permissions.create({
        fileId: folder.data.id,
        resource: { role: "writer", type: "anyone" },
        sendNotificationEmail: false,
        supportsAllDrives: true,
        supportsTeamDrives: true,
      });
    } catch (permError) {
      console.warn("Failed to set folder permissions:", permError.message);
    }

    return folder.data.id;
  } catch (error) {
    console.error(`Error creating folder ${folderName}:`, error);
    throw error;
  }
}

async function postHandler(request) {
  try {
    await connectDB();

    const { teamID, memberIndex } = await request.json();

    if (!teamID || memberIndex === undefined) {
      return NextResponse.json(
        createResponse(false, "TeamID and memberIndex are required"),
        { status: 400 }
      );
    }

    // Find the team
    const team = await Team.findOne({ teamID });
    if (!team) {
      return NextResponse.json(
        createResponse(false, "Team not found"),
        { status: 404 }
      );
    }

    // Check if folder structure is enabled
    if (!team.folderStructureEnabled) {
      return NextResponse.json(
        createResponse(false, "Folder structure not enabled for this team"),
        { status: 400 }
      );
    }

    // Check if member exists
    if (!team.members[memberIndex]) {
      return NextResponse.json(
        createResponse(false, "Member not found"),
        { status: 404 }
      );
    }

    // Check if member folder already exists
    if (team.folderStructure?.memberFolders?.[memberIndex]) {
      return NextResponse.json(
        createResponse(true, "Member folder already exists", {
          folderStructure: team.folderStructure,
        })
      );
    }

    // Get Drive client
    const drive = await getDriveClient();

    const member = team.members[memberIndex];
    const memberName =
      member.fullName?.replace(/[^a-zA-Z0-9_-]/g, "_") ||
      `Member_${memberIndex + 1}`;
    const memberFolderName = `Member_${memberIndex + 1}_${memberName}`;

    // Get membersSubmissionsFolderId from DB
    let membersSubmissionsFolderId =
      team.folderStructure?.membersSubmissionsFolderId;

    if (!membersSubmissionsFolderId) {
      // No folder structure at all — rebuild it from scratch
      console.log(
        `No membersSubmissionsFolderId found for team ${teamID}. Rebuilding full folder structure...`
      );

      const globalSettings = await GlobalSettings.findOne({
        settingType: "folderStructure",
      });
      if (!globalSettings || !globalSettings.driveLink) {
        return NextResponse.json(
          createResponse(
            false,
            "Drive folder not configured. Please ask admin to set up the drive link in settings."
          ),
          { status: 400 }
        );
      }

      const newStructure = await ensureTeamFolderStructure(
        drive,
        team,
        globalSettings
      );

      await Team.findOneAndUpdate(
        { teamID },
        { $set: { folderStructure: newStructure, updatedAt: new Date() } }
      );

      return NextResponse.json(
        createResponse(
          true,
          "Folder structure rebuilt and member folders created successfully",
          { folderStructure: newStructure }
        )
      );
    }

    // Verify that membersSubmissionsFolderId actually exists in Drive
    // If it returns 404, rebuild the entire folder structure
    try {
      await drive.files.get({
        fileId: membersSubmissionsFolderId,
        fields: "id",
        supportsAllDrives: true,
        supportsTeamDrives: true,
      });
    } catch (verifyError) {
      if (verifyError.code === 404 || verifyError.status === 404) {
        console.warn(
          `membersSubmissionsFolderId ${membersSubmissionsFolderId} not found in Drive (404). Rebuilding full folder structure...`
        );

        const globalSettings = await GlobalSettings.findOne({
          settingType: "folderStructure",
        });
        if (!globalSettings || !globalSettings.driveLink) {
          return NextResponse.json(
            createResponse(
              false,
              "Drive folder not configured. Please ask admin to set up the drive link in settings."
            ),
            { status: 400 }
          );
        }

        const newStructure = await ensureTeamFolderStructure(
          drive,
          team,
          globalSettings
        );

        await Team.findOneAndUpdate(
          { teamID },
          {
            $set: {
              folderStructure: newStructure,
              updatedAt: new Date(),
            },
          }
        );

        return NextResponse.json(
          createResponse(
            true,
            "Folder structure rebuilt and member folders created successfully",
            { folderStructure: newStructure }
          )
        );
      }
      // For other errors, rethrow
      throw verifyError;
    }

    // Parent folder exists — create only the new member folder
    console.log(
      `Creating member folder: ${memberFolderName} inside ${membersSubmissionsFolderId}`
    );

    const memberFolderId = await findOrCreateFolderRobust(
      drive,
      memberFolderName,
      membersSubmissionsFolderId
    );

    // Create certificate and resume subfolders
    const certificateFolderId = await findOrCreateFolderRobust(
      drive,
      "Certificates",
      memberFolderId
    );
    const resumeFolderId = await findOrCreateFolderRobust(
      drive,
      "Resume_LinkedIn",
      memberFolderId
    );

    // Update team's folder structure in DB
    if (!team.folderStructure.memberFolders) {
      team.folderStructure.memberFolders = {};
    }

    team.folderStructure.memberFolders[memberIndex] = {
      folderId: memberFolderId,
      certificateFolderId,
      resumeFolderId,
      memberName: member.fullName,
      memberEmail: member.email,
    };

    await team.save();

    console.log(
      `✅ Member folder created for ${memberFolderName} (ID: ${memberFolderId})`
    );

    return NextResponse.json(
      createResponse(true, "Member folder created successfully", {
        folderStructure: team.folderStructure,
      })
    );
  } catch (error) {
    console.error("Create member folder error:", error);
    return NextResponse.json(
      createResponse(false, `Failed to create member folder: ${error.message}`),
      { status: 500 }
    );
  }
}

export const POST = requireTeam(postHandler);

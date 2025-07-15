import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import { requireTeamAuth } from "@/middleware/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";
import { getDriveClient } from "@/lib/gdrive-utils";

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
          folderStructure: team.folderStructure
        })
      );
    }

    // Get Drive client
    const drive = await getDriveClient();

    // Create member folder structure
    const member = team.members[memberIndex];
    const memberName = member.fullName?.replace(/[^a-zA-Z0-9_-]/g, '_') || `Member_${memberIndex + 1}`;
    const memberFolderName = `Member_${memberIndex + 1}_${memberName}`;
    
    // Find or create folder utility function
    async function findOrCreateFolder(drive, folderName, parentId = null) {
      try {
        // Search for existing folder
        const query = parentId 
          ? `name='${folderName}' and parents in '${parentId}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
          : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        
        const response = await drive.files.list({
          q: query,
          fields: 'files(id, name)',
          spaces: 'drive'
        });

        if (response.data.files.length > 0) {
          return response.data.files[0].id;
        }

        // Create new folder
        const folderMetadata = {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: parentId ? [parentId] : undefined
        };

        const folder = await drive.files.create({
          resource: folderMetadata,
          fields: 'id'
        });

        return folder.data.id;
      } catch (error) {
        console.error(`Error creating folder ${folderName}:`, error);
        throw error;
      }
    }

    // Create member folder
    const membersSubmissionsFolderId = team.folderStructure.membersSubmissionsFolderId;
    if (!membersSubmissionsFolderId) {
      return NextResponse.json(
        createResponse(false, "Member submissions folder not found. Please contact admin."),
        { status: 400 }
      );
    }

    const memberFolderId = await findOrCreateFolder(drive, memberFolderName, membersSubmissionsFolderId);
    
    // Create certificate and resume folders
    const certificateFolderId = await findOrCreateFolder(drive, 'Certificates', memberFolderId);
    const resumeFolderId = await findOrCreateFolder(drive, 'Resume_LinkedIn', memberFolderId);

    // Update team's folder structure
    if (!team.folderStructure.memberFolders) {
      team.folderStructure.memberFolders = {};
    }

    team.folderStructure.memberFolders[memberIndex] = {
      folderId: memberFolderId,
      certificateFolderId,
      resumeFolderId,
      memberName: member.fullName,
      memberEmail: member.email
    };

    // Save updated team
    await team.save();

    return NextResponse.json(
      createResponse(true, "Member folder created successfully", {
        folderStructure: team.folderStructure
      })
    );

  } catch (error) {
    console.error("Create member folder error:", error);
    return NextResponse.json(
      createResponse(false, "Failed to create member folder"),
      { status: 500 }
    );
  }
}

export const POST = requireTeamAuth(postHandler);

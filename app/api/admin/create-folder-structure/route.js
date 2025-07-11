import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";
import GlobalSetting from "@/models/GlobalSettings";
import { getDriveClient, createDynamicFolderStructure } from "@/lib/gdrive-utils";

export async function POST(request) {
  try {
    const body = await request.json();
    const { teamID, folderStructure } = body;

    if (!teamID || !folderStructure) {
      return NextResponse.json(
        createResponse(false, "TeamID and folder structure are required"),
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find team
    const team = await Team.findOne({ teamID });
    if (!team) {
      return NextResponse.json(
        createResponse(false, "Team not found"),
        { status: 404 }
      );
    }

    // Get global settings
    const globalSettings = await GlobalSetting.findOne({ settingType: 'folderStructure' });
    if (!globalSettings || !globalSettings.driveLink) {
      return NextResponse.json(
        createResponse(false, "Global drive settings not configured"),
        { status: 500 }
      );
    }

    // Create drive client
    const drive = await getDriveClient();

    // Create dynamic folder structure
    const createdStructure = await createDynamicFolderStructure(
      drive, 
      team, 
      folderStructure, 
      globalSettings
    );

    // Update team with new folder structure
    await Team.findOneAndUpdate(
      { teamID },
      {
        $set: {
          folderStructure: createdStructure,
          folderStructureEnabled: true,
          customFolderStructure: folderStructure,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json(
      createResponse(true, "Folder structure created successfully", {
        folderStructure: createdStructure,
        shareableLink: createdStructure.shareableLink
      })
    );

  } catch (error) {
    console.error("Folder structure creation error:", error);
    return NextResponse.json(
      createResponse(false, "Failed to create folder structure"),
      { status: 500 }
    );
  }
}

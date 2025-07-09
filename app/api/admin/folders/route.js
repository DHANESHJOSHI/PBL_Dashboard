import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import { requireAdmin } from "@/middleware/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";
import { getDriveClient, createTeamFolderStructure, ensureTeamFolderStructure } from "@/lib/gdrive-utils";

async function getHandler(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    
    if (teamId) {
      // Get specific team folder structure
      const team = await Team.findOne({ teamID: teamId });
      if (!team) {
        return NextResponse.json(createResponse(false, "Team not found"), { status: 404 });
      }

      return NextResponse.json(createResponse(true, "Team folder structure retrieved", { 
        team,
        folderStructure: team.folderStructure || null
      }));
    } else {
      // Get all teams for folder management overview
      const teams = await Team.find({})
        .sort({ createdAt: -1 })
        .select('teamID teamName collegeName leaderName folderStructureEnabled folderStructure createdAt');

      return NextResponse.json(createResponse(true, "Teams retrieved for folder management", { 
        teams
      }));
    }
  } catch (error) {
    console.error("Get folder structure error:", error);
    return NextResponse.json(createResponse(false, "Internal server error"), { status: 500 });
  }
}

async function postHandler(request) {
  try {
    await connectDB();
    
    const { teamId, createStructure, enableSubmissions, disableSubmissions, customFolderNames } = await request.json();
    
    if (!teamId) {
      return NextResponse.json(createResponse(false, "Team ID is required"), { status: 400 });
    }

    const team = await Team.findOne({ teamID: teamId });
    if (!team) {
      return NextResponse.json(createResponse(false, "Team not found"), { status: 404 });
    }

    // Handle disable submissions
    if (disableSubmissions) {
      await Team.findOneAndUpdate(
        { teamID: teamId },
        { 
          $set: { 
            folderStructureEnabled: false,
            updatedAt: new Date()
          }
        }
      );

      return NextResponse.json(createResponse(true, "Submissions disabled successfully"));
    }

    // Handle enable submissions without creating structure
    if (enableSubmissions && !createStructure) {
      // Ensure the team has a proper folder structure before enabling
      let folderStructure = team.folderStructure;
      
      if (!folderStructure || !folderStructure.memberFolders) {
        console.log(`Creating folder structure for team ${teamId} before enabling submissions`);
        const drive = await getDriveClient();
        folderStructure = await ensureTeamFolderStructure(drive, team);
      }

      await Team.findOneAndUpdate(
        { teamID: teamId },
        { 
          $set: { 
            folderStructureEnabled: true,
            folderStructure: folderStructure,
            updatedAt: new Date()
          }
        }
      );

      return NextResponse.json(createResponse(true, "Submissions enabled successfully"));
    }

    // Handle create folder structure with custom names
    if (createStructure) {
      try {
        const drive = await getDriveClient();
        
        // Create actual folder structure (or mock for development)
        let folderStructure;
        
        if (process.env.NODE_ENV === 'development' && !process.env.GOOGLE_SERVICE_ACCOUNT_PATH) {
          // Use mock structure for development
          folderStructure = await ensureTeamFolderStructure(drive, team);
          // Apply custom names to mock structure
          if (customFolderNames) {
            folderStructure.customFolderNames = customFolderNames;
          }
        } else {
          // Create real Google Drive structure with custom names
          folderStructure = await createTeamFolderStructure(drive, team, customFolderNames);
        }
        
        // Update team with folder structure info AND enable submissions
        await Team.findOneAndUpdate(
          { teamID: teamId },
          { 
            $set: { 
              folderStructure: folderStructure,
              folderStructureEnabled: true,
              updatedAt: new Date()
            }
          }
        );

        return NextResponse.json(createResponse(true, "Folder structure created and submissions enabled successfully", { 
          folderStructure 
        }));
      } catch (error) {
        console.error("Error creating folder structure:", error);
        return NextResponse.json(createResponse(false, `Failed to create folder structure: ${error.message}`), { status: 500 });
      }
    }

    return NextResponse.json(createResponse(false, "Invalid request"), { status: 400 });
  } catch (error) {
    console.error("Folder structure operation error:", error);
    return NextResponse.json(createResponse(false, "Internal server error"), { status: 500 });
  }
}

export const GET = requireAdmin(getHandler);
export const POST = requireAdmin(postHandler);
import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import { requireAdmin } from "@/middleware/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";

async function postHandler(request) {
  try {
    await connectDB();
    
    // Find teams that have folderStructure but missing finalDeliverableFolderId
    const teamsToFix = await Team.find({
      "folderStructure": { $exists: true },
      "folderStructure.finalDeliverableFolderId": { $exists: false },
      "folderStructure.mainFolders.Final_Deliverable.id": { $exists: true }
    });

    console.log(`Found ${teamsToFix.length} teams to fix`);

    let fixedCount = 0;
    const errors = [];

    for (const team of teamsToFix) {
      try {
        // Get the finalDeliverableFolderId from mainFolders
        const finalDeliverableFolderId = team.folderStructure.mainFolders['Final_Deliverable']?.id;
        
        if (finalDeliverableFolderId) {
          await Team.findOneAndUpdate(
            { teamID: team.teamID },
            {
              $set: {
                "folderStructure.finalDeliverableFolderId": finalDeliverableFolderId,
                "updatedAt": new Date()
              }
            }
          );
          
          console.log(`Fixed team ${team.teamID}: added finalDeliverableFolderId ${finalDeliverableFolderId}`);
          fixedCount++;
        } else {
          errors.push(`Team ${team.teamID}: Final_Deliverable folder ID not found`);
        }
      } catch (error) {
        console.error(`Error fixing team ${team.teamID}:`, error);
        errors.push(`Team ${team.teamID}: ${error.message}`);
      }
    }

    return NextResponse.json(
      createResponse(true, `Fixed ${fixedCount} teams successfully`, {
        totalFound: teamsToFix.length,
        fixed: fixedCount,
        errors: errors.length > 0 ? errors : undefined
      })
    );

  } catch (error) {
    console.error("Fix final deliverable IDs error:", error);
    return NextResponse.json(
      createResponse(false, "Failed to fix final deliverable IDs"),
      { status: 500 }
    );
  }
}

export const POST = requireAdmin(postHandler);

import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import { requireAdmin } from "@/middleware/auth";
import connectDB from "@/lib/mongodb";
import GlobalSettings from "@/models/GlobalSettings";

async function getHandler(request) {
  try {
    await connectDB();
    
    let settings = await GlobalSettings.findOne({ settingType: 'folderStructure' });
    
    // Create default settings if none exist
    if (!settings) {
      settings = new GlobalSettings({
        settingType: 'folderStructure',
        folderStructure: {
          rootFolder: "IBM_SkillsBuild_Teams",
          conceptNoteFolder: "Concept_Note",
          finalDeliverableFolder: "Final_Deliverable",
          memberSubmissionsFolder: "Member_Submissions",
          certificatesFolder: "Certificates",
          resumeFolder: "Resume_LinkedIn",
          conceptNoteSubcategories: {
            problemStatement: "Problem_Statement",
            solutionApproach: "Solution_Approach",
            technicalArchitecture: "Technical_Architecture",
            implementationPlan: "Implementation_Plan",
            teamRoles: "Team_Roles"
          }
        },
        driveLink: ""
      });
      await settings.save();
    }

    return NextResponse.json(
      createResponse(true, "Global folder structure settings retrieved", { settings })
    );
  } catch (error) {
    console.error("Get global settings error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"), 
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    await connectDB();
    
    const { folderStructure, driveLink } = await request.json();
    
    if (!folderStructure) {
      return NextResponse.json(
        createResponse(false, "Folder structure data is required"), 
        { status: 400 }
      );
    }

    // Update or create global settings
    const settings = await GlobalSettings.findOneAndUpdate(
      { settingType: 'folderStructure' },
      { 
        folderStructure,
        driveLink: driveLink || "",
        updatedAt: new Date()
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    );

    return NextResponse.json(
      createResponse(true, "Global folder structure settings updated successfully", { settings })
    );
  } catch (error) {
    console.error("Update global settings error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"), 
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(getHandler);
export const POST = requireAdmin(postHandler);
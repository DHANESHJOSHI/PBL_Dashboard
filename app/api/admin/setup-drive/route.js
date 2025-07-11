import { NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/auth";
import connectDB from "@/lib/mongodb";
import GlobalSettings from "@/models/GlobalSettings";
import { createResponse } from "@/lib/utils";

async function handler(request) {
  try {
    await connectDB();
    
    if (request.method === 'POST') {
      const { driveLink } = await request.json();
      
      if (!driveLink) {
        return NextResponse.json(
          createResponse(false, "Drive link is required"),
          { status: 400 }
        );
      }
      
      // Validate the drive link format
      const driveLinkRegex = /https:\/\/drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)/;
      if (!driveLinkRegex.test(driveLink)) {
        return NextResponse.json(
          createResponse(false, "Invalid Google Drive folder link format"),
          { status: 400 }
        );
      }
      
      // Update or create GlobalSettings
      const globalSettings = await GlobalSettings.findOneAndUpdate(
        {},
        { 
          driveLink,
          updatedAt: new Date()
        },
        { 
          upsert: true, 
          new: true 
        }
      );
      
      return NextResponse.json(
        createResponse(true, "Drive link configured successfully", {
          driveLink: globalSettings.driveLink
        })
      );
    }
    
    // GET request - return current driveLink
    const globalSettings = await GlobalSettings.findOne();
    return NextResponse.json(
      createResponse(true, "Current drive settings", {
        driveLink: globalSettings?.driveLink || null
      })
    );
    
  } catch (error) {
    console.error("Setup drive error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"),
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handler);
export const POST = requireAdmin(handler);

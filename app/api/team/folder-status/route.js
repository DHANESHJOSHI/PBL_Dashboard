import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";
import { verifyTeamToken } from "@/lib/jwt";

export async function GET(request) {
  try {
    // Verify token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        createResponse(false, "No token provided"),
        { status: 401 }
      );
    }

    const decoded = verifyTeamToken(token);
    if (!decoded) {
      return NextResponse.json(
        createResponse(false, "Invalid token"),
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Find team
    const team = await Team.findOne({ teamID: decoded.teamID });
    if (!team) {
      return NextResponse.json(
        createResponse(false, "Team not found"),
        { status: 404 }
      );
    }

    // Return folder structure and status
    return NextResponse.json(
      createResponse(true, "Folder status retrieved successfully", {
        folderStructure: team.folderStructure,
        shareableLink: team.folderStructure?.shareableLink,
        teamID: team.teamID,
        teamName: team.teamName
      })
    );

  } catch (error) {
    console.error("Folder status retrieval error:", error);
    return NextResponse.json(
      createResponse(false, "Failed to retrieve folder status"),
      { status: 500 }
    );
  }
}

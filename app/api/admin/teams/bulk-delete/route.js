import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import { requireAdmin } from "@/middleware/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";

async function deleteHandler(request) {
  try {
    await connectDB();
    const { teamIds } = await request.json();

    if (!Array.isArray(teamIds) || teamIds.length === 0) {
      return NextResponse.json(
        createResponse(false, "Team IDs array is required"), 
        { status: 400 }
      );
    }

    const deletedTeams = await Team.deleteMany({ 
      teamID: { $in: teamIds } 
    });

    if (deletedTeams.deletedCount === 0) {
      return NextResponse.json(
        createResponse(false, "No teams were deleted"), 
        { status: 404 }
      );
    }

    return NextResponse.json(
      createResponse(true, `Successfully deleted ${deletedTeams.deletedCount} teams`, {
        deletedCount: deletedTeams.deletedCount
      })
    );
  } catch (error) {
    console.error("Bulk delete teams error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"), 
      { status: 500 }
    );
  }
}

export const DELETE = requireAdmin(deleteHandler);

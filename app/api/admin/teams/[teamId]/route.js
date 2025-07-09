import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import { requireAdmin } from "@/middleware/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";

async function getHandler(request, { params }) {
  try {
    await connectDB();
    const { teamId } = params;

    const team = await Team.findOne({ teamID: teamId });
    if (!team) {
      return NextResponse.json(
        createResponse(false, "Team not found"), 
        { status: 404 }
      );
    }

    return NextResponse.json(
      createResponse(true, "Team fetched successfully", { team })
    );
  } catch (error) {
    console.error("Get team error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"), 
      { status: 500 }
    );
  }
}

async function patchHandler(request, { params }) {
  try {
    await connectDB();
    const { teamId } = params;
    const updateData = await request.json();

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;

    // Ensure email is lowercase if provided
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
    }

    // Process members if provided
    if (updateData.members) {
      updateData.members = updateData.members.map(member => ({
        ...member,
        email: member.email ? member.email.toLowerCase() : member.email
      }));
    }

    const updatedTeam = await Team.findOneAndUpdate(
      { teamID: teamId },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedTeam) {
      return NextResponse.json(
        createResponse(false, "Team not found"), 
        { status: 404 }
      );
    }

    return NextResponse.json(
      createResponse(true, "Team updated successfully", { team: updatedTeam })
    );
  } catch (error) {
    console.error("Update team error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"), 
      { status: 500 }
    );
  }
}

async function deleteHandler(request, { params }) {
  try {
    await connectDB();
    const { teamId } = params;

    const deletedTeam = await Team.findOneAndDelete({ teamID: teamId });
    if (!deletedTeam) {
      return NextResponse.json(
        createResponse(false, "Team not found"), 
        { status: 404 }
      );
    }

    return NextResponse.json(
      createResponse(true, "Team deleted successfully", {
        deletedTeam: {
          teamID: deletedTeam.teamID,
          teamName: deletedTeam.teamName,
          leaderName: deletedTeam.leaderName
        }
      })
    );
  } catch (error) {
    console.error("Delete team error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"), 
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(getHandler);
export const PATCH = requireAdmin(patchHandler);
export const DELETE = requireAdmin(deleteHandler);
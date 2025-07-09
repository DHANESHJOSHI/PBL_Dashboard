import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import { requireTeam } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Team from "@/models/Team";

async function handler(request) {
  try {
    // User data is already available from middleware
    const teamData = request.user;

    // Connect to database to get fresh team data
    await connectDB();

    const team = await Team.findOne({ teamID: teamData.teamID });
    
    if (!team) {
      return NextResponse.json(
        createResponse(false, "Team not found"), 
        { status: 404 }
      );
    }

    const member = team.members.find((m) => m.email.toLowerCase() === teamData.memberEmail.toLowerCase());

    return NextResponse.json(
      createResponse(true, "Token verified", {
        team: {
          teamID: team.teamID,
          teamName: team.teamName,
          collegeName: team.collegeName,
          collegeId: team.collegeId,
          leaderName: team.leaderName,
          isLeader: member.isLeader,
          memberEmail: member.email,
          memberName: member.fullName,
        }
      })
    );
  } catch (error) {
    console.error("Team verify error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"), 
      { status: 500 }
    );
  }
}

export const GET = requireTeam(handler);
import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import { teamLoginSchema } from "@/lib/auth";
import { generateTeamToken } from "@/lib/jwt";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";
import { getDriveClient, createTeamFolderStructure } from "@/lib/gdrive-utils";

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate input using Zod
    const validationResult = teamLoginSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => err.message);
      return NextResponse.json(
        createResponse(false, "Validation failed", { errors }), 
        { status: 400 }
      );
    }

    const { email, collegeId } = validationResult.data;

    // Connect to database
    await connectDB();

    // Find team with matching member email and college ID
    const team = await Team.findOne({
      collegeId: collegeId,
      "members.email": email.toLowerCase().trim(),
    });

    if (!team) {
      return NextResponse.json(
        createResponse(false, "Invalid email or college ID. No team found with provided credentials"), 
        { status: 404 }
      );
    }

    // Find the specific member
    const member = team.members.find((m) => m.email.toLowerCase() === email.toLowerCase());

    if (!member) {
      return NextResponse.json(
        createResponse(false, "Member not found in the team"), 
        { status: 404 }
      );
    }

    // AUTO-CREATE FOLDER STRUCTURE ON LOGIN
    try {
      if (!team.folderStructureEnabled || !team.folderStructure) {
        console.log(`Auto-creating folder structure for team: ${team.teamID}`);

        const drive = await getDriveClient();
        const folderStructure = await createTeamFolderStructure(drive, team);

        // Update team with folder structure and enable submissions
        await Team.findOneAndUpdate(
          { teamID: team.teamID },
          {
            $set: {
              folderStructure: folderStructure,
              folderStructureEnabled: true,
              updatedAt: new Date()
            }
          }
        );

        console.log(`Folder structure auto-created for team: ${team.teamID}`);
        console.log(`Team folder link: ${folderStructure.teamFolderLink}`);
      }
    } catch (error) {
      console.error(`Failed to auto-create folder structure for team ${team.teamID}:`, error);
      // Don't fail login if folder creation fails
    }

    // Generate JWT token
    const token = generateTeamToken({
      teamID: team.teamID,
      memberEmail: member.email,
      isLeader: member.isLeader,
      collegeId: team.collegeId
    });

    return NextResponse.json(
      createResponse(true, "Login successful", {
        token,
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
    console.error("Team login error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"), 
      { status: 500 }
    );
  }
}
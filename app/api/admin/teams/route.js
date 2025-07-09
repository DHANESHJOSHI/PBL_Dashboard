import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import { requireAdmin } from "@/middleware/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";

async function getHandler(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Build search query
    let query = {};
    if (search) {
      query = {
        $or: [
          { teamID: { $regex: search, $options: 'i' } },
          { teamName: { $regex: search, $options: 'i' } },
          { collegeName: { $regex: search, $options: 'i' } },
          { leaderName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { collegeId: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const teams = await Team.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Team.countDocuments(query);

    return NextResponse.json(
      createResponse(true, "Teams fetched successfully", {
        teams,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      })
    );
  } catch (error) {
    console.error("Get teams error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"), 
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    await connectDB();
    
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['collegeName', 'collegeId', 'leaderName', 'email'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        createResponse(false, `Missing required fields: ${missingFields.join(', ')}`), 
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@gmail\.com$/i;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        createResponse(false, "Email must be a valid Gmail address"), 
        { status: 400 }
      );
    }

    // Check if team with same email already exists
    const existingTeam = await Team.findOne({ email: data.email.toLowerCase() });
    if (existingTeam) {
      return NextResponse.json(
        createResponse(false, "Team with this email already exists"), 
        { status: 400 }
      );
    }

    // Generate unique team ID
    const generateTeamID = () => {
      const prefix = "IBMSB2025";
      const randomString = Math.random().toString(36).substring(2, 12).toUpperCase();
      return `${prefix}${randomString}`;
    };

    let teamID;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      teamID = generateTeamID();
      const existingTeamWithID = await Team.findOne({ teamID });
      if (!existingTeamWithID) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        createResponse(false, "Could not generate unique team ID"), 
        { status: 500 }
      );
    }

    // Process members data
    const members = data.members || [];
    const processedMembers = members.map((member, index) => ({
      fullName: member.fullName || '',
      email: member.email || '',
      learningPlanCompletion: member.learningPlanCompletion || "0%",
      currentMarks: member.currentMarks || "0",
      certificateLink: member.certificateLink || "",
      certificateFile: member.certificateFile || "",
      resumeLink: member.resumeLink || "",
      resumeFile: member.resumeFile || "",
      linkedinLink: member.linkedinLink || "",
      portfolioLink: member.portfolioLink || "",
      githubLink: member.githubLink || "",
      additionalNotes: member.additionalNotes || "",
      isLeader: member.isLeader || false,
    }));

    // Ensure leader is in members array
    const hasLeader = processedMembers.some(member => member.isLeader);
    if (!hasLeader) {
      processedMembers.unshift({
        fullName: data.leaderName,
        email: data.email.toLowerCase(),
        learningPlanCompletion: "0%",
        currentMarks: "0",
        certificateLink: "",
        certificateFile: "",
        resumeLink: "",
        resumeFile: "",
        linkedinLink: "",
        portfolioLink: "",
        githubLink: "",
        additionalNotes: "",
        isLeader: true,
      });
    }

    // Create new team
    const newTeam = new Team({
      teamID,
      teamName: data.teamName || '',
      collegeName: data.collegeName,
      collegePincode: data.collegePincode || '',
      collegeId: data.collegeId,
      leaderName: data.leaderName,
      email: data.email.toLowerCase(),
      totalMembers: Math.max(1, parseInt(data.totalMembers) || processedMembers.length),
      totalFemaleMembers: Math.max(0, parseInt(data.totalFemaleMembers) || 0),
      folderStructureEnabled: false,
      members: processedMembers,
    });

    const savedTeam = await newTeam.save();

    return NextResponse.json(
      createResponse(true, "Team registered successfully", {
        team: savedTeam
      })
    );
  } catch (error) {
    console.error("Create team error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"), 
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(getHandler);
export const POST = requireAdmin(postHandler);
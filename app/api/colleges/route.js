import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";

export async function GET() {
  try {
    await connectDB();

    // Use MongoDB $group aggregation — runs at DB level, never loads 15k docs into Node.js
    // Old approach: Team.find().select(...).lean() → loads ALL 15k docs → slow/timeout
    // New approach: aggregation groups by collegeId at DB level → returns only unique colleges
    const colleges = await Team.aggregate([
      {
        $group: {
          _id: "$collegeId",
          collegeName: { $first: "$collegeName" },
          collegeId:   { $first: "$collegeId"   },
        },
      },
      {
        $match: {
          collegeId:   { $ne: null, $nin: ["", null] },
          collegeName: { $ne: null, $nin: ["", null] },
        },
      },
      {
        $project: { _id: 0, collegeId: 1, collegeName: 1 },
      },
      {
        $sort: { collegeName: 1 },
      },
    ]);

    return NextResponse.json(
      createResponse(true, "Colleges fetched successfully", { colleges })
    );

  } catch (error) {
    console.error("Fetch colleges error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"),
      { status: 500 }
    );
  }
}
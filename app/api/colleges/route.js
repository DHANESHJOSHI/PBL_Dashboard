import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";

export async function GET() {
  try {
    await connectDB();

    // Get unique college IDs and names from teams
    const Col_Data =  await Team.find()
                            .select('collegeId collegeName')  //get Only Relevant Fields
                            .lean(); //Improves Performance by returning plain JS Objects
      // console.log("College Data ",Col_Data); // Will Commmit on pRod Time 
    const uniqueCollegeMap = new Map();
    Col_Data.forEach(college => {
      if(!uniqueCollegeMap.has(college.collegeId)){
        uniqueCollegeMap.set(college.collegeId, {
          collegeId: college.collegeId,
          collegeName: college.collegeName
        });
      }
    });

    const colleges = Array.from(uniqueCollegeMap.values()).sort((a,b) => 
      a.collegeName.localeCompare(b.collegeName)
    );

    console.log("Data >>>>>>>>", colleges);

      // Trash Code Starts here 
    // const colleges = await Team.aggregate([
    //   {
    //     $group: {
    //       _id: "$collegeId",
    //       collegeName: { $first: "$collegeName" },
    //       collegeId: { $first: "$collegeId" }
    //     }
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       collegeId: "$_id",
    //       collegeName: 1
    //     }
    //   },
    //   {
    //     $sort: { collegeName: 1 }
    //   }
    // ]);

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
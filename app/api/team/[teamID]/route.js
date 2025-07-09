import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Team from "@/models/Team"
import { createResponse } from "@/lib/utils"

export async function GET(request, { params }) {
  try {
    await connectDB()
    const { teamID } = params

    const team = await Team.findOne({ teamID })

    if (!team) {
      return NextResponse.json(createResponse(false, "Team not found"), { status: 404 })
    }

    return NextResponse.json(createResponse(true, "Team data retrieved", { team }))
  } catch (error) {
    console.error("Get team error:", error)
    return NextResponse.json(createResponse(false, "Internal server error"), { status: 500 })
  }
}
export async function PUT(request, { params }) {
  try {
    await connectDB()
    const { teamID } = params
    const updateData = await request.json()

    
    if (Array.isArray(updateData.members)) {
      updateData.members = updateData.members.map((member) => ({
        ...member,
        certificateFile: typeof member.certificateFile === "string" ? member.certificateFile : "",
        resumeFile: typeof member.resumeFile === "string" ? member.resumeFile : "",
        linkedinLink: typeof member.linkedinLink === "string" ? member.linkedinLink : "",
      }))
    }

    
    const updatedTeam = await Team.findOneAndUpdate(
      { teamID },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )

    if (!updatedTeam) {
      return NextResponse.json(createResponse(false, "Team not found"), { status: 404 })
    }

    return NextResponse.json(createResponse(true, "Team updated successfully", { team: updatedTeam }))
  } catch (error) {
    console.error("Update team error:", error)
    return NextResponse.json(createResponse(false, "Internal server error"), { status: 500 })
  }
}

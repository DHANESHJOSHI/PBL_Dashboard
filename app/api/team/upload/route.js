import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";
import { getDriveClient, uploadToTeamFolder } from "@/lib/gdrive-utils";
import { createResponse } from "@/lib/utils";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(createResponse(false, "Authorization required"), { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json(createResponse(false, "Invalid token"), { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")
    const fileType = formData.get("type")
    const teamID = formData.get("teamID")
    const memberEmail = formData.get("memberEmail")
    const subCategory = formData.get("subCategory") || null

    if (!file || !fileType || !teamID || !memberEmail) {
      return NextResponse.json(createResponse(false, "Missing required parameters"), { status: 400 })
    }

    const allowedTypes = {
      certificate: [".pdf", ".jpg", ".jpeg", ".png"],
      resume: [".pdf", ".doc", ".docx"],
      conceptNote: [".pdf", ".doc", ".docx"],
      finalDeliverable: [".pdf", ".doc", ".docx"]
    }

    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.substring(fileName.lastIndexOf("."))

    if (!allowedTypes[fileType]?.includes(fileExtension)) {
      return NextResponse.json(createResponse(false, `Invalid file type for ${fileType}`), { status: 400 })
    }

    await connectDB()
    const team = await Team.findOne({ teamID })
    if (!team) {
      return NextResponse.json(createResponse(false, "Team not found"), { status: 404 })
    }

    const memberIndex = team.members.findIndex(m => m.email.toLowerCase() === memberEmail.toLowerCase())
    if (memberIndex === -1) {
      return NextResponse.json(createResponse(false, "Member not found in team"), { status: 404 })
    }

    const drive = await getDriveClient()

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const fileData = {
      buffer: fileBuffer,
      originalname: file.name,
      mimetype: file.type || "application/octet-stream"
    }

    const result = await uploadToTeamFolder(
      drive,
      team.toObject(),
      fileData,
      fileType,
      subCategory,
      memberIndex
    )

    return NextResponse.json(createResponse(true, "File uploaded successfully", result))
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(createResponse(false, `Upload failed: ${error.message}`), { status: 500 })
  }
}

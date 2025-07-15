import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { createResponse } from "@/lib/utils"
import { verifyToken } from "@/lib/jwt"

export async function POST(request) {
  try {
    // Check authorization
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
    const fileType = formData.get("type") // 'certificate' or 'resume'
    const teamID = formData.get("teamID")
    const memberEmail = formData.get("memberEmail")

    if (!file) {
      return NextResponse.json(createResponse(false, "No file uploaded"), { status: 400 })
    }

    if (!fileType || !teamID || !memberEmail) {
      return NextResponse.json(createResponse(false, "Missing required parameters"), { status: 400 })
    }

    // Validate file type
    const allowedTypes = {
      certificate: [".pdf", ".jpg", ".jpeg", ".png"],
      resume: [".pdf", ".doc", ".docx"],
    }

    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.substring(fileName.lastIndexOf("."))

    if (!allowedTypes[fileType]?.includes(fileExtension)) {
      return NextResponse.json(createResponse(false, `Invalid file type for ${fileType}`), { status: 400 })
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), "public", "uploads", teamID)
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedEmail = memberEmail.replace(/[^a-zA-Z0-9]/g, "_")
    const newFileName = `${fileType}_${sanitizedEmail}_${timestamp}${fileExtension}`
    const filePath = join(uploadDir, newFileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Generate public URL
    const fileUrl = `/uploads/${teamID}/${newFileName}`

    return NextResponse.json(
      createResponse(true, "File uploaded successfully", {
        fileName: newFileName,
        fileUrl,
        fileType,
        originalName: file.name,
      }),
    )
  } catch (error) {
    console.error("File upload error:", error)
    return NextResponse.json(createResponse(false, "File upload failed"), { status: 500 })
  }
}

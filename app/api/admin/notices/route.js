import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import { requireAdmin } from "@/middleware/auth";
import connectDB from "@/lib/mongodb";
import Notice from "@/models/Notice";

async function getHandler(request) {
  try {
    await connectDB();
    
    const notices = await Notice.find({})
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(
      createResponse(true, "Notices fetched successfully", { notices })
    );
  } catch (error) {
    console.error("Get notices error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"), 
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    await connectDB();
    
    const { title, content } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json(
        createResponse(false, "Title and content are required"), 
        { status: 400 }
      );
    }

    const notice = new Notice({
      title: title.trim(),
      content: content.trim()
    });

    await notice.save();

    return NextResponse.json(
      createResponse(true, "Notice created successfully", { notice })
    );
  } catch (error) {
    console.error("Create notice error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"), 
      { status: 500 }
    );
  }
}

export const GET = getHandler; // Public endpoint for notices
export const POST = requireAdmin(postHandler);
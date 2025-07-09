import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import { requireAdmin } from "@/middleware/auth";
import connectDB from "@/lib/mongodb";
import Notice from "@/models/Notice";

async function patchHandler(request, { params }) {
  try {
    await connectDB();
    const { noticeId } = params;
    const { title, content } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json(
        createResponse(false, "Title and content are required"), 
        { status: 400 }
      );
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      noticeId,
      { 
        title: title.trim(),
        content: content.trim(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedNotice) {
      return NextResponse.json(
        createResponse(false, "Notice not found"), 
        { status: 404 }
      );
    }

    return NextResponse.json(
      createResponse(true, "Notice updated successfully", { notice: updatedNotice })
    );
  } catch (error) {
    console.error("Update notice error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"), 
      { status: 500 }
    );
  }
}

async function deleteHandler(request, { params }) {
  try {
    await connectDB();
    const { noticeId } = params;

    const deletedNotice = await Notice.findByIdAndDelete(noticeId);
    
    if (!deletedNotice) {
      return NextResponse.json(
        createResponse(false, "Notice not found"), 
        { status: 404 }
      );
    }

    return NextResponse.json(
      createResponse(true, "Notice deleted successfully", { 
        deletedNotice: {
          _id: deletedNotice._id,
          title: deletedNotice.title
        }
      })
    );
  } catch (error) {
    console.error("Delete notice error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"), 
      { status: 500 }
    );
  }
}

export const PATCH = requireAdmin(patchHandler);
export const DELETE = requireAdmin(deleteHandler);
import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import { requireAdmin } from "@/middleware/auth";

async function handler(request) {
  try {
    // User data is already available from middleware
    const adminData = request.user;

    return NextResponse.json(
      createResponse(true, "Token verified", {
        admin: {
          adminId: adminData.adminId,
          email: adminData.email,
          role: adminData.role
        }
      })
    );
  } catch (error) {
    console.error("Admin verify error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"), 
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handler);
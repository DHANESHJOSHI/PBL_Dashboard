import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import { adminLoginSchema } from "@/lib/auth";
import { generateAdminToken } from "@/lib/jwt";
import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate input using Zod
    const validationResult = adminLoginSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => err.message);
      return NextResponse.json(
        createResponse(false, "Validation failed", { errors }), 
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Connect to database
    await connectDB();

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      return NextResponse.json(
        createResponse(false, "Invalid email or password"), 
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        createResponse(false, "Invalid email or password"), 
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateAdminToken({
      adminId: admin._id,
      email: admin.email,
      role: admin.role
    });

    // Return success response with token
    return NextResponse.json(
      createResponse(true, "Admin login successful", { 
        token,
        admin: {
          role: admin.role,
          email: admin.email,
          adminId: admin._id 
        }
      })
    );

  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"), 
      { status: 500 }
    );
  }
}
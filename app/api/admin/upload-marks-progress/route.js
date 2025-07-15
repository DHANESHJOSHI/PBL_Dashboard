import { NextResponse } from "next/server";
import { createResponse } from "@/lib/utils";
import { requireAdmin } from "@/middleware/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";
import { parse } from "csv-parse/sync";

async function postHandler(request) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        createResponse(false, "No file provided"),
        { status: 400 }
      );
    }
    
    // Read file content
    const buffer = await file.arrayBuffer();
    const csvContent = Buffer.from(buffer).toString('utf8');
    
    // Parse CSV
    let records;
    try {
      records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } catch (parseError) {
      return NextResponse.json(
        createResponse(false, "Invalid CSV format"),
        { status: 400 }
      );
    }
    
    if (records.length === 0) {
      return NextResponse.json(
        createResponse(false, "CSV file is empty"),
        { status: 400 }
      );
    }
    
    // Validate required columns
    const requiredColumns = ['email', 'progress', 'marks'];
    const csvColumns = Object.keys(records[0]).map(col => col.toLowerCase());
    
    const missingColumns = requiredColumns.filter(col => 
      !csvColumns.includes(col) && !csvColumns.includes(col.replace('_', ''))
    );
    
    if (missingColumns.length > 0) {
      return NextResponse.json(
        createResponse(false, `Missing required columns: ${missingColumns.join(', ')}. Required columns are: email, progress, marks`),
        { status: 400 }
      );
    }
    
    // Normalize column names
    const normalizedRecords = records.map(record => {
      const normalized = {};
      for (const [key, value] of Object.entries(record)) {
        const normalizedKey = key.toLowerCase().trim();
        if (normalizedKey === 'email') {
          normalized.email = value.toLowerCase().trim();
        } else if (normalizedKey === 'progress' || normalizedKey === 'learningplancompletion') {
          normalized.progress = value.trim();
        } else if (normalizedKey === 'marks' || normalizedKey === 'currentmarks') {
          normalized.marks = value.trim();
        }
      }
      return normalized;
    });
    
    // Process updates
    let updatedCount = 0;
    const errors = [];
    
    for (const record of normalizedRecords) {
      const { email, progress, marks } = record;
      
      if (!email) {
        errors.push(`Row skipped: missing email`);
        continue;
      }
      
      try {
        // Find teams with this member email
        const teams = await Team.find({
          "members.email": email
        });
        
        if (teams.length === 0) {
          errors.push(`Email not found: ${email}`);
          continue;
        }
        
        // Update each team that has this member
        for (const team of teams) {
          let updated = false;
          
          team.members.forEach(member => {
            if (member.email.toLowerCase() === email) {
              // Update progress if provided
              if (progress !== undefined && progress !== '') {
                let formattedProgress = progress;
                if (!formattedProgress.includes('%')) {
                  formattedProgress += '%';
                }
                member.learningPlanCompletion = formattedProgress;
                updated = true;
              }
              
              // Update marks if provided
              if (marks !== undefined && marks !== '') {
                member.currentMarks = marks;
                updated = true;
              }
            }
          });
          
          if (updated) {
            team.updatedAt = new Date();
            await team.save();
          }
        }
        
        updatedCount++;
        
      } catch (error) {
        console.error(`Error updating ${email}:`, error);
        errors.push(`Error updating ${email}: ${error.message}`);
      }
    }
    
    const response = {
      updated: updatedCount,
      total: normalizedRecords.length,
      errors: errors.length > 0 ? errors : undefined
    };
    
    return NextResponse.json(
      createResponse(true, `Successfully updated ${updatedCount} out of ${normalizedRecords.length} records`, response)
    );
    
  } catch (error) {
    console.error("Upload marks/progress error:", error);
    return NextResponse.json(
      createResponse(false, "Internal server error"),
      { status: 500 }
    );
  }
}

export const POST = requireAdmin(postHandler);

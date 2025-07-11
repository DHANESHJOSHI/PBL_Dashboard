import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Team from "@/models/Team"
import { createResponse } from "@/lib/utils"

export async function GET(request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const collegeName = searchParams.get('collegeName')
    const collegeId = searchParams.get('collegeId')

    let query = {}
    
    // If specific college parameters are provided
    if (collegeName) {
      query.collegeName = { $regex: new RegExp(collegeName, 'i') }
    }
    if (collegeId) {
      query.collegeId = collegeId
    }

    // Get all teams
    const teams = await Team.find(query).sort({ collegeName: 1, createdAt: -1 })

    // Group teams by college
    const collegeGroups = {}
    
    teams.forEach(team => {
      const collegeKey = `${team.collegeName}_${team.collegeId}`
      
      if (!collegeGroups[collegeKey]) {
        collegeGroups[collegeKey] = {
          collegeName: team.collegeName,
          collegeId: team.collegeId,
          collegePincode: team.collegePincode || '',
          teams: [],
          totalTeams: 0,
          totalMembers: 0,
          totalFemaleMembers: 0,
          teamsWithFolderStructure: 0,
          conceptNoteSubmissions: 0,
          finalDeliverableSubmissions: 0
        }
      }
      
      // Add team to college group
      collegeGroups[collegeKey].teams.push(team)
      collegeGroups[collegeKey].totalTeams++
      collegeGroups[collegeKey].totalMembers += (team.totalMembers || 0)
      collegeGroups[collegeKey].totalFemaleMembers += (team.totalFemaleMembers || 0)
      
      if (team.folderStructureEnabled) {
        collegeGroups[collegeKey].teamsWithFolderStructure++
      }
      if (team.submitConceptNote) {
        collegeGroups[collegeKey].conceptNoteSubmissions++
      }
      if (team.submitFinalDeliverable) {
        collegeGroups[collegeKey].finalDeliverableSubmissions++
      }
    })

    // Convert to array and sort by college name
    const collegeData = Object.values(collegeGroups).sort((a, b) => 
      a.collegeName.localeCompare(b.collegeName)
    )

    return NextResponse.json(createResponse(true, "Teams grouped by college", {
      totalColleges: collegeData.length,
      totalTeams: teams.length,
      colleges: collegeData
    }))

  } catch (error) {
    console.error("Get teams by college error:", error)
    return NextResponse.json(createResponse(false, "Internal server error"), { status: 500 })
  }
}

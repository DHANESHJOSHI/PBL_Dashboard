import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Team from "@/models/Team"
import { createResponse } from "@/lib/utils"

export async function GET(request, { params }) {
try {
await connectDB()
const { teamID } = params
const { searchParams } = new URL(request.url)
const groupByCollege = searchParams.get('groupByCollege')
    const includeMembers = searchParams.get('includeMembers')

    const team = await Team.findOne({ teamID })

if (!team) {
  return NextResponse.json(createResponse(false, "Team not found"), { status: 404 })
    }

// If groupByCollege is requested, get all teams from the same college
if (groupByCollege === 'true') {
const collegeTeams = await Team.find({ 
collegeName: team.collegeName,
  collegeId: team.collegeId 
      }).sort({ teamName: 1, createdAt: -1 })

// Calculate enhanced statistics based on actual member data
const totalActualMembers = collegeTeams.reduce((sum, t) => sum + (t.members?.length || 0), 0)
const totalCertificateSubmissions = collegeTeams.reduce((sum, t) => {
return sum + (t.members?.filter(m => m.certificateFile || m.certificateLink).length || 0)
}, 0)
const totalResumeSubmissions = collegeTeams.reduce((sum, t) => {
return sum + (t.members?.filter(m => m.resumeFile || m.resumeLink).length || 0)
}, 0)
const totalLinkedInProfiles = collegeTeams.reduce((sum, t) => {
return sum + (t.members?.filter(m => m.linkedinLink).length || 0)
}, 0)

// Group teams by college with enhanced data
      const collegeData = {
  collegeName: team.collegeName,
collegeId: team.collegeId,
collegePincode: team.collegePincode,
  internshipName: team.internshipName,
    totalTeams: collegeTeams.length,
        totalMembers: collegeTeams.reduce((sum, t) => sum + (t.totalMembers || 0), 0),
    totalActualMembers: totalActualMembers,
      totalFemaleMembers: collegeTeams.reduce((sum, t) => sum + (t.totalFemaleMembers || 0), 0),
    teamsWithFolderStructure: collegeTeams.filter(t => t.folderStructureEnabled).length,
    conceptNoteSubmissions: collegeTeams.filter(t => t.submitConceptNote).length,
      finalDeliverableSubmissions: collegeTeams.filter(t => t.submitFinalDeliverable).length,
        totalCertificateSubmissions: totalCertificateSubmissions,
        totalResumeSubmissions: totalResumeSubmissions,
        totalLinkedInProfiles: totalLinkedInProfiles,
        teams: includeMembers === 'true' ? collegeTeams : collegeTeams.map(t => ({
          ...t.toObject(),
          membersSummary: {
            total: t.members?.length || 0,
            withCertificates: t.members?.filter(m => m.certificateFile || m.certificateLink).length || 0,
            withResumes: t.members?.filter(m => m.resumeFile || m.resumeLink).length || 0,
            withLinkedIn: t.members?.filter(m => m.linkedinLink).length || 0,
            leader: t.members?.find(m => m.isLeader)?.fullName || t.leaderName
          },
          members: undefined // Remove full member details unless requested
        }))
      }

      return NextResponse.json(createResponse(true, "College teams data retrieved", { 
        currentTeam: team,
        collegeData 
      }))
    }

    // Return single team data with enhanced member details
    const teamData = {
      ...team.toObject(),
      memberStats: {
        totalMembers: team.members?.length || 0,
        expectedMembers: team.totalMembers || 0,
        membersWithCertificates: team.members?.filter(m => m.certificateFile || m.certificateLink).length || 0,
        membersWithResumes: team.members?.filter(m => m.resumeFile || m.resumeLink).length || 0,
        membersWithLinkedIn: team.members?.filter(m => m.linkedinLink).length || 0,
        leaderEmail: team.members?.find(m => m.isLeader)?.email || team.email,
        leaderName: team.members?.find(m => m.isLeader)?.fullName || team.leaderName,
        completionRate: {
          learningPlan: team.members?.filter(m => m.learningPlanCompletion && m.learningPlanCompletion !== "0%").length || 0,
          certificates: team.members?.filter(m => m.certificateFile || m.certificateLink).length || 0,
          resumes: team.members?.filter(m => m.resumeFile || m.resumeLink).length || 0
        }
      }
    }

    return NextResponse.json(createResponse(true, "Team data retrieved", { team: teamData }))
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

    // Find the existing team first
    const existingTeam = await Team.findOne({ teamID })
    if (!existingTeam) {
      return NextResponse.json(createResponse(false, "Team not found"), { status: 404 })
    }

    // Handle member updates properly
    if (Array.isArray(updateData.members)) {
      updateData.members = updateData.members.map((member, index) => {
        const existingMember = existingTeam.members[index] || {}
        return {
          ...existingMember.toObject?.() || existingMember,
          ...member,
          fullName: member.fullName || member.memberName || existingMember.fullName,
          email: (member.email || existingMember.email)?.toLowerCase(),
          certificateFile: typeof member.certificateFile === "string" ? member.certificateFile : (existingMember.certificateFile || ""),
          resumeFile: typeof member.resumeFile === "string" ? member.resumeFile : (existingMember.resumeFile || ""),
          linkedinLink: typeof member.linkedinLink === "string" ? member.linkedinLink : (existingMember.linkedinLink || ""),
          portfolioLink: typeof member.portfolioLink === "string" ? member.portfolioLink : (existingMember.portfolioLink || ""),
          githubLink: typeof member.githubLink === "string" ? member.githubLink : (existingMember.githubLink || ""),
          learningPlanCompletion: member.learningPlanCompletion || existingMember.learningPlanCompletion || "0%",
          currentMarks: member.currentMarks || existingMember.currentMarks || "0",
          additionalNotes: member.additionalNotes || existingMember.additionalNotes || "",
          isLeader: member.isLeader !== undefined ? member.isLeader : (existingMember.isLeader || false)
        }
      })

      // Update team leader info if leader changed
      const newLeader = updateData.members.find(m => m.isLeader)
      if (newLeader) {
        updateData.leaderName = newLeader.fullName
        updateData.email = newLeader.email
      }

      // Update total members count
      updateData.totalMembers = updateData.members.length
    }

    // Handle other team field updates
    const allowedUpdates = [
      'teamName', 'collegeName', 'collegeId', 'collegePincode', 'internshipName',
      'leaderName', 'email', 'totalMembers', 'totalFemaleMembers', 
      'folderStructureEnabled', 'submitConceptNote', 'submitFinalDeliverable',
      'conceptNoteSubmission', 'finalDeliverableSubmission', 'members'
    ]

    const filteredUpdateData = {}
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdateData[key] = updateData[key]
      }
    })

    const updatedTeam = await Team.findOneAndUpdate(
      { teamID },
      { 
        ...filteredUpdateData, 
        updatedAt: new Date() 
      },
      { new: true }
    )

    // Return enhanced team data
    const teamData = {
      ...updatedTeam.toObject(),
      memberStats: {
        totalMembers: updatedTeam.members?.length || 0,
        expectedMembers: updatedTeam.totalMembers || 0,
        membersWithCertificates: updatedTeam.members?.filter(m => m.certificateFile || m.certificateLink).length || 0,
        membersWithResumes: updatedTeam.members?.filter(m => m.resumeFile || m.resumeLink).length || 0,
        membersWithLinkedIn: updatedTeam.members?.filter(m => m.linkedinLink).length || 0,
        leaderEmail: updatedTeam.members?.find(m => m.isLeader)?.email || updatedTeam.email,
        leaderName: updatedTeam.members?.find(m => m.isLeader)?.fullName || updatedTeam.leaderName
      }
    }

    return NextResponse.json(createResponse(true, "Team updated successfully", { team: teamData }))
  } catch (error) {
    console.error("Update team error:", error)
    return NextResponse.json(createResponse(false, "Internal server error"), { status: 500 })
  }
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import SubmissionPopup from "@/components/submission-popup"
import Header from "@/components/team/Header"
import WelcomeSection from "@/components/team/WelcomeSection"
import TeamMembersList from "@/components/team/TeamMembersList"
import Footer from "@/components/team/Footer"
import Loading from "@/components/team/Loading"
import Error from "@/components/team/Error"


export default function TeamDashboard() {
  const router = useRouter()
  const [teamData, setTeamData] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isLeader, setIsLeader] = useState(false)
  const [memberEmail, setMemberEmail] = useState("")
  const [popupOpen, setPopupOpen] = useState(false)
  const [popupType, setPopupType] = useState("")
  const [currentMemberIndex, setCurrentMemberIndex] = useState(null)


  useEffect(() => {
    const teamLoggedIn = localStorage.getItem("teamLoggedIn")
    const teamToken = localStorage.getItem("teamToken")
    const storedTeamData = localStorage.getItem("teamData")

    if (!teamLoggedIn || !teamToken || !storedTeamData) {
      router.push("/")
      return
    }

    try {
      const parsedTeamData = JSON.parse(storedTeamData)
      setIsLeader(parsedTeamData.isLeader || parsedTeamData.isAlternateLeader)
      setMemberEmail(parsedTeamData.memberEmail)
      fetchTeamData(parsedTeamData.teamID)
    } catch (error) {
      console.error("Error parsing team data:", error)
      router.push("/")
    }
  }, [router])

  const fetchTeamData = async (teamID) => {
    try {
      const token = localStorage.getItem("teamToken")
      const response = await fetch(`/api/team/${teamID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()

      if (data.success) {
        setTeamData(data.data.team)
        // Check if the current user is still leader/alternate
        const currentMember = data.data.team.members.find(m => m.email === memberEmail)
        if (currentMember) {
          setIsLeader(currentMember.isLeader || currentMember.isAlternateLeader)
        }
      } else {
        toast.error("Failed to load team data")
        router.push("/")
      }
    } catch (error) {
      console.error("Fetch team data error:", error)
      toast.error("Failed to load team data")
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (memberIndex) => {
    if (!isLeader) {
      toast.error("Only team leader can edit member details")
      return
    }
    setEditingMember(editingMember === memberIndex ? null : memberIndex)
  }

  const handleMemberUpdate = (memberIndex, field, value) => {
    const updatedTeam = { ...teamData }
    updatedTeam.members[memberIndex][field] = value
    setTeamData(updatedTeam)
  }

  const handleAssignRole = async (memberIndex, roleType) => {
    if (!isLeader) {
      toast.error("Only team leader can assign roles")
      return
    }

    const updatedTeam = { ...teamData }
    
    if (roleType === "leader") {
      // Clear current leader
      updatedTeam.members.forEach(m => m.isLeader = false)
      // Set new leader
      updatedTeam.members[memberIndex].isLeader = true
      toast.info("Leadership transferred. Click 'Save Changes' to confirm.")
    } else if (roleType === "alternate") {
      // Toggle alternate leader
      updatedTeam.members[memberIndex].isAlternateLeader = !updatedTeam.members[memberIndex].isAlternateLeader
      toast.info("Alternate Leader role updated. Click 'Save Changes' to confirm.")
    }
    
    setTeamData(updatedTeam)
    setEditingMember(memberIndex)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem("teamToken")
      const response = await fetch(`/api/team/${teamData.teamID}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(teamData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Team data updated successfully!")
        setEditingMember(null)
      } else {
        toast.error("Failed to update team data")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmissionClick = (memberIndex, type) => {
    // Check if folder structure is enabled (boolean field)
    if (!teamData.folderStructureEnabled) {
      toast.error("Folder structure not set up. Please contact admin to set up Google Drive folders for your team.")
      return
    }
    
    // Check if member folder exists by index, if not create it
    if (teamData.folderStructure && teamData.folderStructure.memberFolders && teamData.folderStructure.memberFolders[memberIndex]) {
      setCurrentMemberIndex(memberIndex)
      setPopupType(type)
      setPopupOpen(true)
    } else {
      // Create member folder and then open popup
      handleCreateMemberFolder(memberIndex, type)
    }
  }

  const handleCreateMemberFolder = async (memberIndex, type) => {
    try {
      const token = localStorage.getItem("teamToken")
      const response = await fetch(`/api/team/create-member-folder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teamID: teamData.teamID,
          memberIndex: memberIndex
        })
      })

      const data = await response.json()

      if (data.success) {
        // Refresh team data to get updated folder structure
        await fetchTeamData(teamData.teamID)
        toast.success("Member folder created successfully!")
        
        // Now open the popup instead of redirecting
        setCurrentMemberIndex(memberIndex)
        setPopupType(type)
        setPopupOpen(true)
      } else {
        toast.error("Failed to create member folder. Please contact admin.")
      }
    } catch (error) {
      console.error("Create member folder error:", error)
      toast.error("Failed to create member folder. Please contact admin.")
    }
  }

  const handleSubmissionSave = (submissionData) => {
    // Refresh team data to get updated submission status
    fetchTeamData(teamData.teamID)
    toast.success("Submission saved successfully!")
  }

  const handleLogout = () => {
    localStorage.removeItem("teamLoggedIn")
    localStorage.removeItem("teamToken")
    localStorage.removeItem("teamData")
    router.push("/")
  }

  const handleSubmitConceptNote = () => {
    if (!isLeader) {
      toast.error("Only team leader can submit concept note")
      return
    }

    // Check if folder structure is enabled (boolean field)
    if (!teamData.folderStructureEnabled) {
      toast.error("Folder structure not set up. Please contact admin to set up Google Drive folders for your team.")
      return
    }

    setCurrentMemberIndex(null)
    setPopupType("conceptNote")
    setPopupOpen(true)
  }

  const handleSubmitFinalDeliverable = () => {
    if (!isLeader) {
      toast.error("Only team leader can submit final deliverable")
      return
    }

    // Check if folder structure is enabled (boolean field)
    if (!teamData.folderStructureEnabled) {
      toast.error("Folder structure not set up. Please contact admin to set up Google Drive folders for your team.")
      return
    }

    setCurrentMemberIndex(null)
    setPopupType("finalDeliverable")
    setPopupOpen(true)
  }

  if (isLoading) {
    return <Loading />
  }

  if (!teamData) {
    return <Error />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <WelcomeSection 
          teamData={teamData}
          isLeader={isLeader}
          handleSubmitConceptNote={handleSubmitConceptNote}
          handleSubmitFinalDeliverable={handleSubmitFinalDeliverable}
        />

        {/* Team Members */}
        <TeamMembersList 
          teamData={teamData}
          isLeader={isLeader}
          editingMember={editingMember}
          isSaving={isSaving}
          handleEdit={handleEdit}
          handleMemberUpdate={handleMemberUpdate}
          handleAssignRole={handleAssignRole}
          handleSave={handleSave}
          handleSubmissionClick={handleSubmissionClick}
        />

        {/* Footer */}
        <Footer handleLogout={handleLogout} />
      </div>

      {/* Submission Popup */}
      <SubmissionPopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        onSave={handleSubmissionSave}
        type={popupType}
        initialData={currentMemberIndex !== null ? { ...teamData.members[currentMemberIndex], memberIndex: currentMemberIndex } : {}}
        courseName={teamData?.courseName}
        internshipName={teamData?.internshipName}
      />
    </div>
  )
}
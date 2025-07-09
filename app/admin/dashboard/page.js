"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAuth";
import { AdminSidebar } from "@/components/admin-sidebar";
import TeamDriveLinkModal from "@/components/team-drive-link-modal";
import GlobalFolderStructureModal from "@/components/global-folder-structure-modal";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Import our new components
import AdminHeader from "@/components/admin/AdminHeader";
import TeamsView from "@/components/admin/TeamsView";
import NoticesView from "@/components/admin/NoticesView";
import FoldersView from "@/components/admin/FoldersView";

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout } = useAdminAuth();
  const [activeView, setActiveView] = useState("teams");
  const [teams, setTeams] = useState([]);
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalTeams, setTotalTeams] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  // Notice management state
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  // Folder management state
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [folderLoading, setFolderLoading] = useState(false);
  const [teamDriveLinkModalOpen, setTeamDriveLinkModalOpen] = useState(false);
  const [globalFolderStructureModalOpen, setGlobalFolderStructureModalOpen] = useState(false);
  const [selectedTeamForModal, setSelectedTeamForModal] = useState(null);

  // Team registration form state
  const [teamForm, setTeamForm] = useState({
    step: 1,
    data: {
      teamName: "",
      collegeName: "",
      collegePincode: "",
      collegeId: "",
      totalMembers: 1,
      totalFemaleMembers: 0,
      members: [
        {
          fullName: "",
          email: "",
          learningPlanCompletion: "0%",
          currentMarks: "0",
          isLeader: true,
        },
      ],
    },
  });

  // Notice form state
  const [noticeForm, setNoticeForm] = useState({ title: "", content: "" });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/admin");
      return;
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeView === "teams") {
        fetchTeams();
      } else if (activeView === "notices") {
        fetchNotices();
      } else if (activeView === "folders") {
        fetchTeams();
      }
    }
  }, [isAuthenticated, activeView, page, limit, searchTerm]);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const response = await fetch(`/api/admin/teams?page=${page}&limit=${limit}${searchParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTeams(data.data.teams);
        setTotalTeams(data.data.total);
      } else {
        toast.error("Failed to fetch teams");
      }
    } catch (error) {
      console.error("Fetch teams error:", error);
      toast.error("Failed to fetch teams");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await fetch("/api/admin/notices");
      const data = await response.json();
      if (data.success) {
        setNotices(data.data.notices);
      } else {
        toast.error("Failed to fetch notices");
      }
    } catch (error) {
      console.error("Fetch notices error:", error);
      toast.error("Failed to fetch notices");
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm("Are you sure you want to delete this team? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/teams/${teamId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Team deleted successfully!");
        fetchTeams();
      } else {
        toast.error(data.message || "Failed to delete team");
      }
    } catch (error) {
      console.error("Delete team error:", error);
      toast.error("Failed to delete team");
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam({ ...team });
    setEditModalOpen(true);
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/teams/${editingTeam.teamID}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingTeam),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Team updated successfully!");
        setEditModalOpen(false);
        fetchTeams();
      } else {
        toast.error(data.message || "Failed to update team");
      }
    } catch (error) {
      console.error("Update team error:", error);
      toast.error("Failed to update team");
    }
  };

  const handleTeamFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/teams", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...teamForm.data,
          leaderName: teamForm.data.members.find(m => m.isLeader)?.fullName || "",
          email: teamForm.data.members.find(m => m.isLeader)?.email || "",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Team registered successfully!");
        setTeamForm({
          step: 1,
          data: {
            teamName: "",
            collegeName: "",
            collegePincode: "",
            collegeId: "",
            totalMembers: 1,
            totalFemaleMembers: 0,
            members: [
              {
                fullName: "",
                email: "",
                learningPlanCompletion: "0%",
                currentMarks: "0",
                isLeader: true,
              },
            ],
          },
        });
        fetchTeams();
      } else {
        toast.error(data.message || "Failed to register team");
      }
    } catch (error) {
      console.error("Team registration error:", error);
      toast.error("Failed to register team");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setUploadResult(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/teams/upload", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();
      setUploadResult(data);

      if (data.success) {
        toast.success(`Upload completed! ${data.data.successful} teams added successfully.`);
        fetchTeams();
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("CSV upload error:", error);
      toast.error("Upload failed. Please try again.");
      setUploadResult({
        success: false,
        message: "Upload failed. Please try again.",
        data: { errors: ["Network error occurred"] }
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      const url = editingNotice ? `/api/admin/notices/${editingNotice._id}` : "/api/admin/notices";
      const method = editingNotice ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(noticeForm),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingNotice ? "Notice updated successfully!" : "Notice created successfully!");
        setNoticeForm({ title: "", content: "" });
        setNoticeModalOpen(false);
        setEditingNotice(null);
        fetchNotices();
      } else {
        toast.error(data.message || "Failed to save notice");
      }
    } catch (error) {
      console.error("Notice save error:", error);
      toast.error("Failed to save notice");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditNotice = (notice) => {
    setEditingNotice(notice);
    setNoticeForm({ title: notice.title, content: notice.content });
    setNoticeModalOpen(true);
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!confirm("Are you sure you want to delete this notice?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/notices/${noticeId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Notice deleted successfully!");
        fetchNotices();
      } else {
        toast.error(data.message || "Failed to delete notice");
      }
    } catch (error) {
      console.error("Delete notice error:", error);
      toast.error("Failed to delete notice");
    }
  };

  const handleFolderAction = async (teamId, action) => {
    setFolderLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/folders", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          teamId, 
          [action]: true 
        }),
      });

      const data = await response.json();

      if (data.success) {
        const actionMessages = {
          createStructure: "Folder structure created and submissions enabled successfully!",
          enableSubmissions: "Submissions enabled successfully!",
          disableSubmissions: "Submissions disabled successfully!"
        };
        toast.success(actionMessages[action]);
        fetchTeams();
        if (selectedTeam && selectedTeam.teamID === teamId) {
          const updatedTeam = teams.find(t => t.teamID === teamId);
          if (updatedTeam) {
            setSelectedTeam({ 
              ...updatedTeam, 
              folderStructureEnabled: action !== 'disableSubmissions' 
            });
          }
        }
      } else {
        toast.error(data.message || `Failed to ${action.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      }
    } catch (error) {
      console.error(`${action} error:`, error);
      toast.error(`Failed to ${action.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    } finally {
      setFolderLoading(false);
    }
  };

  const handleTeamDriveLink = (team) => {
    setSelectedTeamForModal(team);
    setTeamDriveLinkModalOpen(true);
  };

  const addMember = () => {
    if (teamForm.data.members.length < 8) {
      setTeamForm({
        ...teamForm,
        data: {
          ...teamForm.data,
          members: [
            ...teamForm.data.members,
            {
              fullName: "",
              email: "",
              learningPlanCompletion: "0%",
              currentMarks: "0",
              isLeader: false,
            },
          ],
          totalMembers: teamForm.data.members.length + 1,
        },
      });
    }
  };

  const removeMember = (index) => {
    if (teamForm.data.members.length > 1 && !teamForm.data.members[index].isLeader) {
      const newMembers = teamForm.data.members.filter((_, i) => i !== index);
      setTeamForm({
        ...teamForm,
        data: {
          ...teamForm.data,
          members: newMembers,
          totalMembers: newMembers.length,
          totalFemaleMembers: Math.min(teamForm.data.totalFemaleMembers, newMembers.length - 1)
        },
      });
    }
  };

  const updateMember = (index, field, value) => {
    const newMembers = [...teamForm.data.members];
    newMembers[index][field] = value;
    setTeamForm({
      ...teamForm,
      data: { ...teamForm.data, members: newMembers },
    });
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
      <SidebarInset className="flex-1">
        <AdminHeader logout={logout} />
        <div className="flex-1 p-4 lg:p-6 bg-gray-50 min-h-0">
          {activeView === "teams" && (
            <TeamsView
              uploadResult={uploadResult}
              handleCSVUpload={handleCSVUpload}
              isLoading={isLoading}
              teamForm={teamForm}
              setTeamForm={setTeamForm}
              handleTeamFormSubmit={handleTeamFormSubmit}
              addMember={addMember}
              removeMember={removeMember}
              updateMember={updateMember}
              teams={teams}
              totalTeams={totalTeams}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              page={page}
              setPage={setPage}
              limit={limit}
              setLimit={setLimit}
              handleEditTeam={handleEditTeam}
              handleDeleteTeam={handleDeleteTeam}
              editModalOpen={editModalOpen}
              setEditModalOpen={setEditModalOpen}
              editingTeam={editingTeam}
              setEditingTeam={setEditingTeam}
              handleUpdateTeam={handleUpdateTeam}
            />
          )}
          
          {activeView === "notices" && (
            <NoticesView
              notices={notices}
              noticeModalOpen={noticeModalOpen}
              setNoticeModalOpen={setNoticeModalOpen}
              editingNotice={editingNotice}
              setEditingNotice={setEditingNotice}
              noticeForm={noticeForm}
              setNoticeForm={setNoticeForm}
              handleNoticeSubmit={handleNoticeSubmit}
              handleEditNotice={handleEditNotice}
              handleDeleteNotice={handleDeleteNotice}
              isLoading={isLoading}
            />
          )}
          
          {activeView === "folders" && (
            <FoldersView
              setGlobalFolderStructureModalOpen={setGlobalFolderStructureModalOpen}
              teams={teams}
              page={page}
              limit={limit}
              totalTeams={totalTeams}
              setPage={setPage}
              folderLoading={folderLoading}
              handleFolderAction={handleFolderAction}
              handleTeamDriveLink={handleTeamDriveLink}
            />
          )}
        </div>
      </SidebarInset>

      {/* Modals */}
      <TeamDriveLinkModal
        isOpen={teamDriveLinkModalOpen}
        onClose={() => {
          setTeamDriveLinkModalOpen(false);
          setSelectedTeamForModal(null);
        }}
        teamData={selectedTeamForModal}
      />

      <GlobalFolderStructureModal
        isOpen={globalFolderStructureModalOpen}
        onClose={() => setGlobalFolderStructureModalOpen(false)}
      />
    </SidebarProvider>
  );
}
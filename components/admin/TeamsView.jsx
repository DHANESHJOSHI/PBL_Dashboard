import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Plus, Minus } from "lucide-react";
import UploadResultAlert from "./UploadResultAlert";
import TeamRegistrationForm from "./TeamRegistrationForm";
import TeamsTable from "./TeamsTable";
import EditTeamModal from "./EditTeamModal";

export default function TeamsView({
  uploadResult,
  handleCSVUpload,
  isLoading,
  teamForm,
  setTeamForm,
  handleTeamFormSubmit,
  addMember,
  removeMember,
  updateMember,
  teams,
  totalTeams,
  searchTerm,
  setSearchTerm,
  page,
  setPage,
  limit,
  setLimit,
  handleEditTeam,
  handleDeleteTeam,
  editModalOpen,
  setEditModalOpen,
  editingTeam,
  setEditingTeam,
  handleUpdateTeam,
  selectedTeams,
  setSelectedTeams,
  handleBulkDelete,
  handleExportTeams,
  handleMarksProgressUpload
}) {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage team registrations and view team details</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleCSVUpload} className="hidden" id="csv-upload" />
          <button
            onClick={() => document.getElementById("csv-upload").click()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Upload className="h-4 w-4 text-gray-600" />
            {isLoading ? "Uploading..." : "Upload CSV"}
          </button>
          <button
            onClick={() => setShowRegistrationForm(!showRegistrationForm)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${showRegistrationForm ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {showRegistrationForm ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showRegistrationForm ? "Hide Form" : "Register Team"}
          </button>
        </div>
      </div>

      {/* Upload Result */}
      <UploadResultAlert uploadResult={uploadResult} />

      {/* Team Registration Form */}
      {showRegistrationForm && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <TeamRegistrationForm
            teamForm={teamForm}
            setTeamForm={setTeamForm}
            handleTeamFormSubmit={handleTeamFormSubmit}
            isLoading={isLoading}
            addMember={addMember}
            removeMember={removeMember}
            updateMember={updateMember}
          />
        </div>
      )}

      {/* Teams Table */}
      <TeamsTable
        teams={teams}
        totalTeams={totalTeams}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        isLoading={isLoading}
        handleEditTeam={handleEditTeam}
        handleDeleteTeam={handleDeleteTeam}
        selectedTeams={selectedTeams}
        setSelectedTeams={setSelectedTeams}
        handleBulkDelete={handleBulkDelete}
        handleExportTeams={handleExportTeams}
        handleMarksProgressUpload={handleMarksProgressUpload}
      />

      {/* Edit Team Modal */}
      <EditTeamModal
        editModalOpen={editModalOpen}
        setEditModalOpen={setEditModalOpen}
        editingTeam={editingTeam}
        setEditingTeam={setEditingTeam}
        handleUpdateTeam={handleUpdateTeam}
      />
    </div>
  );
}
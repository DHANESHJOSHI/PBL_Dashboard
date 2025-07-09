import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
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
  handleUpdateTeam
}) {
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Team Management</h2>
          <p className="text-gray-600 mt-1">
            Manage team registrations and view team details
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleCSVUpload}
            className="hidden"
            id="csv-upload"
          />
          <Button
            onClick={() => document.getElementById("csv-upload").click()}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2 rounded-xl border-gray-300 hover:border-gray-400 transition-all duration-200 hover:shadow-md"
          >
            <Upload className="h-4 w-4" />
            {isLoading ? "Uploading..." : "Upload CSV/Excel"}
          </Button>
        </div>
      </div>

      {/* Upload Result */}
      <UploadResultAlert uploadResult={uploadResult} />

      {/* Team Registration Form */}
      <TeamRegistrationForm
        teamForm={teamForm}
        setTeamForm={setTeamForm}
        handleTeamFormSubmit={handleTeamFormSubmit}
        isLoading={isLoading}
        addMember={addMember}
        removeMember={removeMember}
        updateMember={updateMember}
      />

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
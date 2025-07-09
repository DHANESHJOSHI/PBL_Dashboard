import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import GlobalFolderStructure from "./GlobalFolderStructure";
import FoldersTable from "./FoldersTable";

export default function FoldersView({
  setGlobalFolderStructureModalOpen,
  teams,
  page,
  limit,
  totalTeams,
  setPage,
  folderLoading,
  handleFolderAction,
  handleTeamDriveLink
}) {
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Folder Structure Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage team submission permissions and global folder structure
          </p>
        </div>
        <Button
          onClick={() => setGlobalFolderStructureModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition-all duration-200 hover:shadow-lg w-full lg:w-auto"
        >
          <Settings className="h-4 w-4" />
          Customize Global Structure
        </Button>
      </div>

      {/* Global Folder Structure Preview */}
      <GlobalFolderStructure setGlobalFolderStructureModalOpen={setGlobalFolderStructureModalOpen} />

      {/* Teams Status Overview */}
      <FoldersTable
        teams={teams}
        page={page}
        limit={limit}
        totalTeams={totalTeams}
        setPage={setPage}
        folderLoading={folderLoading}
        handleFolderAction={handleFolderAction}
        handleTeamDriveLink={handleTeamDriveLink}
      />
    </div>
  );
}
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";

export default function FoldersTable({
  teams,
  page,
  limit,
  totalTeams,
  setPage,
  folderLoading,
  handleFolderAction,
  handleTeamDriveLink
}) {
  const totalPages = Math.ceil(totalTeams / limit);

  return (
    <Card className="shadow-xl border-0 rounded-2xl">
      <CardHeader className="bg-gray-50 border-b rounded-t-2xl p-4 lg:p-6">
        <CardTitle className="text-lg lg:text-xl text-gray-900">
          Teams Submission Status Overview
        </CardTitle>
        <p className="text-gray-600 text-sm mt-1">
          Quick overview of all teams and their submission permissions
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="rounded-2xl overflow-hidden">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold text-gray-900 text-xs lg:text-sm">#</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs lg:text-sm">Team ID</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs lg:text-sm hidden md:table-cell">Team Name</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs lg:text-sm hidden lg:table-cell">College</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs lg:text-sm hidden sm:table-cell">Leader</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs lg:text-sm">Status</TableHead>
                <TableHead className="font-semibold text-gray-900 text-xs lg:text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team, index) => (
                <TableRow key={team._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-600 text-xs lg:text-sm">
                    {(page - 1) * limit + index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-blue-600 text-xs lg:text-sm">
                    <button
                      onClick={() => handleTeamDriveLink(team)}
                      className="hover:underline flex items-center gap-1"
                    >
                      {team.teamID}
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </TableCell>
                  <TableCell className="text-xs lg:text-sm hidden md:table-cell">
                    {team.teamName || "N/A"}
                  </TableCell>
                  <TableCell className="text-xs lg:text-sm hidden lg:table-cell">
                    <div className="font-medium text-gray-900">
                      {team.collegeName}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs lg:text-sm hidden sm:table-cell">
                    <div className="font-medium text-gray-900">
                      {team.leaderName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant={team.folderStructureEnabled ? "default" : "secondary"}
                        className={
                          team.folderStructureEnabled
                            ? "bg-green-100 text-green-800 rounded-full text-xs"
                            : "bg-red-100 text-red-800 rounded-full text-xs"
                        }
                      >
                        {team.folderStructureEnabled ? "✅ Enabled" : "❌ Disabled"}
                      </Badge>
                      {team.submitConceptNote && (
                        <Badge className="bg-blue-100 text-blue-800 rounded-full text-xs">
                          Concept Note
                        </Badge>
                      )}
                      {team.submitFinalDeliverable && (
                        <Badge className="bg-purple-100 text-purple-800 rounded-full text-xs">
                          Final Del.
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col sm:flex-row gap-1 lg:gap-2">
                      {team.folderStructureEnabled ? (
                        <Button
                          onClick={() => handleFolderAction(team.teamID, 'disableSubmissions')}
                          disabled={folderLoading}
                          variant="destructive"
                          size="sm"
                          className="rounded-xl text-xs"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Disable</span>
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleFolderAction(team.teamID, 'enableSubmissions')}
                          disabled={folderLoading}
                          size="sm"
                          className="rounded-xl bg-green-600 hover:bg-green-700 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Enable</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 lg:px-6 py-4 border-t gap-4">
        <div className="text-sm text-gray-600">
          Showing {Math.min((page - 1) * limit + 1, totalTeams)} to {Math.min(page * limit, totalTeams)} of {totalTeams} teams
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="rounded-xl border-gray-300 hover:border-gray-400 transition-all duration-200 hover:shadow-md"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="rounded-xl border-gray-300 hover:border-gray-400 transition-all duration-200 hover:shadow-md"
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ExternalLink, Building2, Users } from "lucide-react";

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="p-4 lg:p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg lg:text-xl font-bold text-gray-800">Teams Submission Status Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Quick overview of all teams and their submission permissions</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-100 bg-gray-50/80">
              <th className="w-10 px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Team</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">College</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Leader</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {teams.map((team, index) => (
              <tr key={team._id} className="hover:bg-blue-50/40 transition-colors">
                <td className="w-10 px-2 py-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                    {(page - 1) * limit + index + 1}
                  </span>
                </td>
                
                {/* Team */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-8 bg-blue-500 rounded-full shrink-0" />
                    <div className="min-w-0">
                      <button
                        onClick={() => handleTeamDriveLink(team)}
                        className="text-xs font-bold text-blue-700 truncate max-w-[160px] hover:underline flex items-center gap-1"
                        title={team.teamID}
                      >
                        {team.teamID}
                        <ExternalLink className="h-3 w-3" />
                      </button>
                      <div className="text-xs text-gray-600 font-medium truncate max-w-[160px]" title={team.teamName}>{team.teamName || '—'}</div>
                    </div>
                  </div>
                </td>

                {/* College */}
                <td className="px-3 py-3 hidden lg:table-cell">
                  <div className="flex items-start gap-1.5">
                    <Building2 className="h-3 w-3 text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-700 font-medium truncate max-w-[200px]" title={team.collegeName}>{team.collegeName}</div>
                      <div className="text-[10px] text-gray-400">ID: {team.collegeId}</div>
                    </div>
                  </div>
                </td>

                {/* Leader */}
                <td className="px-3 py-3 hidden sm:table-cell">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate max-w-[130px]" title={team.leaderName}>{team.leaderName}</div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1.5 items-start">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      team.folderStructureEnabled 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {team.folderStructureEnabled ? "✅ Enabled" : "❌ Disabled"}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {team.submitConceptNote && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-semibold rounded-full">Concept Note</span>
                      )}
                      {team.submitFinalDeliverable && (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-semibold rounded-full">Final Del.</span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-3 py-3 w-32">
                  <div className="flex items-center justify-center gap-1.5">
                    {team.folderStructureEnabled ? (
                      <Button
                        onClick={() => handleFolderAction(team.teamID, 'disableSubmissions')}
                        disabled={folderLoading}
                        variant="destructive"
                        size="sm"
                        className="rounded-xl text-[10px] h-7 px-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-800 transition-colors shadow-none"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Disable
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleFolderAction(team.teamID, 'enableSubmissions')}
                        disabled={folderLoading}
                        size="sm"
                        className="rounded-xl text-[10px] h-7 px-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 hover:text-green-800 transition-colors shadow-none"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enable
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/60 gap-4">
        <div className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-700">{Math.min((page - 1) * limit + 1, totalTeams)}</span>–<span className="font-semibold text-gray-700">{Math.min(page * limit, totalTeams)}</span> of <span className="font-semibold text-gray-700">{totalTeams.toLocaleString()}</span> teams
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="rounded-xl border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm text-xs h-8"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="rounded-xl border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm text-xs h-8"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
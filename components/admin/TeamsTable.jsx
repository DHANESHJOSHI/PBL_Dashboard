import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Edit, Trash2, Loader2, Users } from "lucide-react";

export default function TeamsTable({
  teams,
  totalTeams,
  searchTerm,
  setSearchTerm,
  page,
  setPage,
  limit,
  setLimit,
  isLoading,
  handleEditTeam,
  handleDeleteTeam
}) {
  const filteredTeams = teams.filter(
    (team) =>
      team.teamID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.collegeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leaderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalTeams / limit);

  return (
    <Card className="shadow-xl border-0 rounded-2xl">
      <CardHeader className="bg-gray-50 border-b rounded-t-2xl p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <CardTitle className="text-lg lg:text-xl text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Registered Teams ({totalTeams})
            </CardTitle>
            <p className="text-gray-600 text-sm mt-1">
              View and manage all registered teams
            </p>
          </div>
          <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">Rows per page:</Label>
              <Select
                value={limit.toString()}
                onValueChange={(value) => {
                  setLimit(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[80px] bg-white border-gray-300 rounded-xl shadow-sm">
                  <SelectValue placeholder={limit} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                  <SelectItem value="10" className="hover:bg-gray-50 rounded-lg">10</SelectItem>
                  <SelectItem value="25" className="hover:bg-gray-50 rounded-lg">25</SelectItem>
                  <SelectItem value="50" className="hover:bg-gray-50 rounded-lg">50</SelectItem>
                  <SelectItem value="100" className="hover:bg-gray-50 rounded-lg">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading teams...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="rounded-2xl overflow-hidden">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-900 text-xs lg:text-sm">#</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-xs lg:text-sm">Team ID</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-xs lg:text-sm hidden md:table-cell">Team Name</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-xs lg:text-sm hidden lg:table-cell">College</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-xs lg:text-sm hidden sm:table-cell">Leader</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-xs lg:text-sm">Members</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-xs lg:text-sm hidden lg:table-cell">Created</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-xs lg:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.map((team, index) => (
                  <TableRow key={team._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-600 text-xs lg:text-sm">
                      {(page - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-blue-600 text-xs lg:text-sm">
                      {team.teamID}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm hidden md:table-cell">
                      {team.teamName || "N/A"}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm hidden lg:table-cell">
                      <div>
                        <div className="font-medium text-gray-900">
                          {team.collegeName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {team.collegeId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm hidden sm:table-cell">
                      <div>
                        <div className="font-medium text-gray-900">
                          {team.leaderName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {team.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {team.totalMembers} total
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                          {team.totalFemaleMembers} female
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 text-xs lg:text-sm hidden lg:table-cell">
                      {new Date(team.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex flex-col sm:flex-row gap-1 lg:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTeam(team)}
                        className="flex items-center gap-1 rounded-xl border-gray-300 hover:border-gray-400 transition-all duration-200 hover:shadow-md text-xs"
                      >
                        <Edit className="h-3 w-3" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTeam(team.teamID)}
                        className="flex items-center gap-1 rounded-xl transition-all duration-200 hover:shadow-md text-xs"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
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
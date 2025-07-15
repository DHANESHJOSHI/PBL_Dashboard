import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Edit, Trash2, Loader2, Users, ChevronDown, ChevronRight, User, Mail, Award, FileText, Link, X, AlertTriangle, Download, Upload } from "lucide-react";

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
  handleDeleteTeam,
  selectedTeams,
  setSelectedTeams,
  handleBulkDelete,
  handleExportTeams,
  handleMarksProgressUpload
}) {
  const [expandedTeams, setExpandedTeams] = useState(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleTeamExpansion = (teamId) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  // Remove client-side filtering since we're using API search
  const filteredTeams = teams;

  const totalPages = Math.ceil(totalTeams / limit);

  // Checkbox functionality
  const safeSelectedTeams = selectedTeams || [];
  
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedTeams?.(teams.map(team => team.teamID));
    } else {
      setSelectedTeams?.([]);
    }
  };

  const handleSelectTeam = (teamId, checked) => {
    if (checked) {
      setSelectedTeams?.([...safeSelectedTeams, teamId]);
    } else {
      setSelectedTeams?.(safeSelectedTeams.filter(id => id !== teamId));
    }
  };

  const isAllSelected = teams.length > 0 && safeSelectedTeams.length === teams.length;
  const isIndeterminate = safeSelectedTeams.length > 0 && safeSelectedTeams.length < teams.length;

  const handleBulkDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await handleBulkDelete?.(safeSelectedTeams);
      setShowBulkDeleteDialog(false);
    } catch (error) {
      console.error('Bulk delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <CardTitle className="text-xl lg:text-2xl text-gray-900 flex items-center gap-3 font-bold">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <span>Registered Teams</span>
                <span className="ml-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full font-medium">
                  {totalTeams}
                </span>
              </div>
            </CardTitle>
            <p className="text-gray-600 text-sm mt-2 font-medium">
              View and manage all registered teams with advanced controls
            </p>
          </div>
          
          {/* Bulk Actions Bar */}
          {safeSelectedTeams.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-700">
                  {safeSelectedTeams.length} team{safeSelectedTeams.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-xl hover:shadow-lg transition-all duration-200 bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isDeleting ? 'Deleting...' : 'Delete Selected'}
              </Button>
            </div>
          )}
          
          {/* Export and Upload Controls */}
          <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
            <div className="flex gap-2">
              <Button
                onClick={handleExportTeams}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2"
              >
                <Download className="h-4 w-4" />
                Export Teams
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleMarksProgressUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  id="marks-upload"
                />
                <Button
                  asChild
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2"
                >
                  <label htmlFor="marks-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Upload Marks
                  </label>
                </Button>
              </div>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search teams, colleges, leaders..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (page !== 1) setPage(1);
                }}
                className="pl-12 pr-12 py-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-sm shadow-sm bg-white"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    if (page !== 1) setPage(1);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </Button>
              )}
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-blue-500" />
              )}
            </div>
            
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
              <Label className="text-sm font-medium text-gray-700 whitespace-nowrap">Show:</Label>
              <Select
                value={limit.toString()}
                onValueChange={(value) => {
                  setLimit(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[70px] bg-transparent border-0 rounded-lg shadow-none">
                  <SelectValue placeholder={limit} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                  <SelectItem value="10" className="hover:bg-blue-50 rounded-lg">10</SelectItem>
                  <SelectItem value="25" className="hover:bg-blue-50 rounded-lg">25</SelectItem>
                  <SelectItem value="50" className="hover:bg-blue-50 rounded-lg">50</SelectItem>
                  <SelectItem value="100" className="hover:bg-blue-50 rounded-lg">100</SelectItem>
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
              <TableHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-200">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-gray-800 text-sm w-12 text-center py-4">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      className="mx-auto border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                  </TableHead>
                  <TableHead className="font-bold text-gray-800 text-sm w-12 text-center py-4">
                    <div className="flex items-center justify-center">
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800 text-sm py-4">#</TableHead>
                  <TableHead className="font-bold text-gray-800 text-sm py-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      Team ID
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800 text-sm py-4 hidden md:table-cell">Team Name</TableHead>
                  <TableHead className="font-bold text-gray-800 text-sm py-4 hidden lg:table-cell">College</TableHead>
                  <TableHead className="font-bold text-gray-800 text-sm py-4 hidden sm:table-cell">Leader</TableHead>
                  <TableHead className="font-bold text-gray-800 text-sm py-4">Members</TableHead>
                  <TableHead className="font-bold text-gray-800 text-sm py-4 hidden xl:table-cell">Progress</TableHead>
                  <TableHead className="font-bold text-gray-800 text-sm py-4 hidden lg:table-cell">Created</TableHead>
                  <TableHead className="font-bold text-gray-800 text-sm py-4 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.map((team, index) => {
                  const isExpanded = expandedTeams.has(team._id);
                  return (
                    <>
                      <TableRow key={team._id} className="hover:bg-blue-50/50 transition-colors duration-200 border-b border-gray-100">
                        <TableCell className="p-4 text-center">
                          <Checkbox
                            checked={safeSelectedTeams.includes(team.teamID)}
                            onCheckedChange={(checked) => handleSelectTeam(team.teamID, checked)}
                            className="border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                        </TableCell>
                        <TableCell className="p-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTeamExpansion(team._id)}
                            className="w-8 h-8 p-0 hover:bg-blue-100 rounded-full transition-colors duration-200"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-blue-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-bold text-gray-700 text-sm px-4 py-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-700 font-bold">
                            {(page - 1) * limit + index + 1}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-blue-700 text-sm px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            {team.teamID}
                          </div>
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
                              {team.members?.length || team.totalMembers} total
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                              {team.totalFemaleMembers} female
                            </span>
                          </div>
                        </TableCell>
                        
                        {/* Progress Column */}
                        <TableCell className="hidden xl:table-cell">
                          {team.members && team.members.length > 0 ? (
                            <div className="space-y-2 min-w-[120px]">
                              {/* Learning Progress */}
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs text-gray-600 font-medium">Learning</span>
                                  <span className="text-xs font-semibold text-green-600">
                                    {Math.round(
                                      team.members.reduce((acc, member) => {
                                        const completion = parseInt(member.learningPlanCompletion?.replace('%', '') || '0');
                                        return acc + completion;
                                      }, 0) / team.members.length
                                    )}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300" 
                                    style={{ 
                                      width: `${Math.round(
                                        team.members.reduce((acc, member) => {
                                          const completion = parseInt(member.learningPlanCompletion?.replace('%', '') || '0');
                                          return acc + completion;
                                        }, 0) / team.members.length
                                      )}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                              
                              {/* Files Progress */}
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs text-gray-600 font-medium">Files</span>
                                  <span className="text-xs font-semibold text-blue-600">
                                    {Math.round(
                                      ((team.members.filter(m => m.certificateFile || m.certificateLink).length + 
                                        team.members.filter(m => m.resumeFile || m.resumeLink).length) / 
                                       (team.members.length * 2)) * 100
                                    )}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                                    style={{ 
                                      width: `${Math.round(
                                        ((team.members.filter(m => m.certificateFile || m.certificateLink).length + 
                                          team.members.filter(m => m.resumeFile || m.resumeLink).length) / 
                                         (team.members.length * 2)) * 100
                                      )}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                              
                              {/* Overall Progress */}
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs text-gray-600 font-medium">Overall</span>
                                  <span className="text-xs font-semibold text-purple-600">
                                    {Math.round(
                                      (
                                        (team.members.reduce((acc, member) => {
                                          const completion = parseInt(member.learningPlanCompletion?.replace('%', '') || '0');
                                          return acc + completion;
                                        }, 0) / team.members.length) +
                                        ((team.members.filter(m => m.certificateFile || m.certificateLink).length + 
                                          team.members.filter(m => m.resumeFile || m.resumeLink).length) / 
                                         (team.members.length * 2)) * 100
                                      ) / 2
                                    )}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-purple-500 h-1.5 rounded-full transition-all duration-300" 
                                    style={{ 
                                      width: `${Math.round(
                                        (
                                          (team.members.reduce((acc, member) => {
                                            const completion = parseInt(member.learningPlanCompletion?.replace('%', '') || '0');
                                            return acc + completion;
                                          }, 0) / team.members.length) +
                                          ((team.members.filter(m => m.certificateFile || m.certificateLink).length + 
                                            team.members.filter(m => m.resumeFile || m.resumeLink).length) / 
                                           (team.members.length * 2)) * 100
                                        ) / 2
                                      )}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-gray-400">
                              <div className="text-xs">No data</div>
                              <div className="text-xs">available</div>
                            </div>
                          )}
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
                      
                      {/* Expanded Members Row */}
                      {isExpanded && (
                        <TableRow key={`${team._id}-expanded`} className="bg-gray-50">
                          <TableCell colSpan={11} className="p-4">
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                              {/* Team Progress Overview */}
                              {team.members && team.members.length > 0 && (
                                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Award className="h-5 w-5 text-blue-600" />
                                    <h4 className="font-semibold text-gray-900">Team Progress Overview</h4>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* Learning Plan Progress */}
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-green-600">
                                        {Math.round(
                                          team.members.reduce((acc, member) => {
                                            const completion = parseInt(member.learningPlanCompletion?.replace('%', '') || '0');
                                            return acc + completion;
                                          }, 0) / team.members.length
                                        )}%
                                      </div>
                                      <div className="text-xs text-gray-600 font-medium">Avg. Learning Progress</div>
                                    </div>
                                    
                                    {/* Average Marks */}
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-blue-600">
                                        {Math.round(
                                          team.members.reduce((acc, member) => {
                                            return acc + parseInt(member.currentMarks || '0');
                                          }, 0) / team.members.length
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-600 font-medium">Avg. Marks</div>
                                    </div>
                                    
                                    {/* Certificate Completion */}
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-green-600">
                                        {team.members.filter(m => m.certificateFile || m.certificateLink).length}/{team.members.length}
                                      </div>
                                      <div className="text-xs text-gray-600 font-medium">Certificates</div>
                                    </div>
                                    
                                    {/* Resume Completion */}
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-purple-600">
                                        {team.members.filter(m => m.resumeFile || m.resumeLink).length}/{team.members.length}
                                      </div>
                                      <div className="text-xs text-gray-600 font-medium">Resumes</div>
                                    </div>
                                  </div>
                                  
                                  {/* Progress Bars */}
                                  <div className="mt-4 space-y-3">
                                    {/* Learning Progress Bar */}
                                    <div>
                                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                                        <span>Team Learning Progress</span>
                                        <span>
                                          {Math.round(
                                            team.members.reduce((acc, member) => {
                                              const completion = parseInt(member.learningPlanCompletion?.replace('%', '') || '0');
                                              return acc + completion;
                                            }, 0) / team.members.length
                                          )}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-green-500 h-2 rounded-full" 
                                          style={{ 
                                            width: `${Math.round(
                                              team.members.reduce((acc, member) => {
                                                const completion = parseInt(member.learningPlanCompletion?.replace('%', '') || '0');
                                                return acc + completion;
                                              }, 0) / team.members.length
                                            )}%` 
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                    
                                    {/* File Completion Bar */}
                                    <div>
                                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                                        <span>File Submissions</span>
                                        <span>
                                          {Math.round(
                                            ((team.members.filter(m => m.certificateFile || m.certificateLink).length + 
                                              team.members.filter(m => m.resumeFile || m.resumeLink).length) / 
                                             (team.members.length * 2)) * 100
                                          )}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-blue-500 h-2 rounded-full" 
                                          style={{ 
                                            width: `${Math.round(
                                              ((team.members.filter(m => m.certificateFile || m.certificateLink).length + 
                                                team.members.filter(m => m.resumeFile || m.resumeLink).length) / 
                                               (team.members.length * 2)) * 100
                                            )}%` 
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 mb-3">
                                <Users className="h-4 w-4 text-blue-600" />
                                <h4 className="font-semibold text-gray-900">Team Members ({team.members?.length || 0})</h4>
                              </div>
                              
                              {team.members && team.members.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {team.members.map((member, memberIndex) => (
                                    <div key={memberIndex} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <User className="h-4 w-4 text-blue-600" />
                                          <div>
                                            <div className="font-medium text-gray-900 text-sm">
                                              {member.fullName || member.memberName}
                                              {member.isLeader && (
                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                  Leader
                                                </span>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                              <Mail className="h-3 w-3" />
                                              {member.email}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        {/* Learning Plan Progress */}
                                        <div className="flex items-center gap-2">
                                          <Award className="h-3 w-3 text-green-600" />
                                          <span className="text-xs text-gray-600">Progress:</span>
                                          <span className="text-xs font-medium text-green-600">
                                            {member.learningPlanCompletion || "0%"}
                                          </span>
                                        </div>
                                        
                                        {/* Current Marks */}
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-3 w-3 text-blue-600" />
                                          <span className="text-xs text-gray-600">Marks:</span>
                                          <span className="text-xs font-medium text-blue-600">
                                            {member.currentMarks || "0"}
                                          </span>
                                        </div>
                                        
                                        {/* Links and Files */}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {(member.certificateFile || member.certificateLink) && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                              Certificate
                                            </span>
                                          )}
                                          {(member.resumeFile || member.resumeLink) && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                              Resume
                                            </span>
                                          )}
                                          {member.linkedinLink && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                              LinkedIn
                                            </span>
                                          )}
                                          {member.portfolioLink && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                              Portfolio
                                            </span>
                                          )}
                                          {member.githubLink && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                              GitHub
                                            </span>
                                          )}
                                        </div>
                                        
                                        {/* Additional Notes */}
                                        {member.additionalNotes && (
                                          <div className="text-xs text-gray-600 mt-2 p-2 bg-white rounded border">
                                            <strong>Notes:</strong> {member.additionalNotes}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-6 text-gray-500">
                                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                  <p className="text-sm">No member details available</p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
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
      
      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent className="max-w-md bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Bulk Delete
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete <span className="font-bold text-red-600">{safeSelectedTeams.length}</span> selected team{safeSelectedTeams.length > 1 ? 's' : ''}?
              <br />
              <span className="text-red-500 font-medium">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isDeleting}
              className="rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 rounded-xl"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Teams
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
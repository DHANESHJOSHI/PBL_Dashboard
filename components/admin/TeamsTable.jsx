"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search, Edit, Trash2, Loader2, Users, ChevronDown,
  ChevronRight, User, Mail, Award, FileText, X,
  AlertTriangle, Download, Upload, Building2, GraduationCap,
} from "lucide-react";

function ProgressMini({ label, value, color }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-[10px] text-gray-500 w-14 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-0">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-[10px] font-semibold w-7 text-right ${color.replace('bg-', 'text-')}`}>{value}%</span>
    </div>
  );
}

export default function TeamsTable({
  teams, totalTeams, searchTerm, setSearchTerm,
  page, setPage, limit, setLimit, isLoading,
  handleEditTeam, handleDeleteTeam, selectedTeams, setSelectedTeams,
  handleBulkDelete, handleExportTeams, handleMarksProgressUpload
}) {
  const [expandedTeams, setExpandedTeams] = useState(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleExpand = (id) => {
    const next = new Set(expandedTeams);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedTeams(next);
  };

  const safeSelected = selectedTeams || [];
  const isAllSelected = teams.length > 0 && safeSelected.length === teams.length;
  const totalPages = Math.ceil(totalTeams / limit);

  const calcLearning = (members) => {
    if (!members?.length) return 0;
    return Math.round(members.reduce((a, m) => a + parseInt(m.learningPlanCompletion?.replace('%','') || 0), 0) / members.length);
  };
  const calcFiles = (members) => {
    if (!members?.length) return 0;
    return Math.round(((members.filter(m => m.certificateFile || m.certificateLink).length + members.filter(m => m.resumeFile || m.resumeLink).length) / (members.length * 2)) * 100);
  };
  const calcOverall = (members) => Math.round((calcLearning(members) + calcFiles(members)) / 2);

  const handleBulkDeleteConfirm = async () => {
    setIsDeleting(true);
    try { await handleBulkDelete?.(safeSelected); setShowBulkDeleteDialog(false); }
    catch (e) { console.error(e); }
    finally { setIsDeleting(false); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

      {/* ── Table Toolbar ── */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
        <div className="flex flex-col gap-3">

          {/* Row 1: Title + Bulk delete */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Registered Teams</h2>
                <p className="text-xs text-gray-500">{totalTeams.toLocaleString()} teams total</p>
              </div>
            </div>
            {safeSelected.length > 0 && (
              <div className="flex items-center gap-3 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl">
                <span className="text-xs font-medium text-red-700">{safeSelected.length} selected</span>
                <button
                  onClick={() => setShowBulkDeleteDialog(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
                <button onClick={() => setSelectedTeams?.([])} className="text-red-400 hover:text-red-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Row 2: Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search teams, internships, colleges, leaders..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); if (page !== 1) setPage(1); }}
              className="pl-9 pr-8 h-9 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl text-sm bg-white"
            />
            {searchTerm && (
              <button onClick={() => { setSearchTerm(''); setPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Row 3: Actions + Rows per page */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportTeams}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Export
              </button>
              <div className="relative">
                <input type="file" accept=".csv" onChange={handleMarksProgressUpload} className="absolute inset-0 opacity-0 cursor-pointer" id="marks-upload" />
                <label htmlFor="marks-upload" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer">
                  <Upload className="h-3.5 w-3.5" /> Upload Marks
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium">Show:</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 outline-none cursor-pointer"
              >
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="text-gray-400">per page</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-sm text-gray-500">Loading teams...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-100 bg-gray-50/80">
                <th className="w-9 px-3 py-3 text-center">
                  <Checkbox checked={isAllSelected} onCheckedChange={(c) => c ? setSelectedTeams?.(teams.map(t => t.teamID)) : setSelectedTeams?.([])} className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                </th>
                <th className="w-8 px-1 py-3" />
                <th className="w-10 px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Team</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Internship</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">College</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Leader</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Members</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell w-44">Progress</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell w-20">Date</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teams.map((team, index) => {
                const isExpanded = expandedTeams.has(team._id);
                const learning = calcLearning(team.members);
                const files = calcFiles(team.members);
                const overall = calcOverall(team.members);
                return (
                  <React.Fragment key={team._id}>
                    <tr className={`hover:bg-blue-50/40 transition-colors ${isExpanded ? 'bg-blue-50/20' : ''}`}>
                      {/* Checkbox */}
                      <td className="w-9 px-3 py-3 text-center">
                        <Checkbox
                          checked={safeSelected.includes(team.teamID)}
                          onCheckedChange={(c) => c ? setSelectedTeams?.([...safeSelected, team.teamID]) : setSelectedTeams?.(safeSelected.filter(id => id !== team.teamID))}
                          className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                      </td>
                      {/* Expand */}
                      <td className="w-8 px-1 py-3 text-center">
                        <button onClick={() => toggleExpand(team._id)} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-blue-100 transition-colors">
                          {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-blue-600" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
                        </button>
                      </td>
                      {/* # */}
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
                            <div className="text-xs font-bold text-blue-700 truncate max-w-[160px]" title={team.teamID}>{team.teamID}</div>
                            <div className="text-xs text-gray-600 font-medium truncate max-w-[160px]" title={team.teamName}>{team.teamName || '—'}</div>
                          </div>
                        </div>
                      </td>
                      {/* Internship */}
                      <td className="px-3 py-3 hidden md:table-cell">
                        <span className="text-xs text-gray-700 font-medium truncate block max-w-[150px]" title={team.internshipName}>{team.internshipName || '—'}</span>
                      </td>
                      {/* College */}
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <div className="flex items-start gap-1.5">
                          <Building2 className="h-3 w-3 text-gray-400 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs text-gray-700 font-medium truncate max-w-[160px]" title={team.collegeName}>{team.collegeName}</div>
                            <div className="text-[10px] text-gray-400">ID: {team.collegeId}</div>
                          </div>
                        </div>
                      </td>
                      {/* Leader */}
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-gray-800 truncate max-w-[130px]" title={team.leaderName}>{team.leaderName}</div>
                          <div className="text-[10px] text-gray-400 truncate max-w-[130px]" title={team.email}>{team.email}</div>
                        </div>
                      </td>
                      {/* Members */}
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                            <Users className="h-2.5 w-2.5" />{team.members?.length || team.totalMembers}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-100 text-pink-800">
                            ♀ {team.totalFemaleMembers}
                          </span>
                        </div>
                      </td>
                      {/* Progress */}
                      <td className="px-3 py-3 hidden xl:table-cell w-44">
                        <div className="space-y-1.5">
                          <ProgressMini label="Learning" value={learning} color="bg-emerald-500" />
                          <ProgressMini label="Files" value={files} color="bg-blue-500" />
                          <ProgressMini label="Overall" value={overall} color="bg-violet-500" />
                        </div>
                      </td>
                      {/* Date */}
                      <td className="px-3 py-3 hidden lg:table-cell w-20">
                        <span className="text-xs text-gray-500">
                          {new Date(team.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-3 py-3 w-20">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEditTeam(team)}
                            title="Edit Team"
                            className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(team.teamID)}
                            title="Delete Team"
                            className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {isExpanded && (
                      <tr key={`${team._id}-exp`}>
                        <td colSpan={11} className="px-5 py-4 bg-blue-50/30 border-t border-b border-blue-100">
                          <div className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm">
                            {/* Summary Stats */}
                            {team.members?.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                {[
                                  { label: 'Avg. Learning', value: `${calcLearning(team.members)}%`, color: 'text-emerald-600' },
                                  { label: 'Avg. Marks', value: Math.round(team.members.reduce((a, m) => a + parseInt(m.currentMarks || 0), 0) / team.members.length), color: 'text-blue-600' },
                                  { label: 'Certificates', value: `${team.members.filter(m => m.certificateFile || m.certificateLink).length}/${team.members.length}`, color: 'text-emerald-600' },
                                  { label: 'Resumes', value: `${team.members.filter(m => m.resumeFile || m.resumeLink).length}/${team.members.length}`, color: 'text-violet-600' },
                                ].map(stat => (
                                  <div key={stat.label} className="text-center">
                                    <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                                    <div className="text-[10px] text-gray-500 font-medium mt-0.5">{stat.label}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Members Grid */}
                            <div className="flex items-center gap-2 mb-3">
                              <Users className="h-4 w-4 text-blue-600" />
                              <h4 className="text-sm font-semibold text-gray-800">Team Members ({team.members?.length || 0})</h4>
                            </div>
                            {team.members?.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {team.members.map((member, mi) => (
                                  <div key={member.email || mi} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                                    <div className="flex items-start gap-2 mb-2">
                                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                        <User className="h-3.5 w-3.5 text-blue-600" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-xs font-semibold text-gray-800 truncate">
                                          {member.fullName || member.memberName}
                                          {member.isLeader && <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-full">LEADER</span>}
                                        </div>
                                        <div className="text-[10px] text-gray-500 truncate">{member.email}</div>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-gray-500 flex items-center gap-1"><Award className="h-2.5 w-2.5 text-emerald-500" />Progress</span>
                                        <span className="font-semibold text-emerald-600">{member.learningPlanCompletion || '0%'}</span>
                                      </div>
                                      <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-gray-500 flex items-center gap-1"><FileText className="h-2.5 w-2.5 text-blue-500" />Marks</span>
                                        <span className="font-semibold text-blue-600">{member.currentMarks || '0'}</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1 mt-1.5">
                                        {(member.certificateFile || member.certificateLink) && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-semibold rounded-full">Cert ✓</span>}
                                        {(member.resumeFile || member.resumeLink) && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-semibold rounded-full">Resume ✓</span>}
                                        {member.linkedinLink && <span className="px-1.5 py-0.5 bg-sky-100 text-sky-700 text-[9px] font-semibold rounded-full">LinkedIn</span>}
                                        {member.githubLink && <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[9px] font-semibold rounded-full">GitHub</span>}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6 text-gray-400 text-sm">No member details available</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/60">
        <p className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-700">{Math.min((page-1)*limit+1, totalTeams)}</span>–<span className="font-semibold text-gray-700">{Math.min(page*limit, totalTeams)}</span> of <span className="font-semibold text-gray-700">{totalTeams.toLocaleString()}</span> teams
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(p-1,1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >← Prev</button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let p = i + 1;
              if (totalPages > 5 && page > 3) p = page - 2 + i;
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs font-semibold rounded-lg transition-colors ${page === p ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                >{p}</button>
              );
            })}
          </div>
          <button
            onClick={() => setPage(p => Math.min(p+1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >Next →</button>
        </div>
      </div>

      {/* ── Bulk Delete Dialog ── */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent className="max-w-md bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Confirm Bulk Delete
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Delete <span className="font-bold text-red-600">{safeSelected.length}</span> team{safeSelected.length > 1 ? 's' : ''}?{' '}
              <span className="text-red-500 font-medium">This cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDeleteConfirm} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 rounded-xl">
              {isDeleting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Deleting...</> : <><Trash2 className="h-4 w-4 mr-2" />Delete Teams</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
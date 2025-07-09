"use client";

import { useState, useEffect } from "react";
import { X, FolderTree, Plus, Minus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FolderStructureModal({ isOpen, onClose, onSave, teamData }) {
  const [folderNames, setFolderNames] = useState({
    rootFolder: "IBM_SkillsBuild_Teams",
    conceptNoteFolder: "Concept_Note",
    finalDeliverableFolder: "Final_Deliverable",
    memberSubmissionsFolder: "Member_Submissions",
    certificatesFolder: "Certificates",
    resumeFolder: "Resume_LinkedIn",
    conceptNoteSubcategories: {
      problemStatement: "Problem_Statement",
      solutionApproach: "Solution_Approach",
      technicalArchitecture: "Technical_Architecture",
      implementationPlan: "Implementation_Plan",
      teamRoles: "Team_Roles"
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (teamData?.folderStructure?.customFolderNames) {
      setFolderNames(teamData.folderStructure.customFolderNames);
    }
  }, [teamData]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(folderNames);
      onClose();
    } catch (error) {
      console.error("Error saving folder structure:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    setFolderNames({
      rootFolder: "IBM_SkillsBuild_Teams",
      conceptNoteFolder: "Concept_Note",
      finalDeliverableFolder: "Final_Deliverable",
      memberSubmissionsFolder: "Member_Submissions",
      certificatesFolder: "Certificates",
      resumeFolder: "Resume_LinkedIn",
      conceptNoteSubcategories: {
        problemStatement: "Problem_Statement",
        solutionApproach: "Solution_Approach",
        technicalArchitecture: "Technical_Architecture",
        implementationPlan: "Implementation_Plan",
        teamRoles: "Team_Roles"
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <FolderTree className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Customize Folder Structure</h2>
              <p className="text-blue-100 text-sm">
                Team: {teamData?.teamID} - {teamData?.teamName || teamData?.collegeName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Folder Tree Visualization */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              Folder Structure Preview
            </h3>
            <div className="font-mono text-sm space-y-1 text-gray-700">
              <div className="flex items-center gap-2">
                <span>📁</span>
                <span className="font-semibold text-blue-600">{folderNames.rootFolder}</span>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <span>📁</span>
                <span className="font-semibold text-green-600">{teamData?.teamID}_Team</span>
              </div>
              <div className="ml-8 flex items-center gap-2">
                <span>📁</span>
                <span>{folderNames.conceptNoteFolder}</span>
              </div>
              <div className="ml-12 space-y-1">
                <div className="flex items-center gap-2">
                  <span>📁</span>
                  <span className="text-purple-600">{folderNames.conceptNoteSubcategories.problemStatement}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📁</span>
                  <span className="text-purple-600">{folderNames.conceptNoteSubcategories.solutionApproach}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📁</span>
                  <span className="text-purple-600">{folderNames.conceptNoteSubcategories.technicalArchitecture}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📁</span>
                  <span className="text-purple-600">{folderNames.conceptNoteSubcategories.implementationPlan}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📁</span>
                  <span className="text-purple-600">{folderNames.conceptNoteSubcategories.teamRoles}</span>
                </div>
              </div>
              <div className="ml-8 flex items-center gap-2">
                <span>📁</span>
                <span>{folderNames.finalDeliverableFolder}</span>
              </div>
              <div className="ml-8 flex items-center gap-2">
                <span>📁</span>
                <span>{folderNames.memberSubmissionsFolder}</span>
              </div>
              <div className="ml-12 space-y-1">
                {teamData?.members?.slice(0, 2).map((member, index) => (
                  <div key={index}>
                    <div className="flex items-center gap-2">
                      <span>📁</span>
                      <span className="text-orange-600">Member_{index + 1}_{member.fullName?.replace(/\s+/g, '_')}</span>
                    </div>
                    <div className="ml-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span>📁</span>
                        <span className="text-red-600">{folderNames.certificatesFolder}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📁</span>
                        <span className="text-blue-600">{folderNames.resumeFolder}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {teamData?.members?.length > 2 && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>...</span>
                    <span>and {teamData.members.length - 2} more members</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Folder Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Main Folders</h3>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Root Folder Name</Label>
                <Input
                  value={folderNames.rootFolder}
                  onChange={(e) => setFolderNames({
                    ...folderNames,
                    rootFolder: e.target.value
                  })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  placeholder="IBM_SkillsBuild_Teams"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Concept Note Folder</Label>
                <Input
                  value={folderNames.conceptNoteFolder}
                  onChange={(e) => setFolderNames({
                    ...folderNames,
                    conceptNoteFolder: e.target.value
                  })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  placeholder="Concept_Note"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Final Deliverable Folder</Label>
                <Input
                  value={folderNames.finalDeliverableFolder}
                  onChange={(e) => setFolderNames({
                    ...folderNames,
                    finalDeliverableFolder: e.target.value
                  })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  placeholder="Final_Deliverable"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Member Submissions Folder</Label>
                <Input
                  value={folderNames.memberSubmissionsFolder}
                  onChange={(e) => setFolderNames({
                    ...folderNames,
                    memberSubmissionsFolder: e.target.value
                  })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  placeholder="Member_Submissions"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Member Folders</h3>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Certificates Folder</Label>
                <Input
                  value={folderNames.certificatesFolder}
                  onChange={(e) => setFolderNames({
                    ...folderNames,
                    certificatesFolder: e.target.value
                  })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  placeholder="Certificates"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Resume & LinkedIn Folder</Label>
                <Input
                  value={folderNames.resumeFolder}
                  onChange={(e) => setFolderNames({
                    ...folderNames,
                    resumeFolder: e.target.value
                  })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  placeholder="Resume_LinkedIn"
                />
              </div>
            </div>
          </div>

          {/* Concept Note Subcategories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Concept Note Subcategories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Problem Statement</Label>
                <Input
                  value={folderNames.conceptNoteSubcategories.problemStatement}
                  onChange={(e) => setFolderNames({
                    ...folderNames,
                    conceptNoteSubcategories: {
                      ...folderNames.conceptNoteSubcategories,
                      problemStatement: e.target.value
                    }
                  })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  placeholder="Problem_Statement"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Solution Approach</Label>
                <Input
                  value={folderNames.conceptNoteSubcategories.solutionApproach}
                  onChange={(e) => setFolderNames({
                    ...folderNames,
                    conceptNoteSubcategories: {
                      ...folderNames.conceptNoteSubcategories,
                      solutionApproach: e.target.value
                    }
                  })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  placeholder="Solution_Approach"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Technical Architecture</Label>
                <Input
                  value={folderNames.conceptNoteSubcategories.technicalArchitecture}
                  onChange={(e) => setFolderNames({
                    ...folderNames,
                    conceptNoteSubcategories: {
                      ...folderNames.conceptNoteSubcategories,
                      technicalArchitecture: e.target.value
                    }
                  })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  placeholder="Technical_Architecture"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Implementation Plan</Label>
                <Input
                  value={folderNames.conceptNoteSubcategories.implementationPlan}
                  onChange={(e) => setFolderNames({
                    ...folderNames,
                    conceptNoteSubcategories: {
                      ...folderNames.conceptNoteSubcategories,
                      implementationPlan: e.target.value
                    }
                  })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  placeholder="Implementation_Plan"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium text-gray-700">Team Roles</Label>
                <Input
                  value={folderNames.conceptNoteSubcategories.teamRoles}
                  onChange={(e) => setFolderNames({
                    ...folderNames,
                    conceptNoteSubcategories: {
                      ...folderNames.conceptNoteSubcategories,
                      teamRoles: e.target.value
                    }
                  })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  placeholder="Team_Roles"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border-gray-300 hover:border-gray-400 transition-all duration-200"
          >
            <Minus className="h-4 w-4" />
            Reset to Defaults
          </Button>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border-gray-300 hover:border-gray-400 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Structure
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
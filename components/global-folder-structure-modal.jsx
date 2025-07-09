"use client";

import { useState, useEffect } from "react";
import { X, FolderTree, Save, RotateCcw, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function GlobalFolderStructureModal({ isOpen, onClose }) {
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

  const [driveLink, setDriveLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCurrentSettings();
    }
  }, [isOpen]);

  const fetchCurrentSettings = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/global-settings", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success && data.data.settings.folderStructure) {
        setFolderNames(data.data.settings.folderStructure);
        setDriveLink(data.data.settings.driveLink || "");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load current settings");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/global-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          folderStructure: folderNames,
          driveLink: driveLink.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Global folder structure updated successfully!");
        onClose();
      } else {
        toast.error(data.message || "Failed to update folder structure");
      }
    } catch (error) {
      console.error("Error saving folder structure:", error);
      toast.error("Failed to save folder structure");
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
    setDriveLink("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <FolderTree className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Global Folder Structure Settings</h2>
              <p className="text-purple-100 text-sm">
                Configure folder names and drive location for all teams
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
          {isFetching ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-gray-600">Loading current settings...</span>
            </div>
          ) : (
            <>
              {/* Drive Link Configuration */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Google Drive Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-blue-800">
                      Main Drive Folder Link (Optional)
                    </Label>
                    <Input
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.target.value)}
                      className="mt-2 border-blue-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      placeholder="https://drive.google.com/drive/folders/your-folder-id"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      Set the main Google Drive folder where all team folders will be created
                    </p>
                  </div>
                </div>
              </div>

              {/* Folder Tree Visualization */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FolderTree className="h-5 w-5" />
                  Global Folder Structure Preview
                </h3>
                <div className="font-mono text-sm space-y-1 text-gray-700 bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <span>📁</span>
                    <span className="font-semibold text-blue-600">{folderNames.rootFolder}</span>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <span>📁</span>
                    <span className="font-semibold text-green-600">[TEAM_ID]_[TEAM_NAME]</span>
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
                    <div className="flex items-center gap-2">
                      <span>📁</span>
                      <span className="text-orange-600">Member_1_[MEMBER_NAME]</span>
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
                    <div className="flex items-center gap-2 text-gray-500">
                      <span>...</span>
                      <span>Member_2, Member_3, etc.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Folder Names */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Main Folders</h3>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Root Folder Name</Label>
                    <Input
                      value={folderNames.rootFolder}
                      onChange={(e) => setFolderNames({
                        ...folderNames,
                        rootFolder: e.target.value
                      })}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                      placeholder="IBM_SkillsBuild_Teams"
                    />
                    <p className="text-xs text-gray-500">This is the main folder that contains all team folders</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Concept Note Folder</Label>
                    <Input
                      value={folderNames.conceptNoteFolder}
                      onChange={(e) => setFolderNames({
                        ...folderNames,
                        conceptNoteFolder: e.target.value
                      })}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
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
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
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
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                      placeholder="Member_Submissions"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Member Folders</h3>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Certificates Folder</Label>
                    <Input
                      value={folderNames.certificatesFolder}
                      onChange={(e) => setFolderNames({
                        ...folderNames,
                        certificatesFolder: e.target.value
                      })}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                      placeholder="Certificates"
                    />
                    <p className="text-xs text-gray-500">For IBM SkillsBuild completion certificates</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Resume & LinkedIn Folder</Label>
                    <Input
                      value={folderNames.resumeFolder}
                      onChange={(e) => setFolderNames({
                        ...folderNames,
                        resumeFolder: e.target.value
                      })}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                      placeholder="Resume_LinkedIn"
                    />
                    <p className="text-xs text-gray-500">For resumes and LinkedIn profile links</p>
                  </div>
                </div>
              </div>

              {/* Concept Note Subcategories */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Concept Note Subcategories</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
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
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
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
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
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
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                      placeholder="Implementation_Plan"
                    />
                  </div>

                  <div className="space-y-2 lg:col-span-2">
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
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                      placeholder="Team_Roles"
                    />
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📝 Important Notes</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• These settings apply to ALL new team folders created after saving</li>
                  <li>• Existing team folders will not be renamed automatically</li>
                  <li>• Use underscores (_) instead of spaces for better compatibility</li>
                  <li>• Avoid special characters that might cause issues in file systems</li>
                  <li>• The Drive link is optional but recommended for centralized management</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={isLoading || isFetching}
            className="flex items-center gap-2 rounded-xl border-gray-300 hover:border-gray-400 transition-all duration-200"
          >
            <RotateCcw className="h-4 w-4" />
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
              disabled={isLoading || isFetching}
              className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Global Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
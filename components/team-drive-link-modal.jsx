"use client";

import { useState } from "react";
import { X, ExternalLink, FolderOpen, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TeamDriveLinkModal({ isOpen, onClose, teamData }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (teamData?.folderStructure?.teamFolderLink) {
      try {
        await navigator.clipboard.writeText(teamData.folderStructure.teamFolderLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy link:", error);
      }
    }
  };

  const handleOpenDrive = () => {
    if (teamData?.folderStructure?.teamFolderLink) {
      window.open(teamData.folderStructure.teamFolderLink, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Team Drive Folder</h2>
              <p className="text-green-100 text-sm">
                {teamData?.teamID} - {teamData?.teamName || teamData?.collegeName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Folder Status</h3>
              <p className="text-gray-600 text-sm">Current state of the team's Google Drive folder</p>
            </div>
            <Badge
              variant={teamData?.folderStructureEnabled ? "default" : "secondary"}
              className={
                teamData?.folderStructureEnabled
                  ? "bg-green-100 text-green-800 rounded-full px-4 py-2"
                  : "bg-red-100 text-red-800 rounded-full px-4 py-2"
              }
            >
              {teamData?.folderStructureEnabled ? "✅ Active" : "❌ Inactive"}
            </Badge>
          </div>

          {/* Drive Link */}
          {teamData?.folderStructure?.teamFolderLink ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Google Drive Folder</h4>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">Folder Link:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded-lg text-blue-600 break-all">
                      {teamData.folderStructure.teamFolderLink}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="flex items-center gap-1 rounded-lg"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Folder Structure Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Folder Structure</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Created:</p>
                    <p className="font-medium">
                      {teamData.folderStructure.createdAt 
                        ? new Date(teamData.folderStructure.createdAt).toLocaleDateString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Member Folders:</p>
                    <p className="font-medium">
                      {Object.keys(teamData.folderStructure.memberFolders || {}).length} folders
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Concept Note Status:</p>
                    <Badge
                      variant={teamData.submitConceptNote ? "default" : "secondary"}
                      className={
                        teamData.submitConceptNote
                          ? "bg-green-100 text-green-800 rounded-full text-xs"
                          : "bg-gray-100 text-gray-800 rounded-full text-xs"
                      }
                    >
                      {teamData.submitConceptNote ? "Submitted" : "Pending"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-600">Final Deliverable:</p>
                    <Badge
                      variant={teamData.submitFinalDeliverable ? "default" : "secondary"}
                      className={
                        teamData.submitFinalDeliverable
                          ? "bg-green-100 text-green-800 rounded-full text-xs"
                          : "bg-gray-100 text-gray-800 rounded-full text-xs"
                      }
                    >
                      {teamData.submitFinalDeliverable ? "Submitted" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Submission Status */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h4 className="font-semibold text-yellow-900 mb-3">Submission Status</h4>
                <div className="space-y-2">
                  {teamData.conceptNoteSubmission?.status && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-yellow-800">Concept Note:</span>
                      <Badge className="bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        {teamData.conceptNoteSubmission.status}
                      </Badge>
                    </div>
                  )}
                  {teamData.finalDeliverableSubmission?.status && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-yellow-800">Final Deliverable:</span>
                      <Badge className="bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        {teamData.finalDeliverableSubmission.status}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Drive Folder</h4>
              <p className="text-gray-600">
                This team doesn't have a Google Drive folder set up yet.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50 rounded-b-2xl">
          <div className="text-sm text-gray-600">
            Team ID: <code className="bg-gray-200 px-2 py-1 rounded">{teamData?.teamID}</code>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-gray-300 hover:border-gray-400 transition-all duration-200"
            >
              Close
            </Button>
            {teamData?.folderStructure?.teamFolderLink && (
              <Button
                onClick={handleOpenDrive}
                className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all duration-200"
              >
                <ExternalLink className="h-4 w-4" />
                Open in Drive
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
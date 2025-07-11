"use client";

import { useState } from "react";
import CreateFolderStructure from "@/components/create-folder-structure";
import FolderStructure from "@/components/folder-structure";

export default function DemoFoldersPage() {
  const [createdStructure, setCreatedStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [teamId, setTeamId] = useState("");

  const handleCreateStructure = async (folderStructure) => {
    if (!teamId.trim()) {
      alert("Please enter a Team ID");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/create-folder-structure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamID: teamId.trim(),
          folderStructure
        })
      });

      const data = await response.json();
      if (data.success) {
        setCreatedStructure(data.data);
        alert("Folder structure created successfully!");
      } else {
        alert("Error creating folder structure: " + data.message);
      }
    } catch (error) {
      console.error('Error creating folder structure:', error);
      alert("Error creating folder structure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Drive Folder Structure Demo
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team ID (for testing)
          </label>
          <input
            type="text"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            placeholder="Enter team ID (e.g., TEAM_001)"
            className="w-full max-w-md p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <CreateFolderStructure
              onSubmit={handleCreateStructure}
              loading={loading}
            />
          </div>

          <div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Created Structure Preview
              </h2>
              
              {createdStructure ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-800">✅ Structure Created!</h3>
                    <p className="text-sm text-green-600 mt-1">
                      Team: {createdStructure.teamID}
                    </p>
                    <a 
                      href={createdStructure.shareableLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800"
                    >
                      📁 Open in Google Drive
                    </a>
                  </div>
                  
                  <div className="text-sm">
                    <h4 className="font-medium text-gray-700 mb-2">Folder Structure:</h4>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                      {JSON.stringify(createdStructure.folderStructure, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    📁
                  </div>
                  <p>Create a folder structure to see the preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            How It Works:
          </h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• 📁 **Automatic Creation**: When users login, folders are automatically created with format: TeamID_TeamName</li>
            <li>• 🔗 **Shareable Links**: All folders are publicly accessible with shareable links</li>
            <li>• 📊 **Status Tracking**: Folder status updates when files are uploaded (empty → has_files)</li>
            <li>• 🏗️ **Custom Structure**: Create nested folders with unlimited depth</li>
            <li>• 🎯 **Default Structure**: Concept_Note (empty) + Final_Deliverable (Screenshots, Codes, Presentation)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

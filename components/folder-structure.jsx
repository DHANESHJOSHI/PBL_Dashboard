"use client";

import { useState, useEffect } from "react";
import { Folder, FolderOpen, FileText, ExternalLink } from "lucide-react";

export default function FolderStructure() {
  const [folderData, setFolderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  useEffect(() => {
    fetchFolderStatus();
  }, []);

  const fetchFolderStatus = async () => {
    try {
      const token = localStorage.getItem('teamToken');
      const response = await fetch('/api/team/folder-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setFolderData(data.data);
      }
    } catch (error) {
      console.error('Error fetching folder status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFolder = (folder, name, level = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const hasSubfolders = folder.subFolders && Object.keys(folder.subFolders).length > 0;
    const hasFiles = folder.status === 'has_files';

    return (
      <div key={folder.id} className="mb-2">
        <div 
          className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
            level > 0 ? 'ml-' + (level * 4) : ''
          }`}
          onClick={() => hasSubfolders && toggleFolder(folder.id)}
        >
          {hasSubfolders ? (
            isExpanded ? (
              <FolderOpen className="w-5 h-5 text-blue-500" />
            ) : (
              <Folder className="w-5 h-5 text-blue-500" />
            )
          ) : (
            <Folder className="w-5 h-5 text-gray-400" />
          )}
          
          <span className={`font-medium ${hasFiles ? 'text-green-600' : 'text-gray-600'}`}>
            {name}
          </span>
          
          {hasFiles && (
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600">Has Files</span>
            </div>
          )}
          
          {folder.isEmpty && (
            <span className="text-xs text-gray-400">(Empty)</span>
          )}
        </div>

        {hasSubfolders && isExpanded && (
          <div className="ml-4">
            {Object.entries(folder.subFolders).map(([subName, subFolder]) => 
              renderFolder(subFolder, subName, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!folderData) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">No folder structure found</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Drive Folder Structure</h2>
        {folderData.shareableLink && (
          <a 
            href={folderData.shareableLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm">Open in Drive</span>
          </a>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
          <Folder className="w-6 h-6 text-blue-600" />
          <span className="font-medium text-gray-800">
            {folderData.teamID}_{folderData.teamName || 'Team'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {folderData.folderStructure?.mainFolders && 
          Object.entries(folderData.folderStructure.mainFolders).map(([name, folder]) => 
            renderFolder(folder, name)
          )
        }
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          📁 All folders are automatically shared and accessible to team members
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Files uploaded to folders will automatically update their status
        </p>
      </div>
    </div>
  );
}

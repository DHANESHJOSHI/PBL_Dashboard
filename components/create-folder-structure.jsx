"use client";

import { useState } from "react";
import { Plus, Trash2, Folder } from "lucide-react";

export default function CreateFolderStructure({ onSubmit, loading = false }) {
  const [rootFolderName, setRootFolderName] = useState("");
  const [folders, setFolders] = useState([
    {
      id: 1,
      name: "Concept_Note",
      subFolders: []
    },
    {
      id: 2,
      name: "Final_Deliverable",
      subFolders: [
        { id: 21, name: "Screenshots" },
        { id: 22, name: "Codes" },
        { id: 23, name: "Presentation" }
      ]
    }
  ]);
  const [nextId, setNextId] = useState(3);

  const addFolder = () => {
    setFolders([...folders, {
      id: nextId,
      name: "",
      subFolders: []
    }]);
    setNextId(nextId + 1);
  };

  const removeFolder = (folderId) => {
    setFolders(folders.filter(folder => folder.id !== folderId));
  };

  const updateFolderName = (folderId, name) => {
    setFolders(folders.map(folder => 
      folder.id === folderId ? { ...folder, name } : folder
    ));
  };

  const addSubFolder = (parentId) => {
    setFolders(folders.map(folder => 
      folder.id === parentId 
        ? { 
            ...folder, 
            subFolders: [...folder.subFolders, { id: nextId, name: "" }] 
          }
        : folder
    ));
    setNextId(nextId + 1);
  };

  const removeSubFolder = (parentId, subFolderId) => {
    setFolders(folders.map(folder => 
      folder.id === parentId 
        ? { 
            ...folder, 
            subFolders: folder.subFolders.filter(sub => sub.id !== subFolderId) 
          }
        : folder
    ));
  };

  const updateSubFolderName = (parentId, subFolderId, name) => {
    setFolders(folders.map(folder => 
      folder.id === parentId 
        ? { 
            ...folder, 
            subFolders: folder.subFolders.map(sub => 
              sub.id === subFolderId ? { ...sub, name } : sub
            )
          }
        : folder
    ));
  };

  const handleSubmit = () => {
    const validFolders = folders.filter(folder => folder.name.trim() !== "");
    const folderStructure = {
      rootFolderName: rootFolderName.trim() || "Custom_Project",
      folders: validFolders.map(folder => ({
        name: folder.name.trim(),
        subFolders: folder.subFolders
          .filter(sub => sub.name.trim() !== "")
          .map(sub => ({ name: sub.name.trim() }))
      }))
    };

    onSubmit(folderStructure);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Custom Folder Structure</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Root Folder Name (Optional)
        </label>
        <input
          type="text"
          value={rootFolderName}
          onChange={(e) => setRootFolderName(e.target.value)}
          placeholder="Enter root folder name (default: Custom_Project)"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-4">
        {folders.map((folder) => (
          <div key={folder.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Folder className="w-5 h-5 text-blue-500" />
              <input
                type="text"
                value={folder.name}
                onChange={(e) => updateFolderName(folder.id, e.target.value)}
                placeholder="Folder name"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => removeFolder(folder.id)}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {folder.subFolders.length > 0 && (
              <div className="ml-6 space-y-2">
              {folder.subFolders.map((subFolder) => (
              <div key={subFolder.id} className="flex items-center space-x-2">
              <Folder className="w-4 h-4 text-gray-400" />
              <input
              type="text"
              value={subFolder.name}
              onChange={(e) => updateSubFolderName(folder.id, subFolder.id, e.target.value)}
              placeholder="Subfolder name"
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
              onClick={() => removeSubFolder(folder.id, subFolder.id)}
              className="p-2 text-red-500 hover:text-red-700"
              >
              <Trash2 className="w-4 h-4" />
              </button>
              </div>
              ))}
              </div>
            )}

            <button
              onClick={() => addSubFolder(folder.id)}
              className="mt-2 ml-6 flex items-center space-x-1 text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Subfolder</span>
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={addFolder}
          className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Folder</span>
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Folder Structure"}
        </button>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          💡 <strong>Note:</strong> Empty folders will be automatically excluded from the structure
        </p>
      </div>
    </div>
  );
}

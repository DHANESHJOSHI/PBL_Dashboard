"use client";

import { useState } from "react";
import { X, Upload, Link, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SubmissionPopup({ isOpen, onClose, onSave, type, initialData = {} }) {
  const [file, setFile] = useState(null);
  const [linkedinLink, setLinkedinLink] = useState(initialData.linkedinLink || "");
  const [subCategory, setSubCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const conceptNoteCategories = [
    { value: "Problem_Statement", label: "Problem Statement" },
    { value: "Solution_Approach", label: "Solution Approach" },
    { value: "Technical_Architecture", label: "Technical Architecture" },
    { value: "Implementation_Plan", label: "Implementation Plan" },
    { value: "Team_Roles", label: "Team Roles" }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        e.target.value = ''; // Reset input
        return;
      }

      // Validate file type based on submission type
      const allowedTypes = {
        certificate: ['.pdf', '.jpg', '.jpeg', '.png'],
        resume: ['.pdf', '.doc', '.docx'],
        conceptNote: ['.pdf', '.doc', '.docx', '.ppt', '.pptx'],
        finalDeliverable: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip', '.rar']
      };

      const fileName = selectedFile.name.toLowerCase();
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
      
      if (!allowedTypes[type]?.includes(fileExtension)) {
        toast.error(`Invalid file type for ${type}. Allowed: ${allowedTypes[type]?.join(', ')}`);
        e.target.value = ''; // Reset input
        return;
      }

      setFile(selectedFile);
      toast.success(`File "${selectedFile.name}" selected successfully`);
    }
  };

  const validateLinkedInURL = (url) => {
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    return linkedinRegex.test(url.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    if (type === "conceptNote" && !subCategory) {
      toast.error("Please select a concept note category");
      return;
    }

    if (type === "resume") {
      if (!linkedinLink.trim()) {
        toast.error("Please provide your LinkedIn profile link");
        return;
      }
      
      if (!validateLinkedInURL(linkedinLink)) {
        toast.error("Please provide a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourprofile)");
        return;
      }
    }

    setIsUploading(true);

    try {
      const teamData = JSON.parse(localStorage.getItem("teamData"));
      const token = localStorage.getItem("teamToken");
      
      if (!teamData || !token) {
        toast.error("Authentication error. Please login again.");
        onClose();
        return;
      }

      console.log('Preparing upload for:', {
        type,
        fileName: file.name,
        fileSize: file.size,
        teamID: teamData.teamID,
        memberIndex: initialData.memberIndex
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("teamId", teamData.teamID);
      formData.append("submissionType", type);
      
      if (initialData.memberIndex !== undefined && initialData.memberIndex !== null) {
        formData.append("memberIndex", initialData.memberIndex.toString());
      }
      
      if (subCategory) {
        formData.append("subCategory", subCategory);
      }
      
      if (linkedinLink.trim()) {
        formData.append("linkedinLink", linkedinLink.trim());
      }

      console.log('Sending upload request...');

      const response = await fetch("/api/team/submissions", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      console.log('Upload response status:', response.status);

      const data = await response.json();
      console.log('Upload response data:', data);

      if (data.success) {
        toast.success("File uploaded successfully!");
        onSave(data.data);
        onClose();
        // Reset form
        setFile(null);
        setLinkedinLink("");
        setSubCategory("");
        // Reset file input
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
      } else {
        console.error('Upload failed:', data.message);
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please check your connection and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      // Reset form when closing
      setFile(null);
      setLinkedinLink("");
      setSubCategory("");
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
      onClose();
    }
  };

  const getTitle = () => {
    switch (type) {
      case "certificate":
        return "Upload Certificate (Learning Plan)";
      case "resume":
        return "Upload Resume & LinkedIn Profile";
      case "conceptNote":
        return "Submit Concept Note";
      case "finalDeliverable":
        return "Submit Final Deliverable";
      default:
        return "Upload File";
    }
  };

  const getDescription = () => {
    switch (type) {
      case "certificate":
        return "Upload your IBM SkillsBuild learning plan completion certificate";
      case "resume":
        return "Upload your resume and provide your LinkedIn profile link";
      case "conceptNote":
        return "Upload your concept note document and select the appropriate category";
      case "finalDeliverable":
        return "Upload your final project deliverable";
      default:
        return "Select a file to upload";
    }
  };

  const getAcceptedFormats = () => {
    switch (type) {
      case "certificate":
        return "PDF, JPG, PNG";
      case "resume":
        return "PDF, DOC, DOCX";
      case "conceptNote":
      case "finalDeliverable":
        return "PDF, DOC, DOCX, PPT, PPTX" + (type === "finalDeliverable" ? ", ZIP, RAR" : "");
      default:
        return "Various formats";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
            <p className="text-sm text-gray-600 mt-1">{getDescription()}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isUploading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Concept Note Category Selection */}
          {type === "conceptNote" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Concept Note Category *
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                required
                disabled={isUploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
              >
                <option value="">Select a category</option>
                {conceptNoteCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* LinkedIn Link for Resume */}
          {type === "resume" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                LinkedIn Profile URL *
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="url"
                  value={linkedinLink}
                  onChange={(e) => setLinkedinLink(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  required
                  disabled={isUploading}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
                />
              </div>
              <p className="text-xs text-gray-500">
                Please provide your complete LinkedIn profile URL
              </p>
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select File *
            </label>
            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'
            }`}>
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept={
                  type === "certificate" 
                    ? ".pdf,.jpg,.jpeg,.png"
                    : type === "resume"
                    ? ".pdf,.doc,.docx"
                    : type === "conceptNote"
                    ? ".pdf,.doc,.docx,.ppt,.pptx"
                    : ".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                }
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer flex flex-col items-center space-y-2 ${isUploading ? 'pointer-events-none' : ''}`}
              >
                <Upload className={`h-8 w-8 ${file ? 'text-green-500' : 'text-gray-400'}`} />
                <span className={`text-sm ${file ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  {file ? `✓ ${file.name}` : "Click to select file"}
                </span>
                <span className="text-xs text-gray-500">
                  Max size: 10MB • Formats: {getAcceptedFormats()}
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
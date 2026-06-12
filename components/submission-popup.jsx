"use client";

import { useState } from "react";
import { X, Upload, Link, FileText, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function SubmissionPopup({ isOpen, onClose, onSave, type, initialData = {}, courseName, internshipName }) {
  const [file, setFile] = useState(null);
  const [linkedinLink, setLinkedinLink] = useState(initialData.linkedinLink || "");
  const [subCategory, setSubCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [submissionMethod, setSubmissionMethod] = useState("file"); // "file" or "link"
  const [driveLink, setDriveLink] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const finalDeliverableCategories = [
    { value: "Screenshots", label: "Screenshots" },
    { value: "Codes", label: "Codes" },
    { value: "Presentation", label: "Presentation" }
  ];

  const processFile = (selectedFile) => {
    if (selectedFile) {
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = ''; // Reset input
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
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = ''; // Reset input
        return;
      }

      setFile(selectedFile);
      toast.success(`File "${selectedFile.name}" selected successfully`);
    }
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const validateLinkedInURL = (url) => {
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    return linkedinRegex.test(url.trim());
  };

  const validateDriveLink = (url) => {
    const driveRegex = /^https?:\/\/(drive|docs)\.google\.com\/.*$/;
    return driveRegex.test(url.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isProjectSubmission = type === "conceptNote" || type === "finalDeliverable";

    if (submissionMethod === "file") {
      if (!file) {
        toast.error("Please select a file to upload");
        return;
      }
    } else if (isProjectSubmission && submissionMethod === "link") {
      if (!driveLink.trim()) {
        toast.error("Please provide a Google Drive link");
        return;
      }
      if (!validateDriveLink(driveLink)) {
        toast.error("Please provide a valid Google Drive link (e.g., https://drive.google.com/...)");
        return;
      }
    }

    if (type === "finalDeliverable" && !subCategory) {
      toast.error("Please select a deliverable category");
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
      if (submissionMethod === "file") {
        formData.append("file", file);
      } else {
        formData.append("driveLink", driveLink.trim());
      }
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
      
      if (submissionMethod === "link") {
        formData.append("submissionMethod", "link");
      } else {
        formData.append("submissionMethod", "file");
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
        setDriveLink("");
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
      setDriveLink("");
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
        return "Upload your concept note document";
      case "finalDeliverable":
        return "Upload your final project deliverable and select category";
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
          {/* Certificate Warning Note */}
          {type === "certificate" && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="ml-3 w-full">
                  <p className="text-sm text-amber-800 font-bold mb-1">
                    Important Upload Instructions
                  </p>
                  <p className="text-sm text-amber-700">
                    Please be careful and ensure you upload the correct certificate for your enrolled track:
                  </p>
                  
                  <div className="mt-2 mb-2 p-2.5 bg-amber-100/50 rounded-lg border border-amber-200/60">
                    {internshipName && (
                      <p className="text-sm text-amber-900 mb-1">
                        <span className="font-semibold">Internship:</span> {internshipName}
                      </p>
                    )}
                    {courseName ? (
                      <p className="text-sm text-amber-900">
                        <span className="font-semibold">Course Name:</span> {courseName}
                      </p>
                    ) : (
                      <p className="text-sm text-amber-700 italic">
                        <span className="font-semibold">Course Name:</span> Not specified
                      </p>
                    )}
                    {!internshipName && !courseName && (
                      <p className="text-sm text-amber-900 font-semibold">Your Enrolled Course</p>
                    )}
                  </div>

                  <p className="text-xs text-amber-700/80 italic">
                    Note: Our OCR system will scan the uploaded document to validate your name and course details. Incorrect certificates will be flagged automatically.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Concept Note Category Selection */}
          {type === "finalDeliverable" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                required
                disabled={isUploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
              >
                <option value="">Select a category...</option>
                {finalDeliverableCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Screenshots: Project interface images • Codes: Source code files • Presentation: Project slides
              </p>
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

          {/* Submission Method Toggle for Projects */}
          {(type === "conceptNote" || type === "finalDeliverable") && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Submission Method
              </label>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSubmissionMethod("file")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    submissionMethod === "file" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionMethod("link")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    submissionMethod === "link" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Drive Link
                </button>
              </div>
            </div>
          )}

          {/* File Upload or Drive Link Input */}
          {submissionMethod === "file" ? (
            <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select File *
            </label>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                  : file 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-blue-400'
              }`}
            >
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
                  {file ? `✓ ${file.name}` : isDragging ? "Drop file here" : "Click or drag file here"}
                </span>
                <span className="text-xs text-gray-500">
                  Max size: 10MB • Formats: {getAcceptedFormats()}
                </span>
              </label>
            </div>
          </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Google Drive Link *
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="url"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  required
                  disabled={isUploading}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
                />
              </div>
              <p className="text-xs text-gray-500">
                Please make sure the link access is set to "Anyone with the link can view".
              </p>
            </div>
          )}

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
              disabled={
                isUploading || 
                (submissionMethod === "file" && !file) || 
                (submissionMethod === "link" && !driveLink.trim()) ||
                (type === "finalDeliverable" && !subCategory) || 
                (type === "resume" && !linkedinLink.trim())
              }
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
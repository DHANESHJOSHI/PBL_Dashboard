"use client";

import { useState } from "react";
import { Folder, FileText, Upload, ExternalLink, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function DriveBasedDashboard({ 
  teamData, 
  isLeader, 
  handleSubmitConceptNote, 
  handleSubmitFinalDeliverable,
  handleSubmissionClick 
}) {
  const [expandedSections, setExpandedSections] = useState(new Set(['concept-note', 'final-deliverable']));

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getStatusColor = (hasFiles) => {
    if (hasFiles) return "text-green-600 bg-green-50 border-green-200";
    return "text-gray-500 bg-gray-50 border-gray-200";
  };

  const getStatusIcon = (hasFiles) => {
    if (hasFiles) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Team Folder Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">📁 {teamData.teamID}_{teamData.teamName}</h2>
            <p className="text-blue-100 text-sm md:text-base">Your team's organized workspace on Google Drive</p>
          </div>
          {teamData.folderStructure?.shareableLink && (
            <a 
              href={teamData.folderStructure.shareableLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in Drive</span>
            </a>
          )}
        </div>
      </div>

      {/* Concept Note Section */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('concept-note')}
        >
          <div className="flex items-center space-x-3">
            <Folder className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">📝 Concept Note</h3>
              <p className="text-sm text-gray-600">Project concept and planning documents</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusIcon(teamData.folderStructure?.conceptNoteFolderId || teamData.folderStructure?.mainFolders?.['Concept_Note']?.status === 'has_files')}
            <span className="text-sm font-medium text-gray-600">
              {teamData.folderStructure?.mainFolders?.['Concept_Note']?.isEmpty ? 'Empty' : 'Ready'}
            </span>
          </div>
        </div>

        {expandedSections.has('concept-note') && (
          <div className="border-t bg-gray-50 p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Status:</span> {teamData.conceptNoteSubmission?.status || 'Not Submitted'}
              </div>
              {teamData.conceptNoteSubmission?.submittedAt && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Submitted:</span> {new Date(teamData.conceptNoteSubmission.submittedAt).toLocaleDateString()}
                </div>
              )}
            </div>
            
            {isLeader && (
              <button
                onClick={handleSubmitConceptNote}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Submit Concept Note</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Final Deliverable Section */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('final-deliverable')}
        >
          <div className="flex items-center space-x-3">
            <Folder className="w-6 h-6 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">🎯 Final Deliverable</h3>
              <p className="text-sm text-gray-600">Complete project submission files</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusIcon(teamData.folderStructure?.mainFolders?.['Final_Deliverable']?.status === 'has_files')}
            <span className="text-sm font-medium text-gray-600">
              {teamData.submitFinalDeliverable ? 'Submitted' : 'Pending'}
            </span>
          </div>
        </div>

        {expandedSections.has('final-deliverable') && (
          <div className="border-t bg-gray-50 p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Screenshots */}
              <div className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getStatusColor(teamData.folderStructure?.mainFolders?.['Final_Deliverable']?.subFolders?.['Screenshots'])}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Folder className="w-5 h-5" />
                  <span className="font-medium text-sm md:text-base">📸 Screenshots</span>
                </div>
                <p className="text-xs text-gray-600">Project interface & demo images</p>
              </div>

              {/* Codes */}
              <div className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getStatusColor(teamData.folderStructure?.mainFolders?.['Final_Deliverable']?.subFolders?.['Codes'])}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Folder className="w-5 h-5" />
                  <span className="font-medium text-sm md:text-base">💻 Codes</span>
                </div>
                <p className="text-xs text-gray-600">Source code & technical files</p>
              </div>

              {/* Presentation */}
              <div className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getStatusColor(teamData.folderStructure?.mainFolders?.['Final_Deliverable']?.subFolders?.['Presentation'])}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Folder className="w-5 h-5" />
                  <span className="font-medium text-sm md:text-base">📊 Presentation</span>
                </div>
                <p className="text-xs text-gray-600">Project presentation slides</p>
              </div>
            </div>

            {isLeader && (
              <button
                onClick={handleSubmitFinalDeliverable}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Submit Final Deliverable</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Member Submissions Section */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('members')}
        >
          <div className="flex items-center space-x-3">
            <Folder className="w-6 h-6 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">👥 Member Submissions</h3>
              <p className="text-sm text-gray-600">Individual member certificates & resumes</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusIcon(teamData.folderStructure?.membersSubmissionsFolderId)}
            <span className="text-sm font-medium text-gray-600">
              {teamData.members?.length || 0} Members
            </span>
          </div>
        </div>

        {expandedSections.has('members') && (
          <div className="border-t bg-gray-50 p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamData.members?.map((member, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {member.fullName?.charAt(0) || (index + 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate text-sm md:text-base">{member.fullName}</p>
                      {member.isLeader && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600 font-medium">
                          👑 Leader
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Member Folder Info */}
                    {teamData.folderStructure?.memberFolders?.[index] && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        📁 {teamData.folderStructure.memberFolders[index].memberName || `Member_${index + 1}`}
                      </div>
                    )}

                    {/* Certificate Submission */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Folder className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-600">📜 Certificates</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {member.certificateFile ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <button
                            onClick={() => handleSubmissionClick(index, 'certificate')}
                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                          >
                            Upload
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Resume & LinkedIn Submission */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Folder className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-600">📄 Resume & LinkedIn</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {member.resumeFile ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <button
                            onClick={() => handleSubmissionClick(index, 'resume')}
                            className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100"
                          >
                            Upload
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Additional Links */}
                    {(member.linkedinLink || member.portfolioLink || member.githubLink) && (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {member.linkedinLink && (
                            <a href={member.linkedinLink} target="_blank" rel="noopener noreferrer" 
                               className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">
                              LinkedIn
                            </a>
                          )}
                          {member.portfolioLink && (
                            <a href={member.portfolioLink} target="_blank" rel="noopener noreferrer"
                               className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded hover:bg-purple-100">
                              Portfolio
                            </a>
                          )}
                          {member.githubLink && (
                            <a href={member.githubLink} target="_blank" rel="noopener noreferrer"
                               className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded hover:bg-gray-100">
                              GitHub
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drive Integration Status */}
      {!teamData.folderStructureEnabled && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="font-medium text-red-800">Drive Integration Not Set Up</h3>
              <p className="text-sm text-red-600">Please contact admin to set up Google Drive folders for your team.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import { FileText, Upload } from "lucide-react"

export default function WelcomeSection({ 
  teamData, 
  isLeader, 
  handleSubmitConceptNote, 
  handleSubmitFinalDeliverable 
}) {
  // Debug logging
  console.log('TeamData in WelcomeSection:', teamData);
  console.log('Leader Email from memberStats:', teamData?.memberStats?.leaderEmail);
  console.log('Fallback email:', teamData?.email);
  console.log('Leader Name:', teamData?.leaderName);
  console.log('Internship Name:', teamData?.internshipName);
  
  return (
    <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 lg:p-8 mb-8">
      <h1 className="text-2xl lg:text-3xl font-bold text-blue-800 text-center mb-8">
        Hello! Team {teamData.teamName || "<<Team Name>>"}
      </h1>

      {!isLeader && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-xl mb-6">
          <strong>Note:</strong> You are viewing team details. Only the team leader can edit information.
        </div>
      )}

      {/* Folder Structure Status */}
      {teamData.folderStructureEnabled ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✅</span>
            <div>
              <strong>Drive Integration Active!</strong>
              <p className="text-sm">Your team's Google Drive folder is set up and ready for submissions.</p>
              {teamData.folderStructure?.shareableLink && (
                <a 
                  href={teamData.folderStructure.shareableLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 underline text-sm"
                >
                  📁 Open Team Folder
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
          <strong>Notice:</strong> Google Drive folder structure not set up. Please contact admin to enable file submissions.
        </div>
      )}

      {/* Team Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-blue-800 font-semibold text-sm lg:text-base whitespace-nowrap">
            Unique Team ID :
          </label>
          <div className="border-b-2 border-blue-800 flex-1 pb-1">
            <span className="text-blue-800 font-medium">{teamData.teamID}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-blue-800 font-semibold text-sm lg:text-base whitespace-nowrap">
            College Pincode :
          </label>
          <div className="border-b-2 border-blue-800 flex-1 pb-1">
            <span className="text-blue-800 font-medium">{teamData.collegePincode}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-blue-800 font-semibold text-sm lg:text-base whitespace-nowrap">
            College Name :
          </label>
          <div className="border-b-2 border-blue-800 flex-1 pb-1">
            <span className="text-blue-800 font-medium">{teamData.collegeName}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-blue-800 font-semibold text-sm lg:text-base whitespace-nowrap">
            Internship Name :
          </label>
          <div className="border-b-2 border-blue-800 flex-1 pb-1">
            <span className="text-blue-800 font-medium">{teamData.internshipName}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-blue-800 font-semibold text-sm lg:text-base whitespace-nowrap">
            Total Team Members :
          </label>
          <div className="border-b-2 border-blue-800 flex-1 pb-1">
            <span className="text-blue-800 font-medium">{teamData.totalMembers}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-blue-800 font-semibold text-sm lg:text-base whitespace-nowrap">
            Total Female Team Member :
          </label>
          <div className="border-b-2 border-blue-800 flex-1 pb-1">
            <span className="text-blue-800 font-medium">{teamData.totalFemaleMembers}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-blue-800 font-semibold text-sm lg:text-base whitespace-nowrap">
            Team Leader Name :
          </label>
          <div className="border-b-2 border-blue-800 flex-1 pb-1">
            <span className="text-blue-800 font-medium">{teamData.leaderName}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-blue-800 font-semibold text-sm lg:text-base whitespace-nowrap">
            Team Leader Email :
          </label>
          <div className="border-b-2 border-blue-800 flex-1 pb-1">
            <span className="text-blue-800 font-medium">{teamData.memberStats?.leaderEmail || teamData.email}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleSubmitConceptNote}
          disabled={teamData.submitConceptNote || !isLeader || !teamData.folderStructureEnabled}
          className={`px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 text-sm lg:text-base ${
            teamData.submitConceptNote
              ? "bg-green-600 text-white cursor-not-allowed"
              : isLeader && teamData.folderStructureEnabled
                ? "bg-blue-700 text-white hover:bg-blue-800"
                : "bg-gray-400 text-white cursor-not-allowed"
          }`}
        >
          <FileText className="h-4 w-4 lg:h-5 lg:w-5" />
          {teamData.submitConceptNote ? "CONCEPT NOTE SUBMITTED" : "SUBMIT CONCEPT NOTE"}
        </button>
        <button
          onClick={handleSubmitFinalDeliverable}
          disabled={teamData.submitFinalDeliverable || !isLeader || !teamData.folderStructureEnabled}
          className={`px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 text-sm lg:text-base ${
            teamData.submitFinalDeliverable
              ? "bg-green-600 text-white cursor-not-allowed"
              : isLeader && teamData.folderStructureEnabled
                ? "bg-blue-700 text-white hover:bg-blue-800"
                : "bg-gray-400 text-white cursor-not-allowed"
          }`}
        >
          <Upload className="h-4 w-4 lg:h-5 lg:w-5" />
          {teamData.submitFinalDeliverable ? "FINAL DELIVERABLE SUBMITTED" : "SUBMIT FINAL DELIVERABLE"}
        </button>
      </div>
    </div>
  )
}

import { Edit, Users, Upload, ExternalLink } from "lucide-react"

export default function TeamMemberCard({ 
  member, 
  index, 
  isLeader, 
  editingMember, 
  isSaving,
  teamData,
  handleEdit, 
  handleMemberUpdate, 
  handleSave, 
  handleSubmissionClick 
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border-0 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg lg:text-xl font-bold text-blue-800 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Member {index + 1} {member.isLeader ? "(LEADER)" : ""}
        </h3>
        {isLeader && (
          <button 
            onClick={() => handleEdit(index)} 
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200 text-sm lg:text-base"
          >
            <Edit className="h-4 w-4" />
            (Edit)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        <div>
          <label className="block text-blue-800 font-semibold mb-2 text-sm lg:text-base">Full Name :</label>
          {editingMember === index ? (
            <input
              type="text"
              value={member.fullName}
              onChange={(e) => handleMemberUpdate(index, "fullName", e.target.value)}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white text-sm lg:text-base"
              placeholder="Enter full name"
            />
          ) : (
            <div className="text-gray-700 px-3 lg:px-4 py-2 lg:py-3 bg-gray-50 rounded-xl border text-sm lg:text-base">
              {member.fullName}
            </div>
          )}
        </div>
        <div>
          <label className="block text-blue-800 font-semibold mb-2 text-sm lg:text-base">Email ID :</label>
          {editingMember === index ? (
            <input
              type="email"
              value={member.email}
              onChange={(e) => handleMemberUpdate(index, "email", e.target.value)}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white text-sm lg:text-base"
              placeholder="Enter email address"
            />
          ) : (
            <div className="text-gray-700 px-3 lg:px-4 py-2 lg:py-3 bg-gray-50 rounded-xl border text-sm lg:text-base">
              {member.email}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        <div>
          <label className="block text-blue-800 font-semibold mb-2 text-sm lg:text-base">Learning Plan Completion :</label>
          <div className="text-gray-700 px-3 lg:px-4 py-2 lg:py-3 bg-gray-100 rounded-xl border border-gray-300 cursor-not-allowed text-sm lg:text-base">
            {member.learningPlanCompletion}
          </div>
        </div>
        <div>
          <label className="block text-blue-800 font-semibold mb-2 text-sm lg:text-base">Current Marks :</label>
          <div className="text-gray-700 px-3 lg:px-4 py-2 lg:py-3 bg-gray-100 rounded-xl border border-gray-300 cursor-not-allowed text-sm lg:text-base">
            {member.currentMarks}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-blue-800 font-semibold mb-3 text-sm lg:text-base">Submission Links :</label>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <button
              onClick={() => handleSubmissionClick(index, "certificate")}
              disabled={!teamData.folderStructureEnabled}
              className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 text-sm lg:text-base ${
                teamData.folderStructureEnabled 
                  ? "bg-blue-700 text-white hover:bg-blue-800" 
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              <Upload className="h-4 w-4" />
              Certificate Upload (Learning Plan)
            </button>
          </div>
          <div className="flex-1">
            <button
              onClick={() => handleSubmissionClick(index, "resume")}
              disabled={!teamData.folderStructureEnabled}
              className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 text-sm lg:text-base ${
                teamData.folderStructureEnabled 
                  ? "bg-blue-700 text-white hover:bg-blue-800" 
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              <ExternalLink className="h-4 w-4" />
              Resume Upload
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-blue-800 font-semibold mb-2 text-sm lg:text-base">LinkedIn Profile URL :</label>
        {editingMember === index ? (
          <input
            type="url"
            value={member.linkedinLink}
            onChange={(e) => handleMemberUpdate(index, "linkedinLink", e.target.value)}
            className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white text-sm lg:text-base"
            placeholder="https://linkedin.com/in/your-profile"
          />
        ) : (
          <div className="text-gray-700 px-3 lg:px-4 py-2 lg:py-3 bg-gray-50 rounded-xl border text-sm lg:text-base">
            {member.linkedinLink ? (
              <a href={member.linkedinLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <ExternalLink className="h-4 w-4" />
                View LinkedIn Profile
              </a>
            ) : (
              <span className="text-gray-400">No LinkedIn profile added</span>
            )}
          </div>
        )}
      </div>

      {editingMember === index && (
        <div className="text-center">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-green-700 transition-all duration-200 disabled:opacity-50 text-sm lg:text-base"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  )
}
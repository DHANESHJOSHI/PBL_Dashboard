import mongoose from "mongoose"

const TeamMemberSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    learningPlanCompletion: { type: String, default: "0%" },
    currentMarks: { type: String, default: "0" },
    certificateLink: { type: String, default: "" },
    certificateFile: { type: String, default: "" },
    resumeLink: { type: String, default: "" },
    resumeFile: { type: String, default: "" },
    linkedinLink: { type: String, default: "" },
    portfolioLink: { type: String, default: "" },
    githubLink: { type: String, default: "" },
    additionalNotes: { type: String, default: "" },
    isLeader: { type: Boolean, default: false },
  },
  { _id: false },
)

const FolderStructureSchema = new mongoose.Schema(
  {
    teamsFolderId: { type: String },
    teamFolderId: { type: String },
    teamFolderLink: { type: String }, // Drive link to team folder
    conceptNoteFolderId: { type: String },
    conceptNoteSubfolders: {
      Problem_Statement: { type: String },
      Solution_Approach: { type: String },
      Technical_Architecture: { type: String },
      Implementation_Plan: { type: String },
      Team_Roles: { type: String }
    },
    finalDeliverableFolderId: { type: String },
    membersSubmissionsFolderId: { type: String },
    memberFolders: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
    // Custom folder names
    customFolderNames: {
      rootFolder: { type: String, default: "IBM_SkillsBuild_Teams" },
      conceptNoteFolder: { type: String, default: "Concept_Note" },
      finalDeliverableFolder: { type: String, default: "Final_Deliverable" },
      memberSubmissionsFolder: { type: String, default: "Member_Submissions" },
      certificatesFolder: { type: String, default: "Certificates" },
      resumeFolder: { type: String, default: "Resume_LinkedIn" },
      conceptNoteSubcategories: {
        problemStatement: { type: String, default: "Problem_Statement" },
        solutionApproach: { type: String, default: "Solution_Approach" },
        technicalArchitecture: { type: String, default: "Technical_Architecture" },
        implementationPlan: { type: String, default: "Implementation_Plan" },
        teamRoles: { type: String, default: "Team_Roles" }
      }
    }
  },
  { _id: false }
)

const TeamSchema = new mongoose.Schema({
  teamID: { type: String, required: true, unique: true },
  teamName: { type: String },
  collegeName: { type: String, required: true },
  collegePincode: { type: String, required: true },
  collegeId: { type: String, required: true },
  leaderName: { type: String, required: true },
  email: { type: String, required: true },
  totalMembers: { type: Number, required: true },
  totalFemaleMembers: { type: Number, required: true },
  submitConceptNote: { type: Boolean, default: false },
  submitFinalDeliverable: { type: Boolean, default: false },
  conceptNoteSubmission: {
    fileId: { type: String },
    webViewLink: { type: String },
    fileName: { type: String },
    submittedAt: { type: Date },
    subCategory: { type: String },
    status: { type: String, enum: ['pending', 'submitted', 'reviewed', 'approved', 'rejected'], default: 'pending' }
  },
  finalDeliverableSubmission: {
    fileId: { type: String },
    webViewLink: { type: String },
    fileName: { type: String },
    submittedAt: { type: Date },
    status: { type: String, enum: ['pending', 'submitted', 'reviewed', 'approved', 'rejected'], default: 'pending' }
  },
  // Boolean field to enable/disable submission buttons
  folderStructureEnabled: { type: Boolean, default: false },
  // Detailed folder structure info
  folderStructure: { type: FolderStructureSchema },
  members: { type: [TeamMemberSchema], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.models.Team || mongoose.model("Team", TeamSchema)
import mongoose from 'mongoose';

const GlobalSettingsSchema = new mongoose.Schema({
  settingType: {
    type: String,
    required: true,
    unique: true,
    enum: ['folderStructure']
  },
  folderStructure: {
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
  },
  driveLink: { type: String, default: "" }, // Main Google Drive folder link
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
GlobalSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const GlobalSettings = mongoose.models.GlobalSettings || mongoose.model('GlobalSettings', GlobalSettingsSchema);

export default GlobalSettings;
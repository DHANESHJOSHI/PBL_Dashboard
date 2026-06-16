import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Define the Team Schema manually to avoid import issues
const TeamMemberSchema = new mongoose.Schema({
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
  isAlternateLeader: { type: Boolean, default: false },
  certificateValidationStatus: { type: String, default: "" },
  certificateValidationNotes: { type: String, default: "" },
}, { _id: false });

const TeamSchema = new mongoose.Schema({
  teamID: { type: String, required: true, unique: true },
  teamName: { type: String },
  internshipName: { type: String },
  courseName: { type: String },
  collegeName: { type: String, required: true },
  collegePincode: { type: String, required: true },
  collegeId: { type: String, required: true },
  leaderName: { type: String, required: true },
  email: { type: String, required: true },
  totalMembers: { type: Number, required: true },
  totalFemaleMembers: { type: Number, required: true },
  folderStructureEnabled: { type: Boolean, default: false },
  members: { type: [TeamMemberSchema], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema);

async function createTestTeam() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is missing in .env.local");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB.");

    const testTeamID = "TESTSB2025" + Math.floor(1000 + Math.random() * 9000);
    
    const newTeam = new Team({
      teamID: testTeamID,
      teamName: "Test Team Alpha",
      internshipName: "Artificial Intelligence",
      courseName: "B.Tech Computer Science",
      collegeName: "Demo Institute of Technology",
      collegePincode: "110001",
      collegeId: "COL-DEMO-1",
      leaderName: "Test Leader",
      email: "test.leader@gmail.com",
      totalMembers: 2,
      totalFemaleMembers: 1,
      folderStructureEnabled: false,
      members: [
        {
          fullName: "Test Leader",
          email: "test.leader@gmail.com",
          isLeader: true,
        },
        {
          fullName: "Test Member 2",
          email: "test.member2@gmail.com",
          isLeader: false,
        }
      ]
    });

    await newTeam.save();
    console.log(`\n🎉 Test team created successfully!`);
    console.log(`==========================================`);
    console.log(`🧑‍💻 Team ID: ${testTeamID}`);
    console.log(`📧 Leader Email: test.leader@gmail.com`);
    console.log(`==========================================`);
    console.log(`\n📌 NEXT STEPS TO TEST UPLOAD:`);
    console.log(`1. Go to your Admin Dashboard (http://localhost:3000/admin/dashboard)`);
    console.log(`2. Find the team '${testTeamID}' in the Teams list.`);
    console.log(`3. Click 'Enable/Create Folders' for this team. This will create fresh Drive folders using your NEW Service Account.`);
    console.log(`4. Log out of Admin, and Log in to the Team Dashboard using '${testTeamID}'.`);
    console.log(`5. Try uploading the file again!`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating team:", err);
    process.exit(1);
  }
}

createTestTeam();

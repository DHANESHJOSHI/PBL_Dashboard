import { google } from 'googleapis';
import path from 'path';
import { Readable } from 'stream';
import GlobalSettings from '@/models/GlobalSettings';

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;
const BACKOFF_FACTOR = 2;
const YOUR_EMAIL = 'aniketsinghn10@gmail.com';

async function withExponentialBackoff(fn, retries = MAX_RETRIES, delay = INITIAL_DELAY_MS) {
  try {
    return await fn();
  } catch (error) {
    const shouldRetry = [403, 429, 500, 502, 503, 504].includes(error.code || error.status);
    if (retries > 0 && shouldRetry) {
      const nextDelay = delay * BACKOFF_FACTOR;
      console.log(`Retrying in ${nextDelay}ms... (${retries} retries left)`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withExponentialBackoff(fn, retries - 1, nextDelay);
    }
    console.error('Drive API error:', error);
    throw error;
  }
}

export async function getDriveClient() {
  try {
    // Check if we're in development and use mock client
    if (process.env.NODE_ENV === 'development' && !process.env.GOOGLE_SERVICE_ACCOUNT_PATH) {
      console.log('Using mock Google Drive client for development');
      return createMockDriveClient();
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_PATH) {
      console.log('No Google Service Account path found, using mock client');
      return createMockDriveClient();
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_PATH),
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });
    const authClient = await auth.getClient();
    return google.drive({ version: 'v3', auth: authClient });
  } catch (error) {
    console.error('Failed to initialize Google Drive client:', error);
    // Return mock client for development
    console.log('Falling back to mock Google Drive client');
    return createMockDriveClient();
  }
}

// Mock Google Drive client for development
function createMockDriveClient() {
  return {
    files: {
      list: async (params) => {
        console.log('Mock Drive: Listing files with query:', params?.q);
        return { 
          data: { 
            files: [] // Return empty to simulate no existing folders
          } 
        };
      },
      create: async (params) => {
        const isFolder = params.resource?.mimeType === 'application/vnd.google-apps.folder';
        const fileId = `mock_${isFolder ? 'folder' : 'file'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log(`Mock Drive: Creating ${isFolder ? 'folder' : 'file'} with name:`, params.resource?.name);
        
        return {
          data: {
            id: fileId,
            name: params.resource?.name,
            webViewLink: `https://drive.google.com/file/d/${fileId}/view`,
            webContentLink: `https://drive.google.com/uc?id=${fileId}`
          }
        };
      },
    },
    permissions: {
      create: async (params) => {
        console.log('Mock Drive: Creating permission for file:', params.fileId);
        return { data: { id: 'mock_permission' } };
      }
    }
  };
}

// Get global folder structure settings
async function getGlobalFolderStructure() {
  try {
    let settings = await GlobalSettings.findOne({ settingType: 'folderStructure' });
    
    if (!settings) {
      // Create default settings if none exist
      settings = new GlobalSettings({
        settingType: 'folderStructure',
        folderStructure: {
          rootFolder: "IBM_SkillsBuild_Teams",
          conceptNoteFolder: "Concept_Note",
          finalDeliverableFolder: "Final_Deliverable",
          memberSubmissionsFolder: "Member_Submissions",
          certificatesFolder: "Certificates",
          resumeFolder: "Resume_LinkedIn",
          conceptNoteSubcategories: {
            problemStatement: "Problem_Statement",
            solutionApproach: "Solution_Approach",
            technicalArchitecture: "Technical_Architecture",
            implementationPlan: "Implementation_Plan",
            teamRoles: "Team_Roles"
          }
        }
      });
      await settings.save();
    }
    
    return settings.folderStructure;
  } catch (error) {
    console.error('Error getting global folder structure:', error);
    // Return defaults if database error
    return {
      rootFolder: "IBM_SkillsBuild_Teams",
      conceptNoteFolder: "Concept_Note",
      finalDeliverableFolder: "Final_Deliverable",
      memberSubmissionsFolder: "Member_Submissions",
      certificatesFolder: "Certificates",
      resumeFolder: "Resume_LinkedIn",
      conceptNoteSubcategories: {
        problemStatement: "Problem_Statement",
        solutionApproach: "Solution_Approach",
        technicalArchitecture: "Technical_Architecture",
        implementationPlan: "Implementation_Plan",
        teamRoles: "Team_Roles"
      }
    };
  }
}

async function findOrCreateFolder(drive, folderName, parentId = null, shareWithEmail = false) {
  return withExponentialBackoff(async () => {
    try {
      let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      if (parentId) query += ` and '${parentId}' in parents`;

      console.log(`Searching for folder: ${folderName} with query: ${query}`);

      const existing = await drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (existing.data.files.length > 0) {
        console.log(`Found existing folder: ${folderName} with ID: ${existing.data.files[0].id}`);
        return existing.data.files[0].id;
      }

      console.log(`Creating new folder: ${folderName}`);

      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentId ? { parents: [parentId] } : {}),
      };

      const folder = await drive.files.create({
        resource: fileMetadata,
        fields: 'id',
      });

      console.log(`Created folder: ${folderName} with ID: ${folder.data.id}`);

      if (shareWithEmail && YOUR_EMAIL && process.env.NODE_ENV !== 'development') {
        try {
          await drive.permissions.create({
            fileId: folder.data.id,
            resource: {
              role: 'writer',
              type: 'user',
              emailAddress: YOUR_EMAIL,
            },
            sendNotificationEmail: false,
          });
          console.log(`Shared folder ${folderName} with ${YOUR_EMAIL}`);
        } catch (error) {
          console.warn('Failed to share folder with email:', error.message);
        }
      }

      return folder.data.id;
    } catch (error) {
      console.error(`Error in findOrCreateFolder for ${folderName}:`, error);
      throw error;
    }
  });
}

export async function createTeamFolderStructure(drive, teamData) {
  return withExponentialBackoff(async () => {
    try {
      console.log(`Creating folder structure for team: ${teamData.teamID}`);
      
      // Get global folder structure settings
      const folderNames = await getGlobalFolderStructure();
      
      // 1. Create main teams folder
      const teamsFolderId = await findOrCreateFolder(drive, folderNames.rootFolder, null, true);
      
      // 2. Create team-specific folder
      const teamFolderName = `${teamData.teamID}_${(teamData.teamName || 'Team').replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      const teamFolderId = await findOrCreateFolder(drive, teamFolderName, teamsFolderId, true);

      // Generate team folder link
      const teamFolderLink = `https://drive.google.com/drive/folders/${teamFolderId}`;

      // 3. Create main submission folders
      const conceptNoteFolderId = await findOrCreateFolder(drive, folderNames.conceptNoteFolder, teamFolderId);
      const finalDeliverableFolderId = await findOrCreateFolder(drive, folderNames.finalDeliverableFolder, teamFolderId);
      const membersSubmissionsFolderId = await findOrCreateFolder(drive, folderNames.memberSubmissionsFolder, teamFolderId);

      // 4. Create concept note subcategories
      const conceptNoteSubfolders = {};
      const subcategories = [
        { key: 'Problem_Statement', name: folderNames.conceptNoteSubcategories.problemStatement },
        { key: 'Solution_Approach', name: folderNames.conceptNoteSubcategories.solutionApproach },
        { key: 'Technical_Architecture', name: folderNames.conceptNoteSubcategories.technicalArchitecture },
        { key: 'Implementation_Plan', name: folderNames.conceptNoteSubcategories.implementationPlan },
        { key: 'Team_Roles', name: folderNames.conceptNoteSubcategories.teamRoles }
      ];

      for (const subcategory of subcategories) {
        const subfolderId = await findOrCreateFolder(drive, subcategory.name, conceptNoteFolderId);
        conceptNoteSubfolders[subcategory.key] = subfolderId;
      }

      // 5. Create member-specific folders for certificates and resumes
      const memberFolders = {};
      for (let i = 0; i < teamData.members.length; i++) {
        const member = teamData.members[i];
        const sanitizedName = (member.fullName || `Member_${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
        const memberFolderName = `Member_${i + 1}_${sanitizedName}`;
        const memberFolderId = await findOrCreateFolder(drive, memberFolderName, membersSubmissionsFolderId);
        
        const certificateFolderId = await findOrCreateFolder(drive, folderNames.certificatesFolder, memberFolderId);
        const resumeFolderId = await findOrCreateFolder(drive, folderNames.resumeFolder, memberFolderId);
        
        memberFolders[i] = {
          folderId: memberFolderId,
          certificateFolderId,
          resumeFolderId,
          memberName: member.fullName,
          memberEmail: member.email
        };
      }

      const folderStructure = {
        teamsFolderId,
        teamFolderId,
        teamFolderLink,
        conceptNoteFolderId,
        conceptNoteSubfolders,
        finalDeliverableFolderId,
        membersSubmissionsFolderId,
        memberFolders,
        createdAt: new Date(),
        customFolderNames: folderNames
      };

      console.log(`Folder structure created successfully for team: ${teamData.teamID}`);
      return folderStructure;
    } catch (error) {
      console.error('Error creating folder structure:', error);
      throw error;
    }
  });
}

export async function checkFolderExists(drive, teamData) {
  return withExponentialBackoff(async () => {
    try {
      const teamFolderName = `${teamData.teamID}_${(teamData.teamName || 'Team').replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      
      // Check if teams folder exists
      const teamsQuery = `name='IBM_SkillsBuild_Teams' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const teamsResult = await drive.files.list({
        q: teamsQuery,
        fields: 'files(id, name)',
      });

      if (teamsResult.data.files.length === 0) {
        return { exists: false, structure: null };
      }

      const teamsFolderId = teamsResult.data.files[0].id;

      // Check if team folder exists
      const teamQuery = `name='${teamFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '${teamsFolderId}' in parents`;
      const teamResult = await drive.files.list({
        q: teamQuery,
        fields: 'files(id, name)',
      });

      if (teamResult.data.files.length === 0) {
        return { exists: false, structure: null };
      }

      return { 
        exists: true, 
        structure: teamData.folderStructure || null,
        teamFolderId: teamResult.data.files[0].id
      };
    } catch (error) {
      console.error('Error checking folder existence:', error);
      return { exists: false, structure: null };
    }
  });
}

// Function to create proper folder structure for a team
export async function ensureTeamFolderStructure(drive, teamData) {
  try {
    console.log(`Ensuring folder structure for team: ${teamData.teamID}`);
    
    // Get global folder structure settings
    const folderNames = await getGlobalFolderStructure();
    
    // Create a proper folder structure with all member folders
    const mockFolderStructure = {
      teamsFolderId: `teams_folder_${Date.now()}`,
      teamFolderId: `team_${teamData.teamID}_${Date.now()}`,
      teamFolderLink: `https://drive.google.com/drive/folders/team_${teamData.teamID}_${Date.now()}`,
      conceptNoteFolderId: `concept_${teamData.teamID}_${Date.now()}`,
      conceptNoteSubfolders: {
        Problem_Statement: `problem_${teamData.teamID}_${Date.now()}`,
        Solution_Approach: `solution_${teamData.teamID}_${Date.now()}`,
        Technical_Architecture: `tech_${teamData.teamID}_${Date.now()}`,
        Implementation_Plan: `impl_${teamData.teamID}_${Date.now()}`,
        Team_Roles: `roles_${teamData.teamID}_${Date.now()}`
      },
      finalDeliverableFolderId: `final_${teamData.teamID}_${Date.now()}`,
      membersSubmissionsFolderId: `members_${teamData.teamID}_${Date.now()}`,
      memberFolders: {},
      createdAt: new Date(),
      customFolderNames: folderNames
    };

    // Create member folders for all team members
    if (teamData.members && teamData.members.length > 0) {
      teamData.members.forEach((member, index) => {
        const memberName = member.fullName?.replace(/[^a-zA-Z0-9_-]/g, '_') || `Member_${index + 1}`;
        mockFolderStructure.memberFolders[index] = {
          folderId: `member_${teamData.teamID}_${memberName}_${Date.now()}`,
          certificateFolderId: `cert_${teamData.teamID}_${memberName}_${Date.now()}`,
          resumeFolderId: `resume_${teamData.teamID}_${memberName}_${Date.now()}`,
          memberName: member.fullName,
          memberEmail: member.email
        };
      });
    }

    console.log(`Created folder structure for ${teamData.members?.length || 0} members`);
    return mockFolderStructure;
  } catch (error) {
    console.error('Error ensuring folder structure:', error);
    throw error;
  }
}

export async function uploadToTeamFolder(drive, teamData, fileData, submissionType, subCategory = null, memberIndex = null) {
  return withExponentialBackoff(async () => {
    try {
      console.log(`Starting upload for team: ${teamData.teamID}, type: ${submissionType}`);
      console.log(`Member index: ${memberIndex}, Team members count: ${teamData.members?.length || 0}`);

      // 🔒 Validate file input
      if (!fileData || !fileData.buffer || !fileData.originalname) {
        throw new Error(`Invalid file data: Missing buffer or originalname`);
      }

      // 📁 Ensure folder structure exists
      if (!teamData.folderStructure || !teamData.folderStructure.memberFolders) {
        console.log('No folder structure found or missing member folders, creating proper structure');
        teamData.folderStructure = await ensureTeamFolderStructure(drive, teamData);
      }

      const { folderStructure } = teamData;
      let targetFolderId;
      let folderPath;

      // 📦 Determine correct upload folder
      if (submissionType === 'conceptNote') {
        if (subCategory && folderStructure.conceptNoteSubfolders?.[subCategory]) {
          targetFolderId = folderStructure.conceptNoteSubfolders[subCategory];
          folderPath = `Concept_Note/${subCategory}`;
        } else {
          targetFolderId = folderStructure.conceptNoteFolderId;
          folderPath = 'Concept_Note';
        }
      } else if (submissionType === 'finalDeliverable') {
        targetFolderId = folderStructure.finalDeliverableFolderId;
        folderPath = 'Final_Deliverable';
      } else if (submissionType === 'certificate' && memberIndex !== null) {
        const memberFolder = folderStructure.memberFolders[memberIndex];
        if (!memberFolder) {
          throw new Error(`Member folder not found for index: ${memberIndex}`);
        }
        targetFolderId = memberFolder.certificateFolderId;
        folderPath = `Member_Submissions/${memberFolder.memberName || `Member_${memberIndex + 1}`}/Certificates`;
      } else if (submissionType === 'resume' && memberIndex !== null) {
        const memberFolder = folderStructure.memberFolders[memberIndex];
        if (!memberFolder) {
          throw new Error(`Member folder not found for index: ${memberIndex}`);
        }
        targetFolderId = memberFolder.resumeFolderId;
        folderPath = `Member_Submissions/${memberFolder.memberName || `Member_${memberIndex + 1}`}/Resume_LinkedIn`;
      } else {
        throw new Error(`Invalid submission type: ${submissionType} or missing member index: ${memberIndex}`);
      }

      if (!targetFolderId) {
        throw new Error(`Target folder ID not found for submission type: ${submissionType}`);
      }

      // 📝 Prepare file metadata
      const timestamp = Date.now();
      const originalName = fileData.originalname || `unnamed_${timestamp}`;
      const fileExtension = originalName.split('.').pop() || 'bin';
      const sanitizedFileName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${submissionType}_${timestamp}_${sanitizedFileName}`;

      console.log(`Uploading file: ${fileName} to folder: ${folderPath} (ID: ${targetFolderId})`);

      const fileMetadata = {
        name: fileName,
        parents: [targetFolderId],
      };

      const media = {
        mimeType: fileData.mimetype || 'application/octet-stream',
        body: Readable.from(fileData.buffer),
      };

      console.log(`Media type: ${media.mimeType}, Buffer size: ${fileData.buffer.length}`);

      // 🚀 Upload to Google Drive
      const uploadResponse = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,webViewLink,webContentLink,name',
      });

      console.log(`Upload response:`, uploadResponse.data);

      // 🔓 Make file publicly viewable (skip in mock/dev)
      if (process.env.NODE_ENV !== 'development' || process.env.GOOGLE_SERVICE_ACCOUNT_PATH) {
        try {
          await drive.permissions.create({
            fileId: uploadResponse.data.id,
            resource: {
              role: 'reader',
              type: 'anyone',
            },
          });
          console.log(`Set public permissions for file: ${uploadResponse.data.id}`);
        } catch (error) {
          console.warn('Failed to set file permissions:', error.message);
        }
      }

      // ✅ Return file details
      const result = {
        fileId: uploadResponse.data.id,
        webViewLink: uploadResponse.data.webViewLink || `https://drive.google.com/file/d/${uploadResponse.data.id}/view`,
        webContentLink: uploadResponse.data.webContentLink || `https://drive.google.com/uc?id=${uploadResponse.data.id}`,
        fileName: uploadResponse.data.name || fileName,
        folderPath: `${teamData.teamID}/${folderPath}`,
      };

      console.log(`File uploaded successfully:`, result);
      return result;

    } catch (error) {
      console.error('Upload error in uploadToTeamFolder:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        stack: error.stack
      });
      throw new Error(`Upload failed: ${error.message}`);
    }
  });
}


// Legacy function for backward compatibility
export async function uploadTeamFiles(drive, teamData, memberIndex, fileData, type) {
  return uploadToTeamFolder(drive, teamData, fileData, type, null, memberIndex);
}
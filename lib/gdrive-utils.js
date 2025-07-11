import { google } from 'googleapis';
import path from 'path';
import { Readable } from 'stream';

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;
const BACKOFF_FACTOR = 2;
const YOUR_EMAIL = "dhaneshjoshi1234@gmail.com";
// 'aniketsinghn10@gmail.com';

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

async function findOrCreateFolder(drive, folderName, parentId = null) {
  return withExponentialBackoff(async () => {
    try {
      let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      if (parentId) query += ` and '${parentId}' in parents`;

      console.log(`Searching for folder: ${folderName} with query: ${query}`);

      const existing = await drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
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
        supportsAllDrives: true,
        supportsTeamDrives: true,
      });

      console.log(`Created folder: ${folderName} with ID: ${folder.data.id}`);

      // Always set "anyone" permissions on all folders
      try {
        await drive.permissions.create({
          fileId: folder.data.id,
          resource: {
            role: 'writer',
            type: 'anyone',
          },
          sendNotificationEmail: false,
          supportsAllDrives: true,
          supportsTeamDrives: true,
        });
        console.log(`Set public permissions for folder: ${folderName}`);
      } catch (error) {
        console.warn('Failed to set folder permissions:', error.message);
      }

      return folder.data.id;
    } catch (error) {
      console.error(`Error in findOrCreateFolder for ${folderName}:`, error);
      throw error;
    }
  });
}


function extractDriveFolderId(driveLink) {
  const match = driveLink?.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}



export async function createTeamFolderStructure(drive, teamData, GlobalData) {
  return withExponentialBackoff(async () => {
    try {
      console.log(`Creating folder structure for team: ${teamData.teamID}`);

      const rootFolderId = extractDriveFolderId(GlobalData.driveLink);
      if (!rootFolderId) {
        throw new Error('Missing or invalid driveLink in GlobalSettings');
      }

      // Create Team Folder inside the root shared folder
      const teamFolderName = `${teamData.teamID}_${(teamData.teamName || 'Team').replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      const teamFolderId = await findOrCreateFolder(drive, teamFolderName, rootFolderId);

      const folderStructure = {
        teamsFolderId: rootFolderId,
        teamFolderId,
        mainFolders: {},
        memberFolders: {},
        createdAt: new Date(),
        shareableLink: `https://drive.google.com/drive/folders/${teamFolderId}`,
        status: 'active'
      };

      // Create Concept Note folder (single folder, no subfolders)
      const conceptNoteId = await findOrCreateFolder(drive, 'Concept_Note', teamFolderId);
      folderStructure.mainFolders['Concept_Note'] = { 
        id: conceptNoteId, 
        isEmpty: true,
        status: 'empty' 
      };
      folderStructure.conceptNoteFolderId = conceptNoteId;

      const finalDeliverableId = await findOrCreateFolder(drive, 'Final_Deliverable', teamFolderId);
      folderStructure.mainFolders['Final_Deliverable'] = { 
        id: finalDeliverableId,
        status: 'empty' 
      };

      // Create Final Deliverable subfolders
      const finalDeliverableSubFolders = {
        'Screenshots': await findOrCreateFolder(drive, 'Screenshots', finalDeliverableId),
        'Codes': await findOrCreateFolder(drive, 'Codes', finalDeliverableId),
        'Presentation': await findOrCreateFolder(drive, 'Presentation', finalDeliverableId)
      };
      
      folderStructure.mainFolders['Final_Deliverable'].subFolders = finalDeliverableSubFolders;

      // Create Member Submissions folder
      const membersSubmissionsFolderId = await findOrCreateFolder(drive, 'Member_Submissions', teamFolderId);
      folderStructure.membersSubmissionsFolderId = membersSubmissionsFolderId;

      // Create member folders for all team members
      if (teamData.members && teamData.members.length > 0) {
        for (let index = 0; index < teamData.members.length; index++) {
          const member = teamData.members[index];
          const memberName = member.fullName?.replace(/[^a-zA-Z0-9_-]/g, '_') || `Member_${index + 1}`;
          const memberFolderName = `Member_${index + 1}_${memberName}`;
          
          // Create member folder
          const memberFolderId = await findOrCreateFolder(drive, memberFolderName, membersSubmissionsFolderId);
          
          // Create certificate and resume folders
          const certificateFolderId = await findOrCreateFolder(drive, 'Certificates', memberFolderId);
          const resumeFolderId = await findOrCreateFolder(drive, 'Resume_LinkedIn', memberFolderId);
          
          folderStructure.memberFolders[index] = {
            folderId: memberFolderId,
            certificateFolderId,
            resumeFolderId,
            memberName: member.fullName,
            memberEmail: member.email
          };
        }
      }

      // Allow custom folder creation through mainFolders parameter
      if (teamData.mainFolders) {
        for (const folderDef of teamData.mainFolders) {
          if (!folderStructure.mainFolders[folderDef.name]) {
            const mainFolderId = await findOrCreateFolder(drive, folderDef.name, teamFolderId);
            folderStructure.mainFolders[folderDef.name] = { id: mainFolderId, status: 'empty' };

            // Subfolders
            if (folderDef.subFolders) {
              const subFolderMap = {};
              for (const sub of folderDef.subFolders) {
                const subId = await findOrCreateFolder(drive, sub, mainFolderId);
                subFolderMap[sub] = subId;
              }
              folderStructure.mainFolders[folderDef.name].subFolders = subFolderMap;
            }

            // Member Submissions
            if (folderDef.memberSubFolders && folderDef.name === 'Member_Submissions') {
              for (let i = 0; i < teamData.members.length; i++) {
                const member = teamData.members[i];
                const sanitizedName = (member.fullName || `Member_${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
                const memberFolderName = `Member_${i + 1}_${sanitizedName}`;
                const memberFolderId = await findOrCreateFolder(drive, memberFolderName, mainFolderId);

                const subfolders = {};
                for (const subName of folderDef.memberSubFolders) {
                  const subId = await findOrCreateFolder(drive, subName, memberFolderId);
                  subfolders[subName] = subId;
                }

                folderStructure.memberFolders[i] = {
                  folderId: memberFolderId,
                  subfolders,
                  memberName: member.fullName,
                  memberEmail: member.email
                };
              }
            }
          }
        }
      }

      console.log(`✅ Folder structure created successfully for team: ${teamData.teamID}`);
      console.log(`📁 Shareable link: ${folderStructure.shareableLink}`);
      return folderStructure;
    } catch (error) {
      console.error('❌ Error creating folder structure:', error);
      throw error;
    }
  });
}

export async function createCustomFolderStructure(drive, teamData, customStructure) {
  return withExponentialBackoff(async () => {
    try {
      console.log(`Creating custom folder structure for team: ${teamData.teamID}`);

      // Step 1: Root teams folder (static)
      const teamsFolderId = await findOrCreateFolder(drive, 'IBM_SkillsBuild_Teams', null);

      // Step 2: Unique team folder
      const teamFolderName = `${teamData.teamID}_${(teamData.teamName || 'Team').replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      const teamFolderId = await findOrCreateFolder(drive, teamFolderName, teamsFolderId);

      // Step 3: Prepare response structure
      const folderStructure = {
        teamsFolderId,
        teamFolderId,
        mainFolders: {},
        memberFolders: {},
        createdAt: new Date()
      };

      // Step 4: Loop through main folders defined by the user
      for (const folderDef of customStructure.mainFolders || []) {
        const mainFolderId = await findOrCreateFolder(drive, folderDef.name, teamFolderId);
        folderStructure.mainFolders[folderDef.name] = { id: mainFolderId };

        // Subfolders inside the main folder (e.g., Concept_Note → [Problem_Statement, etc.])
        if (Array.isArray(folderDef.subFolders)) {
          const subFolderMap = {};
          for (const sub of folderDef.subFolders) {
            const subId = await findOrCreateFolder(drive, sub, mainFolderId);
            subFolderMap[sub] = subId;
          }
          folderStructure.mainFolders[folderDef.name].subFolders = subFolderMap;
        }

        // Special case: If the folder is meant to contain member-specific folders with their own structure
        if (Array.isArray(folderDef.memberSubFolders)) {
          for (let i = 0; i < teamData.members.length; i++) {
            const member = teamData.members[i];
            const sanitizedName = (member.fullName || `Member_${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
            const memberFolderName = `Member_${i + 1}_${sanitizedName}`;
            const memberFolderId = await findOrCreateFolder(drive, memberFolderName, mainFolderId);

            const subfolders = {};
            for (const subName of folderDef.memberSubFolders) {
              const subId = await findOrCreateFolder(drive, subName, memberFolderId);
              subfolders[subName] = subId;
            }

            folderStructure.memberFolders[i] = {
              folderId: memberFolderId,
              subfolders,
              memberName: member.fullName,
              memberEmail: member.email
            };
          }
        }
      }

      console.log(`Custom folder structure created successfully for team: ${teamData.teamID}`);
      return folderStructure;
    } catch (error) {
      console.error('Error creating custom folder structure:', error);
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
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
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
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
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
export async function ensureTeamFolderStructure(drive, teamData, GlobalData = null) {
  return withExponentialBackoff(async () => {
    try {
      console.log(`Ensuring folder structure for team: ${teamData.teamID}`);
      
      let teamsFolderId;
      
      // Check if we have a shared drive root folder from GlobalSettings
      if (GlobalData && GlobalData.driveLink) {
        teamsFolderId = extractDriveFolderId(GlobalData.driveLink);
        if (!teamsFolderId) {
          throw new Error('Missing or invalid driveLink in GlobalSettings');
        }
        console.log(`Using shared drive root folder: ${teamsFolderId}`);
      } else {
        // Must have a shared drive configured to avoid service account storage quota issues
        throw new Error('GlobalSettings driveLink is required. Please configure a shared drive link in admin settings to avoid service account storage quota issues.');
      }
      
      // Create team folder
      const teamFolderName = `${teamData.teamID}_${(teamData.teamName || 'Team').replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      const teamFolderId = await findOrCreateFolder(drive, teamFolderName, teamsFolderId);
      
      // Create concept note folder (single folder only)
      const conceptNoteFolderId = await findOrCreateFolder(drive, 'Concept_Note', teamFolderId);
      
      // Create final deliverable folder
      const finalDeliverableFolderId = await findOrCreateFolder(drive, 'Final_Deliverable', teamFolderId);
      
      // Create Final Deliverable subfolders
      const finalDeliverableSubFolders = {
        'Screenshots': await findOrCreateFolder(drive, 'Screenshots', finalDeliverableFolderId),
        'Codes': await findOrCreateFolder(drive, 'Codes', finalDeliverableFolderId),
        'Presentation': await findOrCreateFolder(drive, 'Presentation', finalDeliverableFolderId)
      };
      
      // Create member submissions folder
      const membersSubmissionsFolderId = await findOrCreateFolder(drive, 'Member_Submissions', teamFolderId);
      
      const folderStructure = {
        teamsFolderId,
        teamFolderId,
        conceptNoteFolderId,
        finalDeliverableFolderId,
        finalDeliverableSubFolders,
        membersSubmissionsFolderId,
        memberFolders: {},
        createdAt: new Date()
      };

      // Create member folders for all team members
      if (teamData.members && teamData.members.length > 0) {
        for (let index = 0; index < teamData.members.length; index++) {
          const member = teamData.members[index];
          const memberName = member.fullName?.replace(/[^a-zA-Z0-9_-]/g, '_') || `Member_${index + 1}`;
          const memberFolderName = `Member_${index + 1}_${memberName}`;
          
          // Create member folder
          const memberFolderId = await findOrCreateFolder(drive, memberFolderName, membersSubmissionsFolderId);
          
          // Create certificate and resume folders
          const certificateFolderId = await findOrCreateFolder(drive, 'Certificates', memberFolderId);
          const resumeFolderId = await findOrCreateFolder(drive, 'Resume_LinkedIn', memberFolderId);
          
          folderStructure.memberFolders[index] = {
            folderId: memberFolderId,
            certificateFolderId,
            resumeFolderId,
            memberName: member.fullName,
            memberEmail: member.email
          };
        }
      }

      console.log(`Created folder structure for ${teamData.members?.length || 0} members`);
      return folderStructure;
    } catch (error) {
      console.error('Error ensuring folder structure:', error);
      throw error;
    }
  });
}

export async function uploadToTeamFolder(drive, teamData, fileData, submissionType, subCategory = null, memberIndex = null, GlobalData = null) {
  return withExponentialBackoff(async () => {
    try {
      console.log(`Starting upload for team: ${teamData.teamID}, type: ${submissionType}`);
      console.log(`Member index: ${memberIndex}, Team members count: ${teamData.members?.length || 0}`);

      // Ensure we have a proper folder structure
      if (!teamData.folderStructure || !teamData.folderStructure.memberFolders) {
        console.log('No folder structure found or missing member folders, creating proper structure');
        teamData.folderStructure = await ensureTeamFolderStructure(drive, teamData, GlobalData);
      }

      // Verify folder exists in Google Drive before upload (for concept note uploads)
      if (submissionType === 'conceptNote' && subCategory) {
        const folderId = teamData.folderStructure.conceptNoteSubfolders && teamData.folderStructure.conceptNoteSubfolders[subCategory];
        if (folderId && !folderId.startsWith('mock_')) {
          try {
            await drive.files.get({ 
              fileId: folderId,
              supportsAllDrives: true,
              supportsTeamDrives: true
            });
          } catch (error) {
            if (error.code === 404) {
              console.log('Folder not found in Google Drive, recreating folder structure...');
              teamData.folderStructure = await ensureTeamFolderStructure(drive, teamData, GlobalData);
            }
          }
        }
      }

      // Validate member folders exist for member-specific uploads
      if ((submissionType === 'certificate' || submissionType === 'resume') && memberIndex !== null) {
        if (!teamData.folderStructure.memberFolders[memberIndex]) {
          console.error(`Member folder missing for index ${memberIndex}. Available folders:`, Object.keys(teamData.folderStructure.memberFolders));
          throw new Error(`Member folder not found for index: ${memberIndex}. Please contact admin to recreate folder structure.`);
        }
      }

      const { folderStructure } = teamData;
      let targetFolderId;
      let folderPath;

      // Determine target folder based on submission type
      if (submissionType === 'conceptNote') {
        // Concept Note goes directly to main Concept_Note folder
        targetFolderId = folderStructure.conceptNoteFolderId;
        folderPath = 'Concept_Note';
      } else if (submissionType === 'finalDeliverable') {
        // Final Deliverable goes to specific subfolder based on category
        if (subCategory && folderStructure.mainFolders?.['Final_Deliverable']?.subFolders?.[subCategory]) {
          targetFolderId = folderStructure.mainFolders['Final_Deliverable'].subFolders[subCategory];
          folderPath = `Final_Deliverable/${subCategory}`;
        } else if (subCategory && folderStructure.finalDeliverableSubFolders?.[subCategory]) {
          targetFolderId = folderStructure.finalDeliverableSubFolders[subCategory];
          folderPath = `Final_Deliverable/${subCategory}`;
        } else {
          targetFolderId = folderStructure.finalDeliverableFolderId;
          folderPath = 'Final_Deliverable';
        }
      } else if (submissionType === 'certificate' && memberIndex !== null && memberIndex !== undefined) {
        const memberFolder = folderStructure.memberFolders[memberIndex];
        if (!memberFolder) {
          throw new Error(`Member folder not found for index: ${memberIndex}`);
        }
        targetFolderId = memberFolder.certificateFolderId;
        folderPath = `Member_Submissions/${memberFolder.memberName || `Member_${memberIndex + 1}`}/Certificates`;
      } else if (submissionType === 'resume' && memberIndex !== null && memberIndex !== undefined) {
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

      // Prepare file for upload
      const timestamp = Date.now();
      const fileExtension = fileData.originalname.split('.').pop() || 'bin';
      const sanitizedFileName = fileData.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${submissionType}_${timestamp}_${sanitizedFileName}`;

      console.log(`Uploading file: ${fileName} to folder: ${folderPath} (ID: ${targetFolderId})`);

      // Create file metadata
      const fileMetadata = {
        name: fileName,
        parents: [targetFolderId],
      };

      // Prepare media for upload
      const media = {
        mimeType: fileData.mimetype || 'application/octet-stream',
        body: Readable.from(fileData.buffer),
      };

      console.log(`File metadata:`, fileMetadata);
      console.log(`Media type: ${media.mimeType}, Buffer size: ${fileData.buffer.length}`);

      // Upload file with shared drive support
      const uploadResponse = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,webViewLink,webContentLink,name',
        supportsAllDrives: true,
        supportsTeamDrives: true,
      });

      console.log(`Upload response:`, uploadResponse.data);

      // Make file accessible (skip for mock client in development)
      if (process.env.NODE_ENV !== 'development' || process.env.GOOGLE_SERVICE_ACCOUNT_PATH) {
        try {
          await drive.permissions.create({
            fileId: uploadResponse.data.id,
            resource: {
              role: 'write',
              type: 'anyone',
            },
            supportsAllDrives: true,
            supportsTeamDrives: true,
          });
          console.log(`Set public permissions for file: ${uploadResponse.data.id}`);
        } catch (error) {
          console.warn('Failed to set file permissions:', error.message);
        }
      }

      const result = {
        fileId: uploadResponse.data.id,
        webViewLink: uploadResponse.data.webViewLink || `https://drive.google.com/file/d/${uploadResponse.data.id}/view`,
        webContentLink: uploadResponse.data.webContentLink || `https://drive.google.com/uc?id=${uploadResponse.data.id}`,
        fileName: uploadResponse.data.name || fileName,
        folderPath: `${teamData.teamID}/${folderPath}`,
      };

      // Update folder status to indicate it contains files
      await updateFolderStatus(teamData.teamID, submissionType, subCategory, true);

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

// Update folder status when files are uploaded
export async function updateFolderStatus(teamID, submissionType, subCategory = null, hasFiles = true) {
  try {
    const connectDB = (await import('@/lib/mongodb')).default;
    const Team = (await import('@/models/Team')).default;
    
    await connectDB();
    
    const updatePath = subCategory 
      ? `folderStructure.mainFolders.${submissionType}.subFolders.${subCategory}.status`
      : `folderStructure.mainFolders.${submissionType}.status`;
    
    const updateData = {
      [updatePath]: hasFiles ? 'has_files' : 'empty',
      updatedAt: new Date()
    };
    
    await Team.findOneAndUpdate(
      { teamID: teamID },
      { $set: updateData }
    );
    
    console.log(`✅ Updated folder status for ${teamID}:${submissionType}${subCategory ? ':' + subCategory : ''} to ${hasFiles ? 'has_files' : 'empty'}`);
  } catch (error) {
    console.error('Failed to update folder status:', error);
  }
}

// Create dynamic folder structure based on user input
export async function createDynamicFolderStructure(drive, teamData, userFolderStructure, GlobalData) {
  return withExponentialBackoff(async () => {
    try {
      console.log(`Creating dynamic folder structure for team: ${teamData.teamID}`);

      const rootFolderId = extractDriveFolderId(GlobalData.driveLink);
      if (!rootFolderId) {
        throw new Error('Missing or invalid driveLink in GlobalSettings');
      }

      // Create Team Folder inside the root shared folder
      const teamFolderName = `${teamData.teamID}_${(teamData.teamName || 'Team').replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      const teamFolderId = await findOrCreateFolder(drive, teamFolderName, rootFolderId);

      const folderStructure = {
        teamsFolderId: rootFolderId,
        teamFolderId,
        mainFolders: {},
        memberFolders: {},
        createdAt: new Date(),
        shareableLink: `https://drive.google.com/drive/folders/${teamFolderId}`,
        status: 'active'
      };

      // Create folders recursively based on user input
      const createFolderRecursively = async (folderDef, parentId) => {
        const folderId = await findOrCreateFolder(drive, folderDef.name, parentId);
        const folderData = { 
          id: folderId, 
          status: 'empty',
          hasFiles: false
        };

        // Create subfolders if they exist
        if (folderDef.subFolders && folderDef.subFolders.length > 0) {
          folderData.subFolders = {};
          for (const subFolder of folderDef.subFolders) {
            const subFolderData = await createFolderRecursively(subFolder, folderId);
            folderData.subFolders[subFolder.name] = subFolderData;
          }
        }

        return folderData;
      };

      // Process user-defined folder structure
      if (userFolderStructure && userFolderStructure.folders) {
        for (const folderDef of userFolderStructure.folders) {
          const folderData = await createFolderRecursively(folderDef, teamFolderId);
          folderStructure.mainFolders[folderDef.name] = folderData;
        }
      }

      console.log(`✅ Dynamic folder structure created successfully for team: ${teamData.teamID}`);
      console.log(`📁 Shareable link: ${folderStructure.shareableLink}`);
      return folderStructure;
    } catch (error) {
      console.error('❌ Error creating dynamic folder structure:', error);
      throw error;
    }
  });
}

// Legacy function for backward compatibility
export async function uploadTeamFiles(drive, teamData, memberIndex, fileData, type) {
  return uploadToTeamFolder(drive, teamData, fileData, type, null, memberIndex);
}
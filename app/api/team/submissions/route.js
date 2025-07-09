import { NextResponse } from 'next/server';
import { getDriveClient, uploadToTeamFolder, ensureTeamFolderStructure } from '@/lib/gdrive-utils';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import { createResponse } from '@/lib/utils';
import { requireTeam } from '@/middleware/auth';

async function handler(request) {
  try {
    console.log('Starting submission upload process...');
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file');
    const teamId = formData.get('teamId');
    const memberIndex = formData.get('memberIndex');
    const submissionType = formData.get('submissionType');
    const subCategory = formData.get('subCategory');
    const linkedinLink = formData.get('linkedinLink');

    console.log('Received form data:', {
      teamId,
      memberIndex,
      submissionType,
      subCategory,
      fileName: file?.name,
      fileSize: file?.size,
      hasLinkedinLink: !!linkedinLink
    });

    // Validate required fields
    if (!teamId || !submissionType || !file) {
      console.error('Missing required fields:', { teamId: !!teamId, submissionType: !!submissionType, file: !!file });
      return NextResponse.json(createResponse(false, 'Missing required fields'), { status: 400 });
    }

    // Find team
    const team = await Team.findOne({ teamID: teamId });
    if (!team) {
      console.error('Team not found:', teamId);
      return NextResponse.json(createResponse(false, 'Team not found'), { status: 404 });
    }

    console.log('Found team:', { teamID: team.teamID, folderStructureEnabled: team.folderStructureEnabled });

    // Check if team has folder structure enabled
    if (!team.folderStructureEnabled) {
      console.error('Team folder structure not enabled for team:', teamId);
      return NextResponse.json(createResponse(false, 'Team folder structure not enabled. Please contact admin.'), { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error('File too large:', { size: file.size, maxSize });
      return NextResponse.json(createResponse(false, 'File size must be less than 10MB'), { status: 400 });
    }

    // Validate file type
    const allowedTypes = {
      certificate: ['.pdf', '.jpg', '.jpeg', '.png'],
      resume: ['.pdf', '.doc', '.docx'],
      conceptNote: ['.pdf', '.doc', '.docx', '.ppt', '.pptx'],
      finalDeliverable: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip', '.rar']
    };

    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    
    if (!allowedTypes[submissionType]?.includes(fileExtension)) {
      console.error('Invalid file type:', { submissionType, fileExtension, allowed: allowedTypes[submissionType] });
      return NextResponse.json(createResponse(false, `Invalid file type for ${submissionType}. Allowed: ${allowedTypes[submissionType]?.join(', ')}`), { status: 400 });
    }

    // Validate member index for member-specific submissions
    if ((submissionType === 'certificate' || submissionType === 'resume') && (memberIndex === null || memberIndex === undefined)) {
      console.error('Member index required for member-specific submission:', submissionType);
      return NextResponse.json(createResponse(false, 'Member index is required for this submission type'), { status: 400 });
    }

    // Validate member index range
    if (memberIndex !== null && memberIndex !== undefined) {
      const memberIdx = parseInt(memberIndex);
      if (isNaN(memberIdx) || memberIdx < 0 || memberIdx >= team.members.length) {
        console.error('Invalid member index:', { memberIndex, teamMembersLength: team.members.length });
        return NextResponse.json(createResponse(false, 'Invalid member index'), { status: 400 });
      }
    }

    // Prepare file data
    const buffer = await file.arrayBuffer();
    const fileData = {
      originalname: file.name,
      mimetype: file.type,
      size: file.size,
      buffer: Buffer.from(buffer),
    };

    console.log('Prepared file data:', {
      originalname: fileData.originalname,
      mimetype: fileData.mimetype,
      size: fileData.size,
      bufferLength: fileData.buffer.length
    });

    // Ensure team has proper folder structure
    if (!team.folderStructure || !team.folderStructure.memberFolders) {
      console.log('Team missing proper folder structure, creating it...');
      const drive = await getDriveClient();
      const folderStructure = await ensureTeamFolderStructure(drive, team);
      
      // Update team with new folder structure
      await Team.findOneAndUpdate(
        { teamID: teamId },
        { 
          $set: { 
            folderStructure: folderStructure,
            updatedAt: new Date()
          }
        }
      );
      
      // Update local team object
      team.folderStructure = folderStructure;
    }

    // Get Google Drive client and upload file
    console.log('Getting Google Drive client...');
    const drive = await getDriveClient();
    
    console.log('Starting file upload to Google Drive...');
    const uploadResult = await uploadToTeamFolder(
      drive, 
      team, 
      fileData, 
      submissionType, 
      subCategory, 
      memberIndex ? parseInt(memberIndex) : null
    );

    console.log('Upload successful:', uploadResult);

    // Update team document based on submission type
    let updateData = { updatedAt: new Date() };
    
    if (submissionType === 'conceptNote') {
      updateData.submitConceptNote = true;
      updateData.conceptNoteSubmission = {
        fileId: uploadResult.fileId,
        webViewLink: uploadResult.webViewLink,
        fileName: uploadResult.fileName,
        submittedAt: new Date(),
        subCategory: subCategory || 'General'
      };
      console.log('Updating team with concept note submission data');
    } else if (submissionType === 'finalDeliverable') {
      updateData.submitFinalDeliverable = true;
      updateData.finalDeliverableSubmission = {
        fileId: uploadResult.fileId,
        webViewLink: uploadResult.webViewLink,
        fileName: uploadResult.fileName,
        submittedAt: new Date()
      };
      console.log('Updating team with final deliverable submission data');
    } else if (memberIndex !== null && memberIndex !== undefined) {
      const memberIdx = parseInt(memberIndex);
      if (submissionType === 'certificate') {
        updateData[`members.${memberIdx}.certificateFile`] = uploadResult.fileId;
        updateData[`members.${memberIdx}.certificateLink`] = uploadResult.webViewLink;
        console.log(`Updating member ${memberIdx} with certificate data`);
      } else if (submissionType === 'resume') {
        updateData[`members.${memberIdx}.resumeFile`] = uploadResult.fileId;
        updateData[`members.${memberIdx}.resumeLink`] = uploadResult.webViewLink;
        // Also update LinkedIn link if provided
        if (linkedinLink && linkedinLink.trim()) {
          updateData[`members.${memberIdx}.linkedinLink`] = linkedinLink.trim();
        }
        console.log(`Updating member ${memberIdx} with resume data and LinkedIn link`);
      }
    }

    console.log('Updating team document with:', updateData);

    const updatedTeam = await Team.findOneAndUpdate(
      { teamID: teamId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedTeam) {
      console.error('Failed to update team document');
      return NextResponse.json(createResponse(false, 'Failed to update team data'), { status: 500 });
    }

    console.log('Team document updated successfully');

    return NextResponse.json(createResponse(true, 'File uploaded successfully', {
      fileId: uploadResult.fileId,
      webViewLink: uploadResult.webViewLink,
      fileName: uploadResult.fileName,
      folderPath: uploadResult.folderPath,
      submissionType,
      teamId
    }));

  } catch (error) {
    console.error('Submission upload error:', error);
    console.error('Error stack:', error.stack);
    
    // Return more specific error messages
    let errorMessage = 'Internal server error';
    if (error.message.includes('Upload failed')) {
      errorMessage = error.message;
    } else if (error.message.includes('folder not found')) {
      errorMessage = 'Team folder structure not properly set up. Please contact admin.';
    } else if (error.message.includes('Invalid submission type')) {
      errorMessage = error.message;
    } else if (error.message.includes('Member folder not found')) {
      errorMessage = 'Member folder structure missing. Please contact admin to recreate folder structure.';
    }
    
    return NextResponse.json(createResponse(false, errorMessage), { status: 500 });
  }
}

export const POST = requireTeam(handler);
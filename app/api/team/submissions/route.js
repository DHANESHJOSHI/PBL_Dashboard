import { NextResponse } from 'next/server';
import { getDriveClient, uploadToTeamFolder, ensureTeamFolderStructure } from '@/lib/gdrive-utils';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import GlobalSettings from '@/models/GlobalSettings';
import { createResponse } from '@/lib/utils';
import { requireTeam } from '@/middleware/auth';
import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse-debugging-disabled';

async function handler(request) {
  try {
    console.log('Starting submission upload process...');
    await connectDB();

    const formData = await request.formData();
    const submissionMethod = formData.get('submissionMethod') || 'file';
    const file = formData.get('file');
    const driveLink = formData.get('driveLink');
    const teamId = formData.get('teamId');
    const memberIndex = formData.get('memberIndex');
    const submissionType = formData.get('submissionType');
    const subCategory = formData.get('subCategory');
    const linkedinLink = formData.get('linkedinLink');

    console.log('Received form data:', {
      teamId,
      submissionMethod,
      memberIndex,
      submissionType,
      subCategory,
      fileName: file?.name,
      fileSize: file?.size,
      driveLink,
      hasLinkedinLink: !!linkedinLink
    });

    // Validate required fields
    if (!teamId || !submissionType) {
      console.error('Missing required fields:', { teamId: !!teamId, submissionType: !!submissionType });
      return NextResponse.json(createResponse(false, 'Missing required fields'), { status: 400 });
    }

    if (submissionMethod === 'file' && !file) {
      return NextResponse.json(createResponse(false, 'Missing file upload'), { status: 400 });
    }

    if (submissionMethod === 'link' && !driveLink) {
      return NextResponse.json(createResponse(false, 'Missing Google Drive link'), { status: 400 });
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

    let fileData = null;

    if (submissionMethod === 'file') {
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
      
      // Prepare file data
      const buffer = await file.arrayBuffer();
      fileData = {
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
      
      if (submissionType === 'certificate') {
        try {
          console.log('Starting OCR validation for certificate...');
          const memberData = team.members[parseInt(memberIndex)];
          const memberName = memberData.fullName.toLowerCase();
          
          let extractedText = "";

          // Wrap OCR in a timeout to prevent hanging the server
          const ocrPromise = (async () => {
            if (fileExtension === '.pdf') {
              const pdfData = await pdfParse(fileData.buffer);
              return pdfData.text.toLowerCase();
            } else {
              const path = require('path');
              const worker = await Tesseract.createWorker('eng', 1, {
                workerPath: path.join(process.cwd(), 'node_modules/tesseract.js/src/worker-script/node/index.js'),
                corePath: path.join(process.cwd(), 'node_modules/tesseract.js-core'),
                cachePath: path.join(process.cwd(), 'tessdata')
              });
              const { data: { text } } = await worker.recognize(fileData.buffer);
              await worker.terminate();
              return text.toLowerCase();
            }
          })();

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('OCR Timeout')), 15000)
          );

          extractedText = await Promise.race([ocrPromise, timeoutPromise]);

          console.log('Extracted text preview:', extractedText.substring(0, 100));

          const nameParts = memberName.split(' ').filter(w => w.trim().length > 2);
          const nameMatch = nameParts.length > 0 ? nameParts.some(part => extractedText.includes(part)) : extractedText.includes(memberName.trim());
          
          const internshipName = team.internshipName ? team.internshipName.toLowerCase() : "";
          const courseName = team.courseName ? team.courseName.toLowerCase() : "";
          // Filter out generic words to ensure we match the specific track name
          const genericWords = ['aicte', 'ibm', 'skillsbuild', 'bharatcares', 'internship', 'program', 'project'];
          const courseKeywords = [...internshipName.split(' '), ...courseName.split(' ')]
            .filter(w => w.length > 3 && !genericWords.includes(w));
            
          // Check if at least one meaningful keyword of the internship or course is present
          const courseMatch = courseKeywords.length === 0 || courseKeywords.some(kw => extractedText.includes(kw));
          
          if (!nameMatch || !courseMatch) {
            let errorMsg = "Certificate is not valid. ";
            if (!nameMatch && !courseMatch) {
              errorMsg += "Both Name and Internship track do not match.";
            } else if (!nameMatch) {
              errorMsg += "Internship track matches successfully, but Name does not match your registered name.";
            } else {
              errorMsg += "Name matches successfully, but Internship track does not match your registered program.";
            }
            console.log('OCR Validation Failed:', errorMsg);
            return NextResponse.json(createResponse(false, errorMsg), { status: 400 });
          }
          
          fileData.certificateValidationStatus = "Valid";
          fileData.certificateValidationNotes = "Validation passed.";
          console.log('OCR Validation: Valid');
        } catch (error) {
          console.error("OCR Validation error:", error);
          const msg = error.message === 'OCR Timeout' 
            ? "Certificate validation timed out. Please try uploading a clearer image or PDF." 
            : "Certificate validation failed or document unreadable. Please ensure it is a valid certificate.";
          return NextResponse.json(createResponse(false, msg), { status: 400 });
        }
      }
    } else if (submissionMethod === 'link') {
      // Access check for drive link
      try {
        const checkResponse = await fetch(driveLink, { method: 'GET', redirect: 'manual' });
        // If it redirects to ServiceLogin or accounts.google.com, it's restricted
        const location = checkResponse.headers.get('location') || '';
        if (checkResponse.status === 401 || checkResponse.status === 403 || location.includes('ServiceLogin') || location.includes('accounts.google.com')) {
          return NextResponse.json(createResponse(false, 'Your Drive link is restricted. Please change permissions to "Anyone with the link can view" and re-submit.'), { status: 400 });
        }
      } catch (err) {
        // If fetch fails entirely, it might be an invalid URL
        return NextResponse.json(createResponse(false, 'Could not verify the Drive link. Please ensure it is valid and publicly accessible.'), { status: 400 });
      }
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

    // Ensure team has proper folder structure
    if (!team.folderStructure || !team.folderStructure.memberFolders) {
      console.log('Team missing proper folder structure, creating it...');
      const drive = await getDriveClient();
      
      // Get GlobalSettings for shared drive configuration
      const globalSettings = await GlobalSettings.findOne();
      const folderStructure = await ensureTeamFolderStructure(drive, team, globalSettings);
      
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

    let uploadResult;
    if (submissionMethod === 'file') {
      // Get Google Drive client and upload file
      console.log('Getting Google Drive client...');
      const drive = await getDriveClient();
      
      // Get GlobalSettings for shared drive configuration
      const globalSettings = await GlobalSettings.findOne();
      
      console.log('Starting file upload to Google Drive...');
      uploadResult = await uploadToTeamFolder(
        drive, 
        team, 
        fileData, 
        submissionType, 
        subCategory, 
        memberIndex ? parseInt(memberIndex) : null,
        globalSettings
      );

      console.log('Upload successful:', uploadResult);
    } else {
      // Fake upload result for links
      uploadResult = {
        fileId: 'link-submission',
        webViewLink: driveLink,
        fileName: 'Google Drive Link',
        folderPath: ''
      };
      console.log('Link submission recorded:', uploadResult);
    }

    // Update team with folder structure if it was recreated
    if (team.folderStructure) {
      await Team.findOneAndUpdate(
        { teamID: teamId },
        { 
          $set: { 
            folderStructure: team.folderStructure,
            updatedAt: new Date()
          }
        }
      );
    }

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
        if (fileData?.certificateValidationStatus) {
          updateData[`members.${memberIdx}.certificateValidationStatus`] = fileData.certificateValidationStatus;
          updateData[`members.${memberIdx}.certificateValidationNotes`] = fileData.certificateValidationNotes;
        }
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
    } else if (error.message.includes('GlobalSettings driveLink is required')) {
      errorMessage = 'Shared drive not configured. Please contact admin to set up Google Drive shared folder.';
    } else if (error.message.includes('Service Accounts do not have storage quota')) {
      errorMessage = 'Google Drive storage quota issue. Please contact admin to configure shared drive.';
    }
    
    return NextResponse.json(createResponse(false, errorMessage), { status: 500 });
  }
}

export const POST = requireTeam(handler);
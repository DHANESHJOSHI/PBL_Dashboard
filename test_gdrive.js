const { google } = require('googleapis');
const path = require('path');

async function testAuth() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.resolve('./google-credentials.json'),
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });
    
    const res = await drive.files.list({
      pageSize: 1,
      fields: 'nextPageToken, files(id, name)',
    });
    console.log("Drive API call success! Found files:", res.data.files.length);
  } catch (err) {
    console.error("Drive API call failed:", err.message);
  }
}
testAuth();

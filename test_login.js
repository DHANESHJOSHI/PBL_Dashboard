const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const mongoUri = env.match(/MONGODB_URI=(.*)/)[1].trim();
const mongoose = require('mongoose');

mongoose.connect(mongoUri).then(async () => {
  const Team = require('./models/Team').default || require('./models/Team');
  const email = 'anshikasamant20@gmail.com';
  
  const query = {
      collegeId: '394',
      'members.email': { $regex: new RegExp('^' + email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
  };
  
  console.log("Testing exact regex matching...");
  const team = await Team.findOne(query).lean();
  console.log('Found team?', !!team);
  
  if (!team) {
    console.log("\nSearching just by email...");
    const teamByEmail = await Team.findOne({ 'members.email': /anshikasamant20/i }).lean();
    console.log('Team by just email exists?', !!teamByEmail);
    if (teamByEmail) {
      console.log('Its collegeId:', typeof teamByEmail.collegeId, JSON.stringify(teamByEmail.collegeId));
      const member = teamByEmail.members.find(m => m.email.includes('anshika'));
      console.log('Its email:', typeof member.email, JSON.stringify(member.email));
      
      console.log("\nTesting why it failed:");
      console.log("Are collegeIds strictly equal?", teamByEmail.collegeId === '394');
    }
  }
  process.exit(0);
});

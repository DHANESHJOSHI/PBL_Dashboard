import mongoose from 'mongoose';
import 'dotenv/config';

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Team = mongoose.connection.collection('teams');
  const result = await Team.updateOne(
    { teamID: 'TESTSB20258791' },
    { $unset: { folderStructure: "" } }
  );
  console.log("Updated:", result);
  process.exit(0);
}
fix();

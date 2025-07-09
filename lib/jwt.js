import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function generateAdminToken(adminData) {
  return generateToken({
    type: 'admin',
    adminId: adminData.adminId,
    email: adminData.email,
    role: adminData.role
  });
}

export function generateTeamToken(teamData) {
  return generateToken({
    type: 'team',
    teamID: teamData.teamID,
    memberEmail: teamData.memberEmail,
    isLeader: teamData.isLeader,
    collegeId: teamData.collegeId
  });
}
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET; // required, set in .env — never hard-code
if (!JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set. Admin auth will not work securely.');
}

function signToken(adminUser) {
  return jwt.sign(
    { sub: adminUser.id, role: adminUser.role, email: adminUser.email },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}
async function checkPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { signToken, verifyToken, hashPassword, checkPassword };

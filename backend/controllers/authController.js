const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

function tokenFor(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '7d' });
}

async function register(req, res) {
  const { fullName, email, password, role } = req.body;
  if (!fullName || !email || !password) return res.status(400).json({ success: false, message: 'fullName, email, and password are required.' });
  try {
    const normalizedEmail = email.trim().toLowerCase();
    if (await userModel.findByEmail(normalizedEmail)) return res.status(409).json({ success: false, message: 'Email is already registered.' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userModel.createUser({ fullName: fullName.trim(), email: normalizedEmail, password: passwordHash, role: role === 'employer' ? 'employer' : 'job_seeker' });
    return res.status(201).json({ success: true, user, token: tokenFor(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to create account.' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required.' });
  try {
    const user = await userModel.findByEmail(email.trim().toLowerCase());
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    const { password: ignoredPassword, ...safeUser } = user;
    return res.json({ success: true, user: safeUser, token: tokenFor(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to sign in.' });
  }
}

module.exports = { register, login };

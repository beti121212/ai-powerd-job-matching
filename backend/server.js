const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobRoutes');
const matchRoutes = require('./routes/matchRoutes');
const jobSeekerRoutes = require('./routes/jobSeekerRoutes');
const cvRoutes = require('./routes/cvRoutes');
const seekerMatchingRoutes = require('./routes/seekerMatchingRoutes');
const profileRoutes = require('./routes/profileRoutes');
const contactRoutes = require('./routes/contactRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const howItWorksRoutes = require('./routes/howItWorksRoutes');
require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_session_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true },
  })
);
app.use(passport.initialize());
app.use(passport.session());

const uploadDir = path.join(__dirname, 'uploads', 'cvs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/contact', contactRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/how-it-works', howItWorksRoutes);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname || '.pdf');
      cb(null, `cv-${uniqueSuffix}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedExt = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mimeOk = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ].includes(file.mimetype);

    if (allowedExt.includes(ext) && mimeOk) {
      return cb(null, true);
    }

    cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed.'));
  },
});

const sanitizeUser = (user = {}) => ({
  id: user.id,
  full_name: user.full_name || user.fullName || null,
  email: user.email || null,
  phone: user.phone || null,
  role: user.role || 'job_seeker',
  is_verified: Boolean(user.is_verified),
  is_active: user.is_active !== false,
  auth_provider: user.auth_provider || 'email',
  avatar_url: user.avatar_url || user.profile_picture_url || null,
});

const resolveEffectiveRole = (role, email) => {
  const targetEmail = String(email || '').trim().toLowerCase();
  if (['tekebaaweke32@gmail.com'].includes(targetEmail)) return 'admin';
  const value = String(role || 'job_seeker').trim().toLowerCase();
  return ['super_admin', 'admin', 'employer', 'job_seeker'].includes(value) ? value : 'job_seeker';
};

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Token missing.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const requireAdmin = (req, res, next) => {
  const role = String(req.user?.role || '').trim().toLowerCase();
  const email = String(req.user?.email || '').trim().toLowerCase();
  if (role === 'admin' || role === 'super_admin' || email === 'tekebaaweke32@gmail.com') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Admin access required.' });
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'AI job matching backend is running.' });
});

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const [rows] = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    return res.json({ success: true, message: 'OTP flow is configured for this backend.' });
  } catch (error) {
    console.error('OTP setup check failed:', error);
    return res.status(500).json({ success: false, message: 'Unable to process OTP request.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
    const user = rows && rows[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    const passwordMatches = await bcrypt.compare(String(password), String(user.password || ''));
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: resolveEffectiveRole(user.role, user.email) },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ success: true, token, user: sanitizeUser(user), message: 'Login successful.' });
  } catch (error) {
    console.error('Login endpoint error:', error);
    return res.status(500).json({ success: false, message: 'Login failed.' });
  }
});

app.post('/api/cvs', authenticateUser, upload.single('cv'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'CV file is required.' });
  }

  const fileUrl = `/uploads/cvs/${req.file.filename}`;
  return res.status(201).json({ success: true, fileUrl, fileName: req.file.originalname });
});

app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api', seekerMatchingRoutes);
app.use('/api/job-seekers', jobSeekerRoutes);
app.use('/api/seeker', jobSeekerRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'AI-Powered Job Matching System Backend is running.' });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error.' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
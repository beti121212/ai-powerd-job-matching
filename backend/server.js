const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const multer = require("multer");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const db = require("./config/db");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobRoutes");
const matchRoutes = require("./routes/matchRoutes");
const jobSeekerRoutes = require("./routes/jobSeekerRoutes");
const cvRoutes = require("./routes/cvRoutes");
const seekerMatchingRoutes = require("./routes/seekerMatchingRoutes");
const profileRoutes = require("./routes/profileRoutes");
const { issueOtp } = require("./services/otpService");
const { syncGoogleUser } = require("./config/googleAuth");
const { validateSignUp, validateLogin } = require("./middleware/validateAuth");
require("./config/passport");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true
  }
}));

// Passport Middleware Initializing
app.use(passport.initialize());
app.use(passport.session());

// Uploads ፎልደር ማዘጋጀት
const uploadDir = path.join(__dirname, 'uploads/cvs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

const ensureDatabaseSchema = async () => {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS household_employers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      employer_type VARCHAR(50) NOT NULL DEFAULT 'individual',
      full_name VARCHAR(255) NOT NULL,
      role_relationship VARCHAR(150) NULL,
      work_email VARCHAR(255) NULL,
      phone_number VARCHAR(50) NOT NULL,
      household_name VARCHAR(255) NOT NULL,
      industry VARCHAR(150) DEFAULT 'Domestic & Home Services',
      household_members VARCHAR(50) DEFAULT '1-2 People',
      residence_location VARCHAR(255) NOT NULL,
      about_household TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
  } catch (error) {
    console.warn('Household employer schema compatibility check skipped:', error.message);
  }

  try {
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS user_id INT NULL UNIQUE');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS employer_type VARCHAR(50) DEFAULT \'company\'');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS representative_name VARCHAR(255) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS job_title VARCHAR(150) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS representative_title VARCHAR(150) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS work_email VARCHAR(255) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS company_size VARCHAR(50) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS tin_number VARCHAR(50) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS trade_license_document VARCHAR(255) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS industry VARCHAR(150) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS headquarters_location VARCHAR(255) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS social_media TEXT NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS about_company TEXT NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS description TEXT NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS mission TEXT NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS vision TEXT NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS services TEXT NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS culture TEXT NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS benefits TEXT NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS founded_year INT NULL');
    await db.query("ALTER TABLE employers ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'Pending'");
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await db.query('UPDATE employers SET user_id = userId WHERE user_id IS NULL');
    await db.query('ALTER TABLE employers MODIFY COLUMN userId INT NULL');
    await db.query('ALTER TABLE employers MODIFY COLUMN companyName VARCHAR(150) NULL DEFAULT NULL');
  } catch (error) {
    console.warn('Employer profile schema compatibility update skipped:', error.message);
  }

  try {
    await db.query(`ALTER TABLE users
      MODIFY COLUMN role ENUM('super_admin', 'admin', 'employer', 'job_seeker') NOT NULL DEFAULT 'job_seeker'`);
    await db.query(`ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL`);
  } catch (error) {
    console.warn('Role/password compatibility update skipped:', error.message);
  }

  try {
    await db.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_step ENUM('role_selection', 'cv_upload', 'personal_info', 'company_profile', 'company_legal') NULL DEFAULT 'role_selection'");
    await db.query("ALTER TABLE job_seeker_profiles ADD COLUMN IF NOT EXISTS onboarding_step ENUM('role_selection', 'cv_upload', 'personal_info', 'company_profile', 'company_legal') NULL DEFAULT 'role_selection'");
    await db.query("ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS onboarding_step ENUM('role_selection', 'cv_upload', 'personal_info', 'company_profile', 'company_legal') NULL DEFAULT 'role_selection'");
    await db.query('ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS representative_name VARCHAR(255) NULL');
    await db.query('ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS representative_title VARCHAR(150) NULL');
    await db.query('ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS employer_type VARCHAR(50) NOT NULL DEFAULT \'company\'');
    await db.query('ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS tin_number VARCHAR(50) NULL');
    await db.query('ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS trade_license_number VARCHAR(100) NULL');
    await db.query('ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS trade_license_url VARCHAR(255) NULL');
    await db.query('ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE');
    await db.query('ALTER TABLE company_profiles MODIFY COLUMN website VARCHAR(255) NULL DEFAULT NULL');
    await db.query('ALTER TABLE company_profiles MODIFY COLUMN logo_url VARCHAR(255) NULL DEFAULT NULL');
    await db.query('ALTER TABLE company_profiles MODIFY COLUMN description TEXT NULL DEFAULT NULL');
    await db.query('ALTER TABLE company_profiles MODIFY COLUMN company_size VARCHAR(50) NULL DEFAULT NULL');
    await db.query('ALTER TABLE company_profiles MODIFY COLUMN company_registration_number VARCHAR(100) NULL DEFAULT NULL');
    await db.query('ALTER TABLE company_profiles MODIFY COLUMN phone VARCHAR(50) NULL DEFAULT NULL');
    await db.query('ALTER TABLE company_profiles MODIFY COLUMN work_email VARCHAR(255) NULL DEFAULT NULL');
    await db.query('ALTER TABLE company_profiles MODIFY COLUMN industry VARCHAR(100) NULL DEFAULT NULL');
  } catch (error) {
    console.warn('Onboarding step compatibility update skipped:', error.message);
  }

  try {
    await db.query('ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS company_summary TEXT NULL');
    await db.query('ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS company_registration_number VARCHAR(100) NULL');
    await db.query('ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS social_media_urls JSON NULL');
    await db.query('ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS hiring_volume VARCHAR(50) NULL');
    await db.query('ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS work_email VARCHAR(255) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS representative_name VARCHAR(255) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS representative_title VARCHAR(150) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS employer_type VARCHAR(50) NOT NULL DEFAULT \'company\'');
  } catch (error) {
    console.warn('Company profile save column compatibility update skipped:', error.message);
  }

  try {
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) NULL`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(255) NULL`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255) NULL`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email'`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE`);
    await db.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_status ENUM('pending_verification', 'active') NOT NULL DEFAULT 'pending_verification'");
  } catch (error) {
    console.warn('User schema compatibility check skipped:', error.message);
  }

  try {
    await db.query('ALTER TABLE job_seeker_profiles ADD COLUMN IF NOT EXISTS cv_skipped BOOLEAN NOT NULL DEFAULT FALSE');
    await db.query('ALTER TABLE job_seeker_profiles ADD COLUMN IF NOT EXISTS onboarding_cv_uploaded BOOLEAN NOT NULL DEFAULT FALSE');
    await db.query('ALTER TABLE job_seeker_profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN NOT NULL DEFAULT FALSE');
  } catch (error) {
    console.warn('Job seeker profile compatibility columns skipped:', error.message);
  }

  try {
    await db.query(`CREATE TABLE IF NOT EXISTS otps (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(100) NOT NULL,
      otp_code VARCHAR(10) NOT NULL,
      purpose ENUM('registration', 'login', 'password-reset', 'email-verification') DEFAULT 'registration',
      is_used BOOLEAN DEFAULT FALSE,
      attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
      expires_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_email_expires (email, expires_at)
    )`);
  } catch (error) {
    console.warn('OTP table compatibility check skipped:', error.message);
  }

  try {
    await db.query('ALTER TABLE otps ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10) NULL');
    await db.query("ALTER TABLE otps MODIFY COLUMN purpose ENUM('registration', 'login', 'password-reset', 'email-verification') NOT NULL DEFAULT 'registration'");
    await db.query('ALTER TABLE otps ADD COLUMN IF NOT EXISTS is_used BOOLEAN DEFAULT FALSE');
    await db.query('ALTER TABLE otps ADD COLUMN IF NOT EXISTS attempts TINYINT UNSIGNED NOT NULL DEFAULT 0');
    await db.query('ALTER TABLE otps ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NULL DEFAULT NULL');
    await db.query('ALTER TABLE otps ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    const [otpEmailIndexes] = await db.query(`SELECT COUNT(*) AS count
      FROM information_schema.statistics
      WHERE table_schema = DATABASE() AND table_name = 'otps'
        AND index_name = 'email' AND non_unique = 0`);
    if (otpEmailIndexes[0]?.count > 0) await db.query('ALTER TABLE otps DROP INDEX email');
  } catch (error) {
    console.warn('OTP column migration skipped:', error.message);
  }

  try {
    await db.query('ALTER TABLE otps MODIFY COLUMN otp VARCHAR(10) NULL');
  } catch (error) {
    if (!/unknown column|doesn't exist/i.test(error.message)) {
      console.warn('Legacy OTP column compatibility check skipped:', error.message);
    }
  }

  try {
    await db.query(`CREATE TABLE IF NOT EXISTS employers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL UNIQUE,
      companyName VARCHAR(150) NOT NULL,
      legalBusinessName VARCHAR(150),
      tinNumber VARCHAR(50),
      licenseDocumentUrl VARCHAR(255),
      logoUrl VARCHAR(255),
      website VARCHAR(255),
      industry VARCHAR(100),
      companySize VARCHAR(50) DEFAULT '11-50',
      location VARCHAR(150),
      phoneNumber VARCHAR(20),
      phoneOperator VARCHAR(30),
      verificationStatus ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_userId (userId),
      INDEX idx_verificationStatus (verificationStatus)
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS talent_pool (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employerId INT NOT NULL,
      candidateId INT NOT NULL,
      candidateName VARCHAR(150) NOT NULL,
      primaryRole VARCHAR(150),
      skills JSON,
      aiMatchScore DECIMAL(5,2) DEFAULT 0,
      notes TEXT,
      savedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employerId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (candidateId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_saved_candidate (employerId, candidateId),
      INDEX idx_employerId (employerId)
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS employer_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL UNIQUE,
      emailAlerts BOOLEAN DEFAULT TRUE,
      matchingAlerts BOOLEAN DEFAULT TRUE,
      weeklyDigest BOOLEAN DEFAULT FALSE,
      notificationEmail VARCHAR(150),
      teamPermissions JSON,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS employer_notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employerId INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      body TEXT NOT NULL,
      isRead BOOLEAN DEFAULT FALSE,
      related_job_id INT NULL,
      related_application_id INT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employerId) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_employer_read (employerId, isRead)
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS employer_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employerId INT NOT NULL,
      candidateId INT NOT NULL,
      subject VARCHAR(200),
      body TEXT NOT NULL,
      isRead BOOLEAN DEFAULT FALSE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employerId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (candidateId) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_employer_messages (employerId, candidateId, isRead)
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS offers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      applicationId INT NOT NULL UNIQUE,
      employerId INT NOT NULL,
      candidateId INT NOT NULL,
      offeredSalary DECIMAL(12,2),
      startDate DATE,
      offerLetterUrl VARCHAR(255),
      status ENUM('draft', 'sent', 'accepted', 'declined') DEFAULT 'draft',
      sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE CASCADE,
      FOREIGN KEY (employerId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (candidateId) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_offers_employer (employerId)
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS onboarding_tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      candidateId INT NOT NULL,
      employerId INT NOT NULL,
      taskTitle VARCHAR(200) NOT NULL,
      isCompleted BOOLEAN DEFAULT FALSE,
      documentUrl VARCHAR(255),
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (candidateId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (employerId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_candidate_task (candidateId, taskTitle),
      INDEX idx_onboarding_employer (employerId, isCompleted)
    )`);
  } catch (error) {
    console.warn('Employer compatibility tables check skipped:', error.message);
  }

  try {
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS phoneNumber VARCHAR(20) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS phoneOperator VARCHAR(30) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS representative_name VARCHAR(255) NULL');
    await db.query('ALTER TABLE employers ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  } catch (error) {
    console.warn('Employer phone compatibility check skipped:', error.message);
  }

  try {
    await db.query("ALTER TABLE user_activity_log MODIFY COLUMN activity_type ENUM('login', 'profile-update', 'job-view', 'job-apply', 'profile-view', 'message-sent', 'cv-upload', 'role_selected') NOT NULL");
  } catch (error) {
    console.warn('Activity log migration skipped:', error.message);
  }

  try {
    await db.query("ALTER TABLE jobs MODIFY COLUMN status ENUM('draft', 'active', 'published', 'scheduled', 'closed', 'filled', 'archived', 'suspended') DEFAULT 'draft'");
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS approved_by INT NULL');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL DEFAULT NULL');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) NULL');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS sector VARCHAR(150) NULL');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS vacancy_level VARCHAR(100) NULL');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS scheduled_date DATETIME NULL');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type VARCHAR(50) NULL');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS work_mode VARCHAR(50) NULL');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location VARCHAR(255) NULL');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS gender_preference VARCHAR(50) NULL DEFAULT "Any"');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS compensation_currency VARCHAR(10) NULL DEFAULT "ETB"');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_min INT NULL');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_max INT NULL');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_deadline DATE NULL');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS deadline DATE NULL');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS required_skills TEXT NULL');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS description TEXT NULL');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status VARCHAR(30) NULL DEFAULT "active"');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS views_count INT NOT NULL DEFAULT 0');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  } catch (error) {
    console.warn('Job status migration skipped:', error.message);
  }
};

// ==========================================
// 🔑 AUTHENTICATION ROUTES
// ==========================================
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
} catch (err) {
  console.warn('Notice: ./routes/auth file not loaded directly or optional.');
}

// ==========================================
// 📧 NODEMAILER SETUP
// ==========================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error) => {
  if (error) {
    console.error('--> [EMAIL SETUP ERROR]:', error.message);
  } else {
    console.log('--> [EMAIL SERVER READY]: Fast SMTP connection pool active!');
  }
});

const ADMIN_EMAILS = new Set(['tekebaaweke32@gmail.com']);

const resolveEffectiveRole = (role, email) => {
  const targetEmail = String(email || '').trim().toLowerCase();
  if (ADMIN_EMAILS.has(targetEmail)) return 'admin';
  const value = String(role || 'job_seeker').trim().toLowerCase();
  const safeRoles = ['super_admin', 'admin', 'employer', 'job_seeker'];
  return safeRoles.includes(value) ? value : 'job_seeker';
};

const sanitizeUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  phone: user.phone || null,
  role: resolveEffectiveRole(user.role, user.email),
  is_verified: Boolean(user.is_verified),
  isEmailVerified: Boolean(user.is_verified),
  authStatus: user.auth_status || (user.is_verified ? 'active' : 'pending_verification'),
  is_active: user.is_active !== false,
  google_id: user.google_id || null,
  auth_provider: user.auth_provider || 'email',
  avatar_url: user.avatar_url || user.profile_picture_url || null,
  profile_picture_url: user.avatar_url || user.profile_picture_url || null,
});

const normalizeRole = (role) => {
  const value = String(role || 'job_seeker').trim().toLowerCase();
  const safeRoles = ['super_admin', 'admin', 'employer', 'job_seeker'];
  return safeRoles.includes(value) ? value : 'job_seeker';
};

// ==========================================
// ⚙️ MULTER FILE UPLOAD SETUP
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/cvs/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `cv-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed!'));
    }
  }
});

// ==========================================
// 🛡️ AUTHENTICATION MIDDLEWARE
// ==========================================
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: 'Unauthorized / እባክዎ አስቀድመው ይግቡ (Token missing)' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: 'Invalid or expired token / የቆየ ወይም የተሳሳተ Token' 
    });
  }
};

const requireAdmin = (req, res, next) => {
  const role = String(req.user?.role || '').trim().toLowerCase();
  const email = String(req.user?.email || '').trim().toLowerCase();
  if (role === 'admin' || ADMIN_EMAILS.has(email)) {
    return next();
  }

  return res.status(403).json({ success: false, message: 'Admin access required.' });
};

const adminController = require('./controllers/adminController');

app.get('/api/admin/overview', authenticateUser, requireAdmin, adminController.getAdminDashboardData);
app.get('/api/admin/dashboard-stats', authenticateUser, requireAdmin, adminController.getAdminDashboardStats);
app.patch('/api/admin/companies/:companyId/verify', authenticateUser, requireAdmin, adminController.verifyCompany);
app.patch('/api/admin/company/:id/verify', authenticateUser, requireAdmin, adminController.updateVerificationStatus);
app.get('/api/admin/companies', authenticateUser, requireAdmin, adminController.getPendingCompanies);
app.get('/api/admin/jobs', authenticateUser, requireAdmin, adminController.getAllJobsForModeration);
app.get('/api/admin/jobs/:id/preview', authenticateUser, requireAdmin, adminController.getJobPreview);
app.patch('/api/admin/users/:userId/status', authenticateUser, requireAdmin, adminController.toggleUserStatus);
app.patch('/api/admin/jobs/:jobId/status', authenticateUser, requireAdmin, adminController.toggleJobStatus);
app.patch('/api/admin/jobs/:id/moderate', authenticateUser, requireAdmin, adminController.toggleJobStatus);
app.post('/api/admin/jobs/:id/moderate', authenticateUser, requireAdmin, adminController.moderateJob);
app.patch('/api/admin/reports/:id/status', authenticateUser, requireAdmin, adminController.updateReportStatus);
app.delete('/api/admin/jobs/:id', authenticateUser, requireAdmin, adminController.deleteJob);

app.get('/api/seeker/profile-status', authenticateUser, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT cv_skipped, onboarding_step, profile_completed
       FROM job_seeker_profiles
       WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    const profile = rows[0] || {};
    const cvSkipped = Boolean(Number(profile.cv_skipped) === 1 || profile.cv_skipped === true || profile.cv_skipped === '1');
    const onboardingStep = String(profile.onboarding_step || 'cv_upload').trim();
    const profileCompleted = Boolean(profile.profile_completed || Number(profile.profile_completed) === 1);

    return res.json({
      success: true,
      cv_skipped: cvSkipped,
      onboarding_step: onboardingStep,
      profile_completed: profileCompleted,
    });
  } catch (error) {
    console.error('Seeker profile status fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch profile status.',
    });
  }
});

app.put('/api/seeker/onboarding-step', authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const payload = req.body || {};
  const onboardingStep = String(payload.onboarding_step || 'personal_info').trim();
  const cvSkipped = payload.cv_skipped === true || payload.cv_skipped === 'true' || payload.cv_skipped === 1 || payload.cv_skipped === '1';

  try {
    await db.query(
      `UPDATE job_seeker_profiles
       SET cv_skipped = ?, onboarding_step = ?
       WHERE user_id = ?`,
      [cvSkipped ? 1 : 0, onboardingStep, userId]
    );

    return res.json({
      success: true,
      cv_skipped: cvSkipped,
      onboarding_step: onboardingStep,
      message: 'Onboarding step saved.',
    });
  } catch (error) {
    console.error('Seeker onboarding-step sync error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to save onboarding progress.',
    });
  }
});

app.put('/api/seeker/profile', authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const profile = req.body || {};
  const completion = Math.max(0, Math.min(100, Number(profile.completionPercentage) || 0));

  const normalizeWorkSetup = (value) => {
    const normalized = String(value || 'hybrid').trim().toLowerCase();
    if (!normalized || normalized === 'hybrid') return 'hybrid';
    if (normalized === 'any / flexible' || normalized === 'any/flexible' || normalized === 'any flexible' || normalized === 'flexible' || normalized === 'any') return 'any';
    if (normalized === 'on-site' || normalized === 'on site' || normalized === 'onsite') return 'on-site';
    if (normalized === 'remote') return 'remote';
    return 'hybrid';
  };

  try {
    await db.query(
      `INSERT INTO job_seeker_profiles (user_id, headline, bio, location, country, city, preferred_work_mode, salary_expectation_min, profile_completion_percentage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE headline = VALUES(headline), bio = VALUES(bio), location = VALUES(location), country = VALUES(country), city = VALUES(city), preferred_work_mode = VALUES(preferred_work_mode), salary_expectation_min = VALUES(salary_expectation_min), profile_completion_percentage = VALUES(profile_completion_percentage)`,
      [
        userId,
        profile.preferredJob || null,
        profile.bio || null,
        profile.city || profile.preferredCity || null,
        profile.country || null,
        profile.city || null,
        normalizeWorkSetup(profile.preferredWorkSetup || profile.workSetup),
        Number.parseInt(String(profile.salaryExpectation || '').replace(/[^0-9]/g, ''), 10) || null,
        completion,
      ]
    );
    return res.json({ success: true, profileCompletionPercentage: completion });
  } catch (error) {
    console.error('Save Seeker Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Unable to save personal information.' });
  }
});


// ==========================================
//  CV UPLOAD API
// ==========================================
app.post(['/api/cvs', '/api/seeker/upload-cv'], authenticateUser, upload.single('cv'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a CV file.' });
  }

  try {
    await db.query('UPDATE cvs SET is_primary = FALSE WHERE user_id = ?', [req.user.id]);
    const fileUrl = `/uploads/cvs/${req.file.filename}`;
    const [result] = await db.query(
      'INSERT INTO cvs (user_id, file_name, file_url, file_size, mime_type, is_primary, is_active) VALUES (?, ?, ?, ?, ?, TRUE, TRUE)',
      [req.user.id, req.file.originalname, fileUrl, req.file.size, req.file.mimetype]
    );

    return res.status(201).json({
      success: true,
      cv: { id: result.insertId, fileName: req.file.originalname, fileUrl }
    });
  } catch (error) {
    console.error('CV Upload Error:', error);
    return res.status(500).json({ message: 'Unable to save your CV.' });
  }
});

// ==========================================
// 💡 HELPER: Smart Skill Matching Engine
// ==========================================
function calculateRealMatch(seekerSkills = '', requiredSkills = '') {
  let reqArray = Array.isArray(requiredSkills)
    ? requiredSkills
    : (requiredSkills || '').split(',').map(s => s.trim());

  return reqArray.length;
}

// ==========================================
// 📩 1. SEND OTP API
// ==========================================
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required / እባክዎ ኢሜይል ያስገቡ' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const [users] = await db.query('SELECT phone FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'Account not found.' });
    const { delivery } = await issueOtp({ dbClient: db, email: normalizedEmail, phone: users[0].phone, purpose: 'registration' });
    res.status(200).json({ success: true, delivery: { emailSent: delivery.email, smsSent: delivery.sms }, message: 'OTP sent to email successfully / OTP በኢሜይልዎ ተልኳል' });

  } catch (error) {
    console.error('Email error:', error);
    if (error.code === 'OTP_RATE_LIMITED') {
      return res.status(429).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Failed to send OTP email / ኢሜይል መላክ አልተቻለም' });
  }
});

// ==========================================
// 🔑 2. VERIFY OTP API
// ==========================================
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp, role } = req.body;
  const selectedRole = role === 'employer' || role === 'job_seeker' ? role : null;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Missing email or OTP / ኢሜይል ወይም OTP አልተገኘም' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const enteredOtp = String(otp).trim();

  try {
    const [rows] = await db.query(
      `SELECT * FROM otps
       WHERE email = ? AND is_used = 0
       ORDER BY id DESC LIMIT 1`,
      [cleanEmail]
    );

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No active verification code found. Please request a new code.'
      });
    }

    const otpRecord = rows[0];
    if (new Date() > new Date(otpRecord.expires_at)) {
      await db.query('UPDATE otps SET is_used = 1 WHERE id = ?', [otpRecord.id]);
      return res.status(400).json({
        success: false,
        error: 'This OTP code has expired. Please request a new one.'
      });
    }

    if (Number(otpRecord.attempts || 0) >= 4) {
      return res.status(429).json({
        success: false,
        error: 'Too many failed attempts. For your security, please wait 15 minutes before requesting a new code.'
      });
    }

    if (String(otpRecord.otp_code).trim() !== enteredOtp) {
      const nextAttempts = Number(otpRecord.attempts || 0) + 1;
      await db.query('UPDATE otps SET attempts = ? WHERE id = ?', [nextAttempts, otpRecord.id]);
      const remaining = 4 - nextAttempts;

      if (remaining <= 0) {
        return res.status(429).json({
          success: false,
          error: 'Too many failed attempts. Please wait 15 minutes before trying again.'
        });
      }

      return res.status(400).json({
        success: false,
        error: `Invalid OTP code. You have ${remaining} attempt(s) remaining.`
      });
    }

    await db.query('UPDATE otps SET is_used = 1 WHERE id = ?', [otpRecord.id]);
    await db.query(
      "UPDATE users SET is_verified = TRUE, auth_status = 'active'" + (selectedRole ? ', role = ?' : '') + ' WHERE email = ?',
      selectedRole ? [selectedRole, cleanEmail] : [cleanEmail]
    );
    const [verifiedUsers] = await db.query(
      'SELECT id, full_name, email, phone, role, is_verified, is_active, profile_picture_url FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );
    const verifiedUser = verifiedUsers[0];
    const token = jwt.sign({ id: verifiedUser.id, email: verifiedUser.email, role: verifiedUser.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
      token,
      user: sanitizeUser(verifiedUser),
      requiresRoleSelection: true,
      onboarding_step: 'role_selection',
      redirect_to: '/select-role',
    });
  } catch (dbErr) {
    console.error('DB Verification Error:', dbErr);
    return res.status(500).json({ success: false, message: 'Unable to verify OTP at this time.' });
  }
});

// ==========================================
// 3. USER REGISTRATION API (Unified & Safe)
// ==========================================
app.post('/api/register', validateSignUp, async (req, res) => {
  console.log('➡️ Registration Payload Received:', req.body);

  const { full_name, fullName, email, password, phone, phoneNumber, role } = req.body;
  const userFullName = (full_name || fullName || '').trim();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const userPhone = phone || phoneNumber || null;
  const selectedRole = ADMIN_EMAILS.has(normalizedEmail)
    ? 'admin'
    : (role === 'employer' || role === 'job_seeker' ? role : 'job_seeker');

  if (!userFullName) {
    return res.status(400).json({ message: 'Full Name is missing / ሙሉ ስም አልተገኘም' });
  }
  if (!normalizedEmail) {
    return res.status(400).json({ message: 'Email is missing / ኢሜይል አልተገኘም' });
  }
  if (!password) {
    return res.status(400).json({ message: 'Password is missing / የይለፍ ቃል አልተገኘም' });
  }

  try {
    const [existingUsers] = await db.query('SELECT id, is_verified FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      if (existingUser.is_verified === 1 || existingUser.is_verified === true) {
        return res.status(409).json({
          success: false,
          isAlreadyVerified: true,
          message: 'ይህ ኢሜይል አስቀድሞ ተመዝግቧል። እባክዎ በቀጥታ ይግቡ (Email is already registered. Please login).'
        });
      }

      await db.query(
        "UPDATE users SET full_name = ?, phone = ?, password = ?, role = ?, is_verified = FALSE, auth_status = 'pending_verification', is_active = TRUE WHERE id = ?",
        [userFullName, userPhone || null, hashedPassword, selectedRole, existingUser.id]
      );
      await db.query('UPDATE otps SET is_used = TRUE WHERE email = ? AND is_used = FALSE', [normalizedEmail]);

      await issueOtp({ dbClient: db, email: normalizedEmail, phone: userPhone, purpose: 'registration' });

      return res.status(201).json({
        success: true,
        requiresVerification: true,
        email: normalizedEmail,
        role: selectedRole,
        userId: existingUser.id,
        message: 'ያልተጠናቀቀ ምዝገባ ተገኝቷል። አዲስ የማረጋገጫ ኮድ ተልኳል።'
      });
    }

    const [result] = await db.query(
      "INSERT INTO users (full_name, email, phone, password, role, is_verified, auth_status, is_active) VALUES (?, ?, ?, ?, ?, FALSE, 'pending_verification', TRUE)",
      [userFullName, normalizedEmail, userPhone || null, hashedPassword, selectedRole]
    );

    if (selectedRole === 'employer') {
      await db.query(
        'INSERT INTO company_profiles (employer_id, company_name) VALUES (?, ?)',
        [result.insertId, req.body.companyName || userFullName]
      );
    } else {
      await db.query('INSERT INTO job_seeker_profiles (user_id) VALUES (?)', [result.insertId]);
    }

    await issueOtp({ dbClient: db, email: normalizedEmail, phone: userPhone, purpose: 'registration' });

    res.status(201).json({
      success: true,
      requiresVerification: true,
      email: normalizedEmail,
      role: selectedRole,
      userId: result.insertId,
      message: 'User registered successfully / ተጠቃሚው በተሳካ ሁኔታ ተመዝግቧል!'
    });
  } catch (error) {
    console.error('Register Error Detailed:', error);
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({
        message: `Database Column Error: ${error.sqlMessage}. እባክዎ በ Database users table ላይ SQL ALTER query ያካሂዱ።`
      });
    }

    res.status(500).json({ message: 'Server error / የሰርቨር ስህተት አጋጥሟል: ' + error.message });
  }
});

app.post('/api/complete-registration', authenticateUser, async (req, res) => {
  const { email, role } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedRole = normalizeRole(role);

  if (!normalizedEmail) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const [userRows] = await db.query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userRows[0];
    if (String(req.user.id) !== String(user.id) || !user.is_verified) {
      return res.status(403).json({ success: false, message: 'Email verification is required before completing registration.' });
    }
    await db.query("UPDATE users SET role = ?, is_verified = TRUE, auth_status = 'active' WHERE id = ?", [normalizedRole, user.id]);

    if (normalizedRole === 'employer') {
      await db.query(
        `INSERT INTO company_profiles (employer_id, company_name)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE company_name = VALUES(company_name)`,
        [user.id, user.full_name]
      );
    } else if (normalizedRole === 'job_seeker') {
      await db.query(
        'INSERT INTO job_seeker_profiles (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)',
        [user.id]
      );
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: normalizedRole }, JWT_SECRET, { expiresIn: '7d' });

    const updatedUser = { ...user, role: normalizedRole, is_verified: true };

    return res.status(200).json({
      success: true,
      message: 'Registration completed successfully.',
      token,
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    console.error('Complete Registration Error:', error);
    return res.status(500).json({ success: false, message: 'Unable to complete registration.' });
  }
});

// ==========================================
// 4. USER LOGIN API
// ==========================================
app.post('/api/login', validateLogin, async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: 'Please provide email and password / እባክዎ ኢሜይል እና ፓስወርድ ያስገቡ' });
  }

  try {
    const [users] = await db.query(
      'SELECT id, full_name, email, password, phone, role, is_verified, auth_status, is_active, profile_picture_url FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ይህ ኢሜይል አልተመዝገበም። እባክዎ መጀመሪያ ይመዝገቡ (Account not found. Please sign up first)'
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message: 'Please verify your email with the OTP before logging in.'
      });
    }

    const resolvedRole = resolveEffectiveRole(user.role, user.email);
    if (resolvedRole !== user.role) {
      await db.query('UPDATE users SET role = ? WHERE id = ?', [resolvedRole, user.id]);
      user.role = resolvedRole;
    }

    await issueOtp({ dbClient: db, email: normalizedEmail, phone: user.phone, purpose: 'login', expiresInMinutes: 3 });

    return res.status(200).json({
      success: true,
      requires_otp: true,
      email: normalizedEmail,
      message: 'OTP verification code sent to your email.',
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error / የሰርቨር ስህተት አጋጥሟል' });
  }
});

app.post('/api/send-login-otp', async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ success: false, message: 'Email is required / እባክዎ ኢሜይል ያስገቡ' });
  }

  try {
    const [userRows] = await db.query('SELECT id, email, phone FROM users WHERE email = ?', [normalizedEmail]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Account not found / መለያ አልተገኘም' });
    }

    const { delivery } = await issueOtp({ dbClient: db, email: normalizedEmail, phone: userRows[0].phone, purpose: 'login' });

    return res.status(200).json({ success: true, delivery: { emailSent: delivery.email, smsSent: delivery.sms }, message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Send Login OTP Error:', error);
    if (error.code === 'OTP_RATE_LIMITED') {
      return res.status(429).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Unable to send OTP.' });
  }
});

app.post('/api/verify-login-otp', async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const otpCode = String(otp || '').trim();

  if (!normalizedEmail || !otpCode) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
  }

  try {
    const [otpRows] = await db.query(
      `SELECT * FROM otps
        WHERE email = ? AND is_used = 0 AND purpose = 'login' AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [normalizedEmail]
    );

    if (!otpRows || otpRows.length === 0) {
      return res.status(400).json({ success: false, error: 'No active verification code found. Please request a new code.' });
    }

    const otpRecord = otpRows[0];
    if (new Date() > new Date(otpRecord.expires_at)) {
      await db.query('UPDATE otps SET is_used = 1 WHERE id = ?', [otpRecord.id]);
      return res.status(400).json({ success: false, error: 'This OTP code has expired. Please request a new one.' });
    }

    if (Number(otpRecord.attempts || 0) >= 4) {
      return res.status(429).json({ success: false, error: 'Too many failed attempts. For your security, please wait 15 minutes before requesting a new code.' });
    }

    if (String(otpRecord.otp_code).trim() !== otpCode) {
      const nextAttempts = Number(otpRecord.attempts || 0) + 1;
      await db.query('UPDATE otps SET attempts = ? WHERE id = ?', [nextAttempts, otpRecord.id]);
      const remaining = 4 - nextAttempts;

      if (remaining <= 0) {
        return res.status(429).json({ success: false, error: 'Too many failed attempts. Please wait 15 minutes before trying again.' });
      }

      return res.status(400).json({ success: false, error: `Invalid OTP code. You have ${remaining} attempt(s) remaining.` });
    }

    await db.query('UPDATE otps SET is_used = 1 WHERE id = ?', [otpRecord.id]);
    console.log('--> [SUCCESS] OTP marked as is_used = 1 in database for ID:', otpRecord.id);

    const [userRows] = await db.query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = userRows[0];
    await db.query("UPDATE users SET is_verified = TRUE, auth_status = 'active' WHERE id = ?", [user.id]);
    const effectiveRole = resolveEffectiveRole(user.role, user.email);
    if (effectiveRole !== user.role) {
      await db.query('UPDATE users SET role = ? WHERE id = ?', [effectiveRole, user.id]);
      user.role = effectiveRole;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: effectiveRole }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      token,
      redirect_to: '/select-role',
      onboarding_step: 'role_selection',
      requiresRoleSelection: true,
      user: sanitizeUser({ ...user, is_verified: true, role: effectiveRole }),
    });
  } catch (error) {
    console.error('Verify Login OTP Error:', error);
    return res.status(500).json({ success: false, message: 'Unable to verify login OTP / OTP ማረጋገጥ አልተቻለም' });
  }
});

app.post('/api/google-login', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Google access token is required.' });
  }

  try {
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!googleResponse.ok) {
      throw new Error('Google token invalid');
    }

    const profile = await googleResponse.json();
    const syncResult = await syncGoogleUser({ profile, authProvider: 'google' });
    const user = syncResult.user;

    const authToken = jwt.sign({ id: user.id, email: user.email, role: user.role || 'job_seeker' }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      token: authToken,
      user,
      isNewUser: syncResult.isNewUser,
      message: 'Google login successful',
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    return res.status(500).json({ success: false, message: 'Google login failed / Google መግባት አልተሳካም' });
  }
});

// ==========================================
// 5. CREATE JOB API
// ==========================================
app.post('/api/jobs', authenticateUser, async (req, res) => {
  console.log('--> [FULL PAYLOAD RECEIVED]:', JSON.stringify(req.body, null, 2));

  try {
    const employerId = req.user?.id || req.user?.userId || null;
    const data = req.body || {};

    const title = String(data.title || data.jobTitle || '').trim();
    if (!title) {
      return res.status(400).json({ success: false, error: 'Job title is required.' });
    }

    const employerRole = (req.user.role || '').toLowerCase().trim();
    if (employerRole !== 'employer') {
      return res.status(403).json({ success: false, error: 'Only employers can post jobs.' });
    }

    const normalizeNullableText = (value) => {
      if (value === null || value === undefined) return null;
      const text = String(value).trim();
      return text === '' ? null : text;
    };

    const normalizeOptionalNumber = (value) => {
      if (value === null || value === undefined || value === '') return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const normalizeOptionalDate = (value) => {
      const text = normalizeNullableText(value);
      return text && text.length >= 8 ? text : null;
    };

    let companyName = normalizeNullableText(data.companyName || data.company_name || data.company);
    if (!companyName) {
      try {
        const [empRows] = await db.query(
          'SELECT company_name, representative_name FROM employers WHERE user_id = ? LIMIT 1',
          [employerId]
        );
        companyName =
          normalizeNullableText(empRows?.[0]?.company_name) ||
          normalizeNullableText(empRows?.[0]?.representative_name) ||
          null;
      } catch (error) {
        console.warn('Could not load company_name, using fallback:', error.message);
      }
    }

    const sector = normalizeNullableText(data.sector || data.category || data.department || data.sectorName) || null;
    const vacancyLevel = normalizeNullableText(
      data.jobVacancy ||
      data.vacancyLevel ||
      data.vacancy_level ||
      data.experienceLevel ||
      data.experience_level
    ) || null;
    const jobType = normalizeNullableText(data.jobType || data.job_type || data.jobTypeName || 'Full-time') || 'Full-time';
    const workMode = normalizeNullableText(data.workMode || data.work_mode || data.workplaceType || 'Hybrid') || 'Hybrid';
    const location = normalizeNullableText(data.location || data.locationValue || data.city) || null;
    const genderPreference = normalizeNullableText(data.genderPreference || data.gender_preference || data.gender || 'Any') || 'Any';
    const compensationCurrency = normalizeNullableText(data.compensationCurrency || data.compensation_currency || data.compensation || data.currency || 'ETB') || 'ETB';

    const rawMin = data.minimumSalary ?? data.salaryMin ?? data.salary_min ?? data.salaryMinimum;
    const rawMax = data.maximumSalary ?? data.salaryMax ?? data.salary_max ?? data.salaryMaximum;
    const salaryMin = normalizeOptionalNumber(rawMin);
    const salaryMax = normalizeOptionalNumber(rawMax);

    const deadline = normalizeOptionalDate(data.deadline || data.applicationDeadline || data.application_deadline);
    const scheduledDate = normalizeOptionalDate(
      data.scheduledDate || data.scheduled_date || data.scheduledAt || data.scheduled_at
    );

    const requiredSkillsRaw = data.requiredSkills ?? data.required_skills ?? data.skills;
    const requiredSkills = Array.isArray(requiredSkillsRaw)
      ? requiredSkillsRaw.join(', ')
      : normalizeNullableText(requiredSkillsRaw);

    const description = normalizeNullableText(data.description || data.jobDescription || data.fullDescription) || null;
    const status = normalizeNullableText(data.status) || 'draft';
    const viewsCount = normalizeOptionalNumber(data.views_count ?? data.viewsCount) ?? 0;

    const insertSql = `
      INSERT INTO jobs (
        employer_id,
        company_name,
        title,
        category,
        sector,
        vacancy_level,
        job_type,
        work_mode,
        location,
        gender_preference,
        compensation_currency,
        salary_min,
        salary_max,
        application_deadline,
        deadline,
        scheduled_date,
        required_skills,
        description,
        status,
        views_count,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const params = [
      employerId,
      companyName,
      title,
      sector,
      sector,
      vacancyLevel,
      jobType,
      workMode,
      location,
      genderPreference,
      compensationCurrency,
      salaryMin,
      salaryMax,
      deadline,
      deadline,
      scheduledDate,
      requiredSkills,
      description,
      status,
      viewsCount,
    ];

    const [insertResult] = await db.query(insertSql, params);
    console.log(`--> [SUCCESSFULLY STORED TO MYSQL] Job ID: ${insertResult.insertId}`);
    console.log(`--> Stored values: Title="${title}", Sector="${sector}", Vacancy="${vacancyLevel}", Salary="${salaryMin ?? ''}-${salaryMax ?? ''} ${compensationCurrency}", Location="${location}"`);

    return res.status(201).json({
      success: true,
      jobId: insertResult.insertId,
      message: status === 'draft' ? 'Job saved as draft.' : 'Job published successfully!'
    });
  } catch (error) {
    const sqlMessage = error?.sqlMessage || error?.message || 'Unknown database error';
    console.error('--> [FATAL MYSQL ERROR ON JOB INSERT]:', sqlMessage);
    console.error(error);
    return res.status(500).json({
      success: false,
      error: `Database save failed: ${sqlMessage}`
    });
  }
});

const handleJobStatusUpdate = async (req, res) => {
  const jobId = String(req.params.id || '').trim();
  const employerId = req.user?.id || req.user?.userId || req.user?.user_id || null;
  const rawStatus = String(req.body?.status || '').trim();
  const cleanStatus = rawStatus.toLowerCase();

  console.log(`--> [JOB STATUS UPDATE] Job ID: ${jobId} | Target Status: "${rawStatus}" | Employer ID: ${employerId}`);

  if (!jobId) {
    return res.status(400).json({ success: false, error: 'Job ID is required.' });
  }

  if (!rawStatus) {
    return res.status(400).json({ success: false, error: 'Status field is required.' });
  }

  const allowedStatuses = ['active', 'paused', 'closed', 'draft', 'published', 'scheduled'];
  if (!allowedStatuses.includes(cleanStatus)) {
    return res.status(400).json({ success: false, error: `Invalid status: ${rawStatus}` });
  }

  try {
    const [result] = await db.query(
      `UPDATE jobs
       SET status = ?,
           scheduled_date = CASE
             WHEN ? = 'scheduled' THEN COALESCE(scheduled_date, NOW())
             WHEN ? IN ('published', 'active') THEN NULL
             ELSE scheduled_date
           END,
           updated_at = NOW()
       WHERE id = ? AND employer_id = ?`,
      [cleanStatus, cleanStatus, cleanStatus, jobId, employerId]
    );

    if (result.affectedRows === 0) {
      const [jobCheck] = await db.query('SELECT id, employer_id FROM jobs WHERE id = ?', [jobId]);

      if (jobCheck.length === 0) {
        return res.status(404).json({ success: false, error: 'Job listing not found.' });
      }

      await db.query(
        `UPDATE jobs
         SET status = ?,
             scheduled_date = CASE
               WHEN ? = 'scheduled' THEN COALESCE(scheduled_date, NOW())
               WHEN ? IN ('published', 'active') THEN NULL
               ELSE scheduled_date
             END,
             updated_at = NOW()
         WHERE id = ?`,
        [cleanStatus, cleanStatus, cleanStatus, jobId]
      );
    }

    console.log(`--> [SUCCESS] Job ID ${jobId} status successfully updated to "${cleanStatus}"!`);
    return res.json({
      success: true,
      message: `Job status updated to ${cleanStatus} successfully.`
    });
  } catch (error) {
    console.error('--> [FATAL ERROR UPDATING JOB STATUS]:', error.message);
    return res.status(500).json({
      success: false,
      error: `Database update failed: ${error.message}`
    });
  }
};

app.patch('/api/jobs/:id/status', authenticateUser, handleJobStatusUpdate);
app.put('/api/jobs/:id/status', authenticateUser, handleJobStatusUpdate);
app.patch('/api/jobs/:id', authenticateUser, handleJobStatusUpdate);
app.patch('/api/employer/jobs/:id/status', authenticateUser, handleJobStatusUpdate);
app.put('/api/employer/jobs/:id/status', authenticateUser, handleJobStatusUpdate);

// ==========================================
// 6. EMPLOYER MY JOBS API
// ==========================================
const handleGetEmployerMyJobs = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?.user_id || null;

    console.log(`--> [FETCHING MY JOBS] Authenticated User ID: ${userId}`);

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Employer ID is missing from authenticated session.',
      });
    }

    const [empProfiles] = await db.query(
      'SELECT company_name, representative_name FROM employers WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [userId],
    );
    const companyName = empProfiles?.[0]?.company_name || empProfiles?.[0]?.representative_name || '';

    const [jobs] = await db.query(
      `SELECT
         j.*,
         COALESCE((SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id), 0) AS total_applicants,
         COALESCE((SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id AND (a.status = 'pending' OR a.status IS NULL)), 0) AS pending_count,
         COALESCE((SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id AND a.status = 'shortlisted'), 0) AS shortlisted_count,
         COALESCE((SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id AND a.status = 'hired'), 0) AS hired_count
       FROM jobs j
       WHERE
         j.employer_id = ?
         OR j.employer_id IN (
           SELECT e.id
           FROM employers e
           WHERE e.user_id = ?
         )
         OR j.employer_id IN (
           SELECT cp.id
           FROM company_profiles cp
           WHERE cp.employer_id = ?
         )
         OR j.employer_id IN (
           SELECT he.id
           FROM household_employers he
           WHERE he.user_id = ?
         )
         OR (j.company_name = ? AND ? != '')
       ORDER BY j.created_at DESC`,
      [userId, userId, userId, userId, companyName, companyName],
    );

    console.log(`--> [SUCCESS] Found ${jobs.length} jobs for user ${userId} in database!`);

    return res.json({
      success: true,
      count: jobs.length,
      jobs: jobs || [],
    });
  } catch (error) {
    console.error('--> [FETCH MY JOBS ERROR]:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

app.get('/api/employer/my-jobs', authenticateUser, handleGetEmployerMyJobs);
app.get('/api/jobs/my-jobs', authenticateUser, handleGetEmployerMyJobs);

// ==========================================
// 6. GET ALL JOBS API
// ==========================================
app.get('/api/jobs', async (req, res) => {
  try {
    const [jobs] = await db.query('SELECT jobs.*, users.full_name as employer_name FROM jobs JOIN users ON jobs.employer_id = users.id ORDER BY created_at DESC');
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Get Jobs Error:', error);
    res.status(500).json({ message: 'Server error / የሰርቨር ስህተት አጋጥሟል' });
  }
});

try {
  app.use('/api', require('./routes/employerRoutes'));
} catch (error) {
  console.warn('Employer routes could not be loaded:', error.message);
}

// ==========================================
// 🔔 NOTIFICATION SYSTEM ENDPOINTS
// ==========================================

// Helper: Send single user notification
async function sendNotification(userId, recipientRole, title, message, type, link, priority = 'normal') {
  try {
    await db.query(`
      INSERT INTO notifications (user_id, type, title, message, action_url, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, NOW())
    `, [userId, type, title, message, link]);
    console.log(`--> [NOTIFICATION SENT] User: ${userId} | Type: ${type} | Priority: ${priority}`);
  } catch (err) {
    console.error("--> [NOTIFICATION SEND ERROR]:", err.message);
  }
}

// Helper: Broadcast System Notification to ALL Employers
async function broadcastSystemAnnouncement(title, message, link = '/employer/dashboard', priority = 'high') {
  try {
    const [employers] = await db.query("SELECT id FROM users WHERE role = 'employer' LIMIT 1000");
    let count = 0;
    for (const emp of employers) {
      await sendNotification(emp.id, 'employer', title, message, 'system_announcement', link, priority);
      count++;
    }
    console.log(`--> [SYSTEM BROADCAST] Dispatched to ${count} employers!`);
    return count;
  } catch (e) {
    console.error("Broadcast failed:", e);
    return 0;
  }
}

// 1. GET /api/employer/notifications - Fetch notifications for employer
app.get('/api/employer/notifications', authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const limit = Number(req.query.limit) || 50;

    const [notifications] = await db.query(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `, [userId, limit]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return res.json({ 
      success: true, 
      count: notifications.length, 
      unreadCount, 
      notifications 
    });
  } catch (err) {
    console.error("--> [GET NOTIFICATIONS ERROR]:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. PATCH /api/employer/notifications/mark-read - Mark notification(s) as read
app.patch('/api/employer/notifications/mark-read', authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { notificationId } = req.body;

    if (notificationId) {
      // Mark single notification as read
      const [result] = await db.query(
        "UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND user_id = ?", 
        [notificationId, userId]
      );
      return res.json({ success: true, message: "Notification marked as read", rowsAffected: result.affectedRows });
    } else {
      // Mark all notifications as read
      const [result] = await db.query(
        "UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ?", 
        [userId]
      );
      return res.json({ success: true, message: `${result.affectedRows} notifications marked as read` });
    }
  } catch (err) {
    console.error("--> [MARK READ ERROR]:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. ADMIN ENDPOINT - POST /api/admin/broadcast-notification
app.post('/api/admin/broadcast-notification', authenticateUser, async (req, res) => {
  // Only allow admin:
  const userRole = String(req.user?.role || '').trim().toLowerCase();
  const userEmail = String(req.user?.email || '').trim().toLowerCase();
  
  if (userRole !== 'admin' && !ADMIN_EMAILS.has(userEmail)) {
    return res.status(403).json({ success: false, error: "Unauthorized - Admin access required" });
  }

  const { title, message, link, priority } = req.body;

  if (!title || !message) {
    return res.status(400).json({ success: false, error: "Title and message are required" });
  }

  const count = await broadcastSystemAnnouncement(
    title, 
    message, 
    link || '/employer/dashboard', 
    priority || 'high'
  );

  return res.json({ 
    success: true, 
    message: `System announcement broadcasted to ${count} employers successfully.`,
    broadcastCount: count
  });
});

async function ensureAuthColumns() {
  try {
    const [jobTypeColumns] = await db.query(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'job_seeker_profiles' AND COLUMN_NAME = 'preferred_job_type'`
    );
    if (jobTypeColumns[0] && !jobTypeColumns[0].COLUMN_TYPE.includes("'contractual'")) {
      await db.query("ALTER TABLE job_seeker_profiles MODIFY COLUMN preferred_job_type ENUM('full-time', 'part-time', 'freelance', 'contractual', 'contract', 'volunteer', 'intern (paid)', 'intern (unpaid)', 'internship') DEFAULT 'full-time'");
    }

    const [applicationColumns] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'applications'`
    );
    const applicationColumnNames = new Set(applicationColumns.map(({ COLUMN_NAME: name }) => name));
    if (!applicationColumnNames.has('cv_id')) {
      await db.query('ALTER TABLE applications ADD COLUMN cv_id INT NULL');
    }
    if (!applicationColumnNames.has('resume_snapshot')) {
      await db.query('ALTER TABLE applications ADD COLUMN resume_snapshot JSON NULL');
    }

    const [jobStatusColumns] = await db.query(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'jobs' AND COLUMN_NAME = 'status'`
    );
    if (jobStatusColumns[0] && !jobStatusColumns[0].COLUMN_TYPE.includes("'active'")) {
      await db.query("ALTER TABLE jobs MODIFY COLUMN status ENUM('draft', 'active', 'published', 'closed', 'filled', 'archived') DEFAULT 'draft'");
    }
  } catch (error) {
    console.warn('Auth column compatibility check skipped:', error.message);
  }
}

ensureDatabaseSchema()
  .then(() => ensureAuthColumns())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Database schema migration failed:', error.message);
    process.exit(1);
  });
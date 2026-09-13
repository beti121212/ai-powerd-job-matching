require('dotenv').config();
const pool = require('../connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';
const JWT_EXPIRY = '7d';

// create transporter (preferred: port 465 secure)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER, // your full Gmail address
    pass: process.env.EMAIL_PASS, // 16-char App Password
  },
});

// verify transporter on startup
transporter.verify()
  .then(() => console.log('Email transporter ready'))
  .catch(err => {
    console.error('Transporter verify failed:', {
      message: err && err.message,
      code: err && err.code,
      response: err && err.response,
      responseCode: err && err.responseCode,
      stack: err && err.stack
    });
  });

// Helper: Generate 6-digit OTP Code
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper: Send Mail Function (With detailed debugging logs)
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `EthioSolve AI <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('✅ Email sent successfully:', info.response);
    return true;
  } catch (error) {
    console.error('❌ Email sending error details:', error);
    return false;
  }
};

// ==========================================
// CONTROLLER FUNCTIONS
// ==========================================

// 1. REGISTER STEP 1: SEND OTP
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required / ኢሜይል ያስፈልጋል' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already registered / ኢሜይሉ ቀደም ብሎ ተመዝግቧል' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 Minutes

    // Preserve OTP audit history. Mark previous unused codes as used instead of deleting them.
    await pool.query('UPDATE otps SET is_used = TRUE WHERE email = ? AND is_used = FALSE', [cleanEmail]);

    // አዲሱን OTP መመዝገብ
    await pool.query(
      `INSERT INTO otps (email, otp_code, purpose, expires_at, is_used) 
       VALUES (?, ?, ?, ?, FALSE)`,
      [cleanEmail, otp, 'registration', expiresAt]
    );

    // Send OTP email
    const emailSent = await sendEmail({
      to: cleanEmail,
      subject: 'EthioSolve AI - Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e293b;">Email Verification</h2>
          <p>Your OTP verification code is: <strong style="font-size: 24px; color: #2563eb;">${otp}</strong></p>
          <p>⏱️ Valid for 3 minutes (ይህ ኮድ ለ 3 ደቂቃዎች ብቻ ያገለግላል)</p>
        </div>
      `,
    });

    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP email / ኢሜይል መላክ አልተቻለም' });
    }

    return res.status(200).json({ message: 'OTP sent successfully', email: cleanEmail });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 2. RESEND OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    // አዲስ OTP ከመመዝገቡ በፊት የቀደሙትን የዚሁ ኢሜይል OTPዎች እንዲቀመጡ ያስተካክላል (DELETE የለም)
    await pool.query('UPDATE otps SET is_used = TRUE WHERE email = ? AND is_used = FALSE', [cleanEmail]);

    // አዲሱን OTP መመዝገብ
    await pool.query(
      `INSERT INTO otps (email, otp_code, purpose, expires_at, is_used) 
       VALUES (?, ?, ?, ?, FALSE)`,
      [cleanEmail, otp, 'registration', expiresAt]
    );

    const emailSent = await sendEmail({
      to: cleanEmail,
      subject: 'EthioSolve AI - Resent Verification Code',
      html: `<h2>New Verification Code</h2><p>Your new OTP is: <strong style="font-size: 24px; color: #2563eb;">${otp}</strong></p>`,
    });

    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to resend OTP' });
    }

    return res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. REGISTER STEP 2: VERIFY OTP & CREATE ACCOUNT
const register = async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword, otp, role } = req.body;

    if (!fullName || !email || !password || !confirmPassword || !otp) {
      return res.status(400).json({ error: 'All fields are required / ሁሉንም ቦታዎች ይሙሉ' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match / የይለፍ ቃሎቹ አይመሳሰሉም' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verify OTP
    const [otpRecord] = await pool.query(
      `SELECT * FROM otps 
       WHERE email = ? AND otp_code = ? AND purpose = ? AND expires_at > NOW() AND is_used = FALSE`,
      [cleanEmail, otp, 'registration']
    );

    if (otpRecord.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP / የተሳሳተ ወይም ጊዜው ያለፈበት OTP' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'job_seeker';

    // Create user in DB
    const [userResult] = await pool.query(
      'INSERT INTO users (full_name, email, phone, password, role, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, cleanEmail, phone || null, hashedPassword, userRole, true]
    );

    const userId = userResult.insertId;

    // Create job seeker profile (ለ Job Seeker ከሆነ)
    if (userRole === 'job_seeker') {
      await pool.query(
        'INSERT INTO job_seeker_profiles (user_id, profile_completion_percentage) VALUES (?, ?)',
        [userId, 20]
      );
    }

    // Mark OTP as used
    await pool.query('UPDATE otps SET is_used = TRUE WHERE email = ? AND otp_code = ?', [cleanEmail, otp]);

    // Generate JWT Token
    const token = jwt.sign({ userId, email: cleanEmail, role: userRole }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      userId,
      role: userRole,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 4. STANDARD PASSWORD LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND is_active = TRUE', [cleanEmail]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password / የተሳሳተ ኢሜይል ወይም ፓስወርድ' });
    }

    const user = users[0];
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password / የተሳሳተ ኢሜይል ወይም ፓስወርድ' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 5. PASSWORDLESS MAGIC LINK REQUEST
const requestMagicLink = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const [users] = await pool.query('SELECT id, full_name, role FROM users WHERE email = ?', [cleanEmail]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    const user = users[0];

    // Create 15-minute Magic Token
    const magicToken = jwt.sign({ userId: user.id, email: cleanEmail, role: user.role }, JWT_SECRET, {
      expiresIn: '15m',
    });

    const frontendUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
    const magicLink = `${frontendUrl}/verify-magic-link?token=${magicToken}`;

    const sent = await sendEmail({
      to: cleanEmail,
      subject: 'EthioSolve AI - Your Passwordless Login Link',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Passwordless Sign-In</h2>
          <p>Click the link below to sign in to your EthioSolve account:</p>
          <a href="${magicLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">Log In Now</a>
          <p style="margin-top: 15px; font-size: 12px; color: #666;">This link expires in 15 minutes.</p>
        </div>
      `,
    });

    if (!sent) {
      return res.status(500).json({ error: 'Failed to send magic link email' });
    }

    return res.status(200).json({ message: 'Magic link sent successfully' });
  } catch (error) {
    console.error('Magic Link error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 6. STANDALONE OTP VERIFICATION
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const [rows] = await pool.query(
      `SELECT id, otp_code, expires_at, is_used
       FROM otps
       WHERE email = ? AND is_used = FALSE
       ORDER BY created_at DESC
       LIMIT 1`,
      [cleanEmail]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const currentOtpRecord = rows[0];
    const expiresAt = new Date(currentOtpRecord.expires_at);

    if (new Date() > expiresAt) {
      await pool.query('UPDATE otps SET is_used = TRUE WHERE id = ?', [currentOtpRecord.id]);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    const storedCode = currentOtpRecord.otp_code || currentOtpRecord.otp;
    if (storedCode !== cleanOtp) {
      return res.status(400).json({ error: 'Invalid OTP code' });
    }

    await pool.query('UPDATE otps SET is_used = TRUE WHERE id = ?', [currentOtpRecord.id]);

    const [userRows] = await pool.query('SELECT id, full_name, email, role FROM users WHERE email = ?', [cleanEmail]);
    if (userRows.length === 0) {
      return res.status(200).json({ message: 'OTP verified successfully, proceed to completion', verified: true });
    }

    const user = userRows[0];
    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    return res.status(200).json({
      message: 'OTP verified successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 7. SET ROLE (ለ OAuth / Onboarding)
const setRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'User ID and Role are required' });
    }

    const formattedRole = role === 'seeker' ? 'job_seeker' : role;

    const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [formattedRole, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [rows] = await pool.query('SELECT id, full_name, email, role FROM users WHERE id = ?', [userId]);
    const updatedUser = rows[0];

    const token = jwt.sign(
      { userId: updatedUser.id, role: updatedUser.role, email: updatedUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return res.status(200).json({ message: 'Role updated successfully', user: updatedUser, token });
  } catch (error) {
    console.error('Set Role error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 8. APPLY FOR JOB (QUICK APPLY WITH CV UPLOAD)
const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const applicantId = req.user?.userId || req.user?.id;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'እባክዎ CV ወይም Resume Upload ያድርጉ!',
      });
    }

    const cvUrl = req.file.path || req.file.filename;

    const [result] = await pool.query(
      'INSERT INTO applications (job_id, applicant_id, cv_url, status) VALUES (?, ?, ?, ?)',
      [jobId, applicantId, cvUrl, 'pending']
    );

    return res.status(201).json({
      success: true,
      message: 'ማመልከቻዎ እና CVዎ በስኬት ተልኳል!',
      data: {
        applicationId: result.insertId,
        jobId,
        applicantId,
        cvUrl,
      },
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    return res.status(500).json({
      success: false,
      message: 'ማመልከቻውን በመላክ ላይ ስህተት ተፈጥሯል',
      error: error.message,
    });
  }
};

// ==========================================
// UNIFIED EXPORTS
// ==========================================
module.exports = {
  sendOTP,
  resendOTP,
  register,
  login,
  requestMagicLink,
  verifyOTP,
  setRole,
  applyForJob,
};
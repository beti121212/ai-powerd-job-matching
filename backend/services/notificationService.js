const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const smtpPassword = process.env.EMAIL_APP_PASSWORD
  ? process.env.EMAIL_APP_PASSWORD.replace(/\s+/g, '')
  : process.env.SMTP_PASS || process.env.EMAIL_PASS || '';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || undefined,
  host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 465),
  secure: String(process.env.SMTP_SECURE || process.env.EMAIL_SECURE || 'true') === 'true',
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || smtpPassword,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('❌ [GMAIL SMTP AUTH FAILED]:', error.message);
  } else {
    console.log('✅ [GMAIL SMTP AUTH SUCCESS]: Fast SMTP connection pool active.');
  }
});

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const sendEmailOtp = async (toEmail, otpCode, recipientName = 'User') => {
  const cleanTo = toEmail.trim().toLowerCase();
  const senderEmail = process.env.SMTP_USER || process.env.EMAIL_USER;
  const senderName = 'SmartRecruit AI';

  if (!senderEmail || !smtpPassword) {
    throw new Error('Gmail SMTP credentials are not configured. Set SMTP_USER/EMAIL_USER and EMAIL_APP_PASSWORD.');
  }

  const mailOptions = {
    from: `"${senderName}" <${senderEmail}>`,
    to: cleanTo,
    subject: `${otpCode} is your SmartRecruit AI verification code`,
    priority: 'high',
    text: `Your SmartRecruit AI verification code is: ${otpCode}. Valid for 3 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h2 style="color: #0f172a; margin-bottom: 8px;">SmartRecruit AI Verification</h2>
        <p style="color: #475569; font-size: 15px;">Use the verification code below to sign in to your account:</p>
        <div style="background: #f1f5f9; padding: 16px; border-radius: 12px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb;">${escapeHtml(otpCode)}</span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This code will expire in 3 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `,
    headers: {
      'X-Priority': '1 (Highest)',
      'X-MSMail-Priority': 'High',
      'Importance': 'High',
      'X-Mailer': 'SmartRecruit Transactional Mailer',
    },
  };

  console.log(`📡 [DISPATCHING GMAIL] Sending OTP ${otpCode} to ${cleanTo}...`);
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL SENT SUCCESS] Message ID: ${info.messageId} to ${cleanTo}`);
    return info;
  } catch (error) {
    console.error(`❌ [EMAIL OTP DELIVERY FAILED] ${cleanTo}:`, error.message);
    throw new Error('OTP email delivery failed. Please check the mail server configuration.');
  }
};

module.exports = { sendEmailOtp };

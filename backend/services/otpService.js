const twilio = require('twilio');
const crypto = require('crypto');
const { sendEmailOtp } = require('./notificationService');

const MAX_RESENDS_PER_HOUR = 5;

const smsClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

console.log('[OTP SMS CONFIGURED]:', Boolean(smsClient && process.env.TWILIO_PHONE_NUMBER));

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const sendOtpSms = async (phone, otpCode) => {
  if (!phone) return false;
  if (!smsClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn('Twilio credentials are not configured; SMS was not sent.');
    return false;
  }

  await smsClient.messages.create({
    body: `Your Job Matching AI verification code is ${otpCode}. It expires in 3 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
  return true;
};

const issueOtp = async ({ dbClient, email, phone, purpose = 'registration', expiresInMinutes = 3 }) => {
  const cleanEmail = email.trim().toLowerCase();
  const client = dbClient;
  const [recentRows] = await client.execute(
    `SELECT COUNT(*) AS request_count
     FROM otps
     WHERE email = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
    [cleanEmail]
  );
  if (Number(recentRows[0]?.request_count || 0) >= MAX_RESENDS_PER_HOUR) {
    const error = new Error('Too many OTP requests. Please try again later.');
    error.code = 'OTP_RATE_LIMITED';
    throw error;
  }
  const otpCode = crypto.randomInt(100000, 1000000).toString();
  console.log(`--> [OTP ATTEMPT] Email: ${cleanEmail} | Generated Code: ${otpCode}`);
  const safeExpiry = Number.isInteger(expiresInMinutes) && expiresInMinutes > 0 ? expiresInMinutes : 3;

  try {
    await client.query('UPDATE otps SET is_used = 1 WHERE email = ? AND is_used = 0', [cleanEmail]);
  } catch (error) {
    console.warn('--> [WARN] Failed to invalidate old OTPs:', error.message);
  }

  const insertSql = `
    INSERT INTO otps (email, otp_code, purpose, is_used, attempts, expires_at, created_at)
    VALUES (?, ?, ?, 0, 0, DATE_ADD(NOW(), INTERVAL ${safeExpiry} MINUTE), NOW())
  `;

  let insertResult;
  try {
    [insertResult] = await client.query(insertSql, [cleanEmail, otpCode, purpose]);
    if (!insertResult.insertId) {
      throw new Error('MySQL did not return an OTP insert ID.');
    }
    console.log(`--> [DATABASE SUCCESS] OTP inserted into MySQL otps table! Insert ID: ${insertResult.insertId}`);
  } catch (dbError) {
    console.error('--> [FATAL MYSQL INSERT ERROR on otps table]:', dbError.message);
    console.error(dbError);
    throw dbError;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV ONLY] OTP for ${cleanEmail}: ${otpCode}`);
  }
  const [emailResult, smsResult] = await Promise.allSettled([
    sendEmailOtp(cleanEmail, otpCode),
    sendOtpSms(phone, otpCode),
  ]);
  if (emailResult.status === 'fulfilled') {
    console.log(`✅ OTP email sent for ${cleanEmail}.`);
  } else {
    console.error(`❌ OTP email delivery failed for ${cleanEmail}:`, emailResult.reason?.message || emailResult.reason);
  }
  if (smsResult.status === 'rejected') {
    console.error('OTP SMS delivery failed:', smsResult.reason?.message || smsResult.reason);
  }

  return {
    otpCode,
    delivery: {
      email: emailResult.status === 'fulfilled',
      sms: smsResult.status === 'fulfilled' && smsResult.value === true,
    },
  };
};

const generateAndSendOtp = async ({ email, phone, purpose = 'registration', dbClient, recipientName }) => {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('Email is required to generate OTP.');
  }

  const client = dbClient || require('../connection');
  const result = await issueOtp({ dbClient: client, email: cleanEmail, phone, purpose });

  return {
    success: true,
    email: cleanEmail,
    purpose,
    recipientName,
    otpCode: result.otpCode,
    delivery: result.delivery,
  };
};

module.exports = { issueOtp, generateAndSendOtp };

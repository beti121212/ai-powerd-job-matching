const twilio = require('twilio');
const crypto = require('crypto');
const { sendEmailOtp } = require('./notificationService');

const resendHistory = new Map();
const RESEND_WINDOW_MS = 60 * 60 * 1000;
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
  const now = Date.now();
  const recentResends = (resendHistory.get(cleanEmail) || []).filter((timestamp) => now - timestamp < RESEND_WINDOW_MS);
  if (recentResends.length >= MAX_RESENDS_PER_HOUR) {
    const error = new Error('Too many OTP requests. Please try again later.');
    error.code = 'OTP_RATE_LIMITED';
    throw error;
  }
  resendHistory.set(cleanEmail, [...recentResends, now]);
  const otpCode = crypto.randomInt(100000, 1000000).toString();
  const client = dbClient;
  const safeExpiry = Number.isInteger(expiresInMinutes) && expiresInMinutes > 0 ? expiresInMinutes : 3;

  await client.execute('UPDATE otps SET is_used = TRUE WHERE email = ? AND is_used = FALSE', [cleanEmail]);
  await client.execute(
    `INSERT INTO otps (email, otp_code, purpose, expires_at, is_used)
    VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ${safeExpiry} MINUTE), FALSE)`,
      [cleanEmail, otpCode, purpose]
  );

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV ONLY] OTP for ${cleanEmail}: ${otpCode}`);
  }
  const delivery = { email: false, sms: false };
  try {
    await sendEmailOtp(cleanEmail, otpCode);
    delivery.email = true;
  } catch (error) {
    if (process.env.NODE_ENV === 'production') throw error;
    console.warn('[DEV OTP FALLBACK] Email delivery failed; use the OTP printed above.', error.message);
  }
  try {
    delivery.sms = await sendOtpSms(phone, otpCode);
  } catch (error) {
    console.error('OTP SMS delivery failed:', error.message);
  }

  return { otpCode, delivery };
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

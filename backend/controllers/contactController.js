const contactModel = require('../models/contactModel');

function validateContactMessage(body = {}) {
  const fullName = String(body.fullName || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const subject = String(body.subject || '').trim();
  const message = String(body.message || '').trim();

  if (!fullName) return { error: 'Full name is required.' };
  if (!email) return { error: 'Email address is required.' };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: 'Enter a valid email address.' };
  if (!subject) return { error: 'Subject is required.' };
  if (!message) return { error: 'Message is required.' };
  if (message.length < 20) return { error: 'Message must be at least 20 characters.' };
  if (message.length > 1000) return { error: 'Message must be 1000 characters or fewer.' };

  return { data: { fullName, email, subject, message } };
}

async function createContactMessage(req, res) {
  const { error, data } = validateContactMessage(req.body);
  if (error) return res.status(400).json({ success: false, message: error });

  try {
    const savedMessage = await contactModel.createContactMessage(data);
    return res.status(201).json({
      success: true,
      message: 'Your message was submitted successfully.',
      contactMessage: savedMessage,
    });
  } catch (databaseError) {
    console.error('Contact message creation failed:', databaseError);
    return res.status(500).json({ success: false, message: 'Unable to save your message right now.' });
  }
}

module.exports = { createContactMessage };

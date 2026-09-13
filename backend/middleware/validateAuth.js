const nameRegex = /^[\p{L}\s]{3,60}$/u;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{6,32}$/;
const phoneRegex = /^\+?[0-9]{9,15}$/;
const { validateRealEmail } = require('../utils/emailValidator');

const validationResponse = (res, errors) => res.status(422).json({
  success: false,
  message: 'የተሳሳተ መረጃ ገብቷል (Validation failed)',
  errors,
});

const validateSignUp = async (req, res, next) => {
  const { fullName, email, password, phone, role } = req.body;
  const errors = {};
  const cleanName = typeof fullName === 'string' ? fullName.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanPhone = typeof phone === 'string' ? phone.replace(/\s+/g, '') : '';

  if (!nameRegex.test(cleanName)) {
    errors.fullName = 'Full name must contain letters and spaces only, between 3 and 60 characters.';
  }
  if (!emailRegex.test(cleanEmail)) {
    errors.email = 'Please provide a valid email address.';
  } else {
    const emailResult = await validateRealEmail(cleanEmail);
    if (!emailResult.isValid) errors.email = emailResult.message;
  }
  if (!passwordRegex.test(typeof password === 'string' ? password : '')) {
    errors.password = 'Password must be 6-32 characters and include a letter, number, and special character.';
  }
  if (phone && !phoneRegex.test(cleanPhone)) {
    errors.phone = 'Please provide a valid phone number.';
  }
  if (role && !['employer', 'job_seeker'].includes(role)) {
    errors.role = 'Invalid role specified.';
  }

  if (Object.keys(errors).length > 0) return validationResponse(res, errors);

  req.body.fullName = cleanName;
  req.body.email = cleanEmail;
  if (phone) req.body.phone = cleanPhone;
  next();
};

const validateLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!emailRegex.test(cleanEmail)) {
    errors.email = 'Please provide a valid email address.';
  } else {
    const emailResult = await validateRealEmail(cleanEmail);
    if (!emailResult.isValid) errors.email = emailResult.message;
  }
  if (typeof password !== 'string' || password.length < 6) {
    errors.password = 'Password is required and must be at least 6 characters.';
  }

  if (Object.keys(errors).length > 0) return validationResponse(res, errors);

  req.body.email = cleanEmail;
  next();
};

module.exports = { validateSignUp, validateLogin };

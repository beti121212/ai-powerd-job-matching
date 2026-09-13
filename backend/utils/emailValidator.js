const dns = require('dns').promises;

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'yopmail.com',
  'trashmail.com',
  'sharklasers.com',
  'getairmail.com',
  'dispostable.com',
  'throwawaymail.com',
  'mytemp.email',
  'temp-mail.org',
]);

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const validateRealEmail = async (email) => {
  if (typeof email !== 'string' || !email.trim()) {
    return { isValid: false, message: 'Email is required.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { isValid: false, message: 'Invalid email format. Use an address such as name@example.com.' };
  }

  const domain = cleanEmail.slice(cleanEmail.lastIndexOf('@') + 1);
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { isValid: false, message: 'Temporary or disposable email addresses are not allowed.' };
  }

  try {
    let mxRecords;
    try {
      mxRecords = await dns.resolveMx(domain);
    } catch (error) {
      if (!['ECONNREFUSED', 'ETIMEOUT', 'SERVFAIL'].includes(error.code)) throw error;
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      mxRecords = await dns.resolveMx(domain);
    }
    if (!mxRecords || mxRecords.length === 0) {
      return { isValid: false, message: 'Email domain does not exist or cannot receive emails.' };
    }
  } catch {
    return { isValid: false, message: 'Email domain does not exist or cannot receive emails.' };
  }

  return { isValid: true, cleanEmail };
};

module.exports = { DISPOSABLE_DOMAINS, validateRealEmail };

const db = require('../config/db');

(async () => {
  const email = 'dev.signup.check.20260911@gmail.com';
  try {
    await db.query('DELETE FROM otps WHERE email = ?', [email]);
    await db.query('DELETE FROM users WHERE email = ?', [email]);
    console.log('TEST DATA REMOVED');
  } finally {
    await db.end();
  }
})().catch((error) => {
  console.error('CLEANUP FAILED:', error.message);
  process.exitCode = 1;
});

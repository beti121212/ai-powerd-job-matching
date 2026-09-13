const db = require('../config/db');

const migrate = async () => {
  try {
    const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'auth_status'");

    if (!columns.length) {
      await db.query(
        "ALTER TABLE users ADD COLUMN auth_status ENUM('pending_verification', 'active') NOT NULL DEFAULT 'pending_verification' AFTER is_verified"
      );
      console.log('AUTH_STATUS MIGRATION APPLIED');
    } else {
      console.log('AUTH_STATUS ALREADY EXISTS');
    }
  } finally {
    await db.end();
  }
};

migrate().catch((error) => {
  console.error('AUTH_STATUS MIGRATION FAILED:', error.code, error.message);
  process.exitCode = 1;
});
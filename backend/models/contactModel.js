const db = require('../config/db');

async function createContactMessage({ fullName, email, subject, message }) {
  const [result] = await db.execute(
    `INSERT INTO contact_messages (full_name, email, subject, message)
     VALUES (?, ?, ?, ?)`,
    [fullName, email, subject, message]
  );

  return { id: result.insertId };
}

module.exports = { createContactMessage };

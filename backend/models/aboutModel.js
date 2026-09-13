const db = require('../config/db');

async function getAboutContent() {
  const [rows] = await db.execute(
    `SELECT id, title, description, mission, vision, updated_at
     FROM about_content
     ORDER BY updated_at DESC, id DESC
     LIMIT 1`
  );

  return rows[0] || null;
}

module.exports = { getAboutContent };

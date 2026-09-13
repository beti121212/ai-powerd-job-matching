const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'job_matching',
  waitForConnections: true,
  connectionLimit: 5,
});

async function seed() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const employerUser = await connection.query(
      `INSERT INTO users (full_name, email, phone, password, role, is_verified, is_active, auth_provider)
       VALUES (?, ?, ?, ?, 'employer', TRUE, TRUE, 'email')
       ON DUPLICATE KEY UPDATE email = email`,
      ['Aster Digital', 'aster@example.com', '+251911223344', '$2a$10$QmPs8Qx7Bq0n8V2l9ej5e.GbdfdC0rXJxXxOe3B0k2f4Qn8m2O2K2', 'employer']
    );
    const employerId = employerUser[0].insertId || 1;

    await connection.query(
      `INSERT INTO company_profiles (employer_id, company_name, representative_name, representative_title, work_email, phone, industry, company_size, website, location, verification_status, company_summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', ?)
       ON DUPLICATE KEY UPDATE company_name = VALUES(company_name)`,
      [employerId, 'Aster Digital', 'Selam Bekele', 'Talent Acquisition Lead', 'aster@example.com', '+251911223344', 'Software & AI', '11-50', 'https://asterdigital.et', 'Addis Ababa', 'We connect product teams with builders across Ethiopia.']
    );

    await connection.query(
      `INSERT INTO employers (userId, companyName, legalBusinessName, tinNumber, logoUrl, website, industry, companySize, location, verificationStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified')
       ON DUPLICATE KEY UPDATE companyName = VALUES(companyName)`,
      [employerId, 'Aster Digital', 'Aster Digital Solutions PLC', 'TIN-123456', 'https://example.com/logo.png', 'https://asterdigital.et', 'Software & AI', '11-50', 'Addis Ababa']
    );

    const jobs = [
      ['Senior Frontend Engineer', 'full-time', 'Engineering', 'Addis Ababa', 20000, 35000, 'ETB', 'mid-level', ['React', 'TypeScript', 'UI Systems', 'Node.js'], 'Build product experiences for customers and internal operators.'],
      ['Accountant', 'full-time', 'Finance', 'Addis Ababa', 12000, 22000, 'ETB', 'mid-level', ['Accounting / IFRS', 'Excel', 'Tax Reporting', 'Financial Modeling'], 'Lead reporting, reconciliations, and compliance across finance operations.'],
      ['Marketing Manager', 'full-time', 'Marketing', 'Hybrid', 18000, 32000, 'ETB', 'senior-level', ['Digital Marketing', 'Campaign Strategy', 'Brand Management', 'Communication'], 'Drive acquisition campaigns, brand positioning, and conversion-focused marketing performance.'],
    ];

    for (const [title, jobType, category, location, min, max, currency, level, skills, description] of jobs) {
      const jobInsert = await connection.query(
        `INSERT INTO jobs (employer_id, title, slug, description, category, job_type, experience_level, location, country, city, work_mode, salary_min, salary_max, currency, status, application_deadline)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Ethiopia', ?, 'hybrid', ?, ?, ?, 'published', DATE_ADD(CURDATE(), INTERVAL 30 DAY))`,
        [employerId, title, `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`, description, category, jobType, level, location, location, min, max, currency]
      );
      const jobId = jobInsert[0].insertId;
      for (const skill of skills) {
        await connection.query('INSERT INTO job_required_skills (job_id, skill_name, proficiency_level) VALUES (?, ?, ?)', [jobId, skill, 'advanced']);
      }
    }

    const seekerIds = [
      { name: 'Mekdes Tadesse', email: 'mekdes@example.com', role: 'Frontend Engineer', skills: ['React', 'TypeScript', 'CSS', 'Accessibility'], score: 96 },
      { name: 'Abel Bekele', email: 'abel@example.com', role: 'Full Stack Engineer', skills: ['Node.js', 'React', 'PostgreSQL', 'REST APIs'], score: 92 },
      { name: 'Selam Hailu', email: 'selam@example.com', role: 'Data Analyst', skills: ['SQL', 'Python', 'Power BI', 'Statistics'], score: 88 },
      { name: 'Netsanet Fikadu', email: 'netsanet@example.com', role: 'Product Designer', skills: ['Figma', 'Design Systems', 'UX Research'], score: 90 },
      { name: 'Yared Getachew', email: 'yared@example.com', role: 'Software Engineer', skills: ['JavaScript', 'Node.js', 'AWS'], score: 86 },
      { name: 'Hanna Solomon', email: 'hanna@example.com', role: 'Marketing Manager', skills: ['Digital Marketing', 'Brand Strategy', 'Communication', 'Campaign Analytics'], score: 81 },
      { name: 'Biniam Daniel', email: 'biniam@example.com', role: 'Accountant', skills: ['Accounting / IFRS', 'Financial Modeling', 'Excel', 'Tax Reporting'], score: 77 },
    ];

    for (const [index, candidate] of seekerIds.entries()) {
      const [userRow] = await connection.query('SELECT id FROM users WHERE email = ?', [candidate.email]);
      let userId = null;
      if (!userRow.length) {
        const insert = await connection.query(
          `INSERT INTO users (full_name, email, phone, password, role, is_verified, is_active, auth_provider)
           VALUES (?, ?, ?, ?, 'job_seeker', TRUE, TRUE, 'email')`,
          [candidate.name, candidate.email, `+2519${10000000 + index}`, '$2a$10$Xj0MjK3m7aLjQYdD4xLJ4e2xHn9bWe5oR1oRDmOXQK1N4b0C9rM12', 'job_seeker']
        );
        userId = insert[0].insertId;
      } else {
        userId = userRow[0].id;
      }

      await connection.query(
        `INSERT INTO job_seeker_profiles (user_id, headline, location, preferred_work_mode, skills, profile_completion_percentage, is_available)
         VALUES (?, ?, ?, 'hybrid', ?, 96, TRUE)
         ON DUPLICATE KEY UPDATE headline = VALUES(headline), skills = VALUES(skills)`,
        [userId, candidate.role, 'Addis Ababa', JSON.stringify(candidate.skills.map((skill) => ({ skill_name: skill, proficiency_level: 'advanced' })))]
      );

      const jobIds = await connection.query('SELECT id FROM jobs WHERE employer_id = ?', [employerId]);
      if (jobIds[0].length) {
        const jobId = jobIds[0][0].id;
        await connection.query(
          `INSERT INTO applications (job_id, job_seeker_id, status, ai_match_score, applied_at)
           VALUES (?, ?, 'shortlisted', ?, NOW())
           ON DUPLICATE KEY UPDATE ai_match_score = VALUES(ai_match_score)`,
          [jobId, userId, candidate.score]
        );
      }
    }

    await connection.query(
      `INSERT INTO employer_settings (userId, emailAlerts, matchingAlerts, weeklyDigest, notificationEmail, teamPermissions)
       VALUES (?, TRUE, TRUE, FALSE, ?, ?)
       ON DUPLICATE KEY UPDATE emailAlerts = VALUES(emailAlerts)`,
      [employerId, 'aster@example.com', JSON.stringify({ canManageJobs: true, canReviewApplications: true, canMessageCandidates: true })]
    );

    await connection.commit();
    console.log('✅ Employer dashboard seed complete for demo data.');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed();

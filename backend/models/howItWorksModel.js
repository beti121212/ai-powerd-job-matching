const db = require('../config/db');

const defaultSteps = {
  seekers: [
    { id: 'default-seeker-1', audience: 'seekers', step_number: 1, title: 'Create your profile', description: 'Add your skills, experience, and career preferences so the platform can understand what you are looking for.', type: 'profile', route: '/profile' },
    { id: 'default-seeker-2', audience: 'seekers', step_number: 2, title: 'Discover relevant jobs', description: 'Browse opportunities ranked by how closely they match your profile and goals.', type: 'search', route: '/jobs' },
    { id: 'default-seeker-3', audience: 'seekers', step_number: 3, title: 'Review your match score', description: 'See the skills and experience behind each recommendation before you apply.', type: 'ai', route: '/matches' },
    { id: 'default-seeker-4', audience: 'seekers', step_number: 4, title: 'Apply with confidence', description: 'Submit your CV and track application progress from one place.', type: 'apply', route: '/applications' },
  ],
  employers: [
    { id: 'default-employer-1', audience: 'employers', step_number: 1, title: 'Create a job listing', description: 'Describe the role, required skills, and experience you need.', type: 'profile', route: '/employer/jobs' },
    { id: 'default-employer-2', audience: 'employers', step_number: 2, title: 'Reach matched candidates', description: 'Connect with job seekers whose profiles align with your requirements.', type: 'search', route: '/employer/matches' },
    { id: 'default-employer-3', audience: 'employers', step_number: 3, title: 'Compare applications', description: 'Review candidate profiles and match evidence in one focused view.', type: 'ai', route: '/employer/applications' },
    { id: 'default-employer-4', audience: 'employers', step_number: 4, title: 'Build your team', description: 'Move promising candidates through your hiring workflow and connect directly.', type: 'connect', route: '/employer/applications' },
  ],
};

async function getHowItWorksSteps(audience) {
  try {
    const [rows] = await db.execute(
      `SELECT id, audience, step_number, title, description, type, route
       FROM how_it_works_steps
       WHERE audience = ? AND is_active = 1
       ORDER BY step_number ASC`,
      [audience]
    );

    return rows.length ? rows : defaultSteps[audience];
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') return defaultSteps[audience];
    throw error;
  }
}

module.exports = { getHowItWorksSteps };

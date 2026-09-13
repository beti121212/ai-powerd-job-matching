const howItWorksModel = require('../models/howItWorksModel');

async function getHowItWorks(req, res) {
  const audience = String(req.query.audience || 'seekers').trim().toLowerCase();
  if (!['seekers', 'employers'].includes(audience)) {
    return res.status(400).json({ success: false, message: 'Audience must be seekers or employers.' });
  }

  try {
    const steps = await howItWorksModel.getHowItWorksSteps(audience);
    return res.json({ success: true, audience, steps });
  } catch (error) {
    console.error('How It Works fetch failed:', error);
    return res.status(500).json({ success: false, message: 'Unable to load How It Works steps.' });
  }
}

module.exports = { getHowItWorks };

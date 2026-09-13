const aboutModel = require('../models/aboutModel');

async function getAboutContent(_req, res) {
  try {
    const content = await aboutModel.getAboutContent();

    if (!content) {
      return res.status(404).json({ success: false, message: 'About content is not configured.' });
    }

    return res.json({ success: true, about: content });
  } catch (error) {
    console.error('About content fetch failed:', error);
    return res.status(500).json({ success: false, message: 'Unable to load About content.' });
  }
}

module.exports = { getAboutContent };

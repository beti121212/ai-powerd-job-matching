const express = require('express');
const { getAboutContent } = require('../controllers/aboutController');

const router = express.Router();

router.get('/', getAboutContent);

module.exports = router;

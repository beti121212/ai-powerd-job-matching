const express = require('express');
const { getHowItWorks } = require('../controllers/howItWorksController');

const router = express.Router();

router.get('/', getHowItWorks);

module.exports = router;

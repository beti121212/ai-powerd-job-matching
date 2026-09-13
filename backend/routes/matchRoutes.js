const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { applyToJob, getMyMatches } = require('../controllers/matchController');

const router = express.Router();
router.use(authMiddleware);
router.get('/me', getMyMatches);
router.post('/', applyToJob);

module.exports = router;

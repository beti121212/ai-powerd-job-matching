const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getProfile, updateProfile, saveProfile } = require('../controllers/jobSeekerController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/', updateProfile);
router.post('/save', saveProfile);

module.exports = router;
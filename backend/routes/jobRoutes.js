const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const { getJobs, getJob, createJob } = require('../controllers/jobController');
const { getMatchedJobs } = require('../controllers/seekerMatchingController');

router.get('/', getJobs);
router.post('/', authMiddleware, createJob);
router.get('/match', authMiddleware, getMatchedJobs);

// Dynamic Skill Matching Algorithm
function calculateRealMatch(seekerSkills = [], requiredSkills = []) {
    // 1. Array ካልሆነ ወደ Array መቀየር (comma-separated text ከሆነ)
    let reqArray = Array.isArray(requiredSkills) 
        ? requiredSkills 
        : (requiredSkills || '').split(',').map(s => s.trim());

    let seekerArray = Array.isArray(seekerSkills) 
        ? seekerSkills 
        : (seekerSkills || '').split(',').map(s => s.trim());

    if (!reqArray.length || reqArray[0] === '') return 50;

    // 2. በካፒታል/ስሞል ሌተር ሳይለያይ ለማወዳደር lowercase ማድረግ
    const seekerSet = new Set(seekerArray.map(s => s.toLowerCase()));
    
    let matchCount = 0;
    reqArray.forEach(skill => {
        if (seekerSet.has(skill.toLowerCase())) {
            matchCount++;
        }
    });

    const score = Math.round((matchCount / reqArray.length) * 100);
    return Math.max(score, 35); // ዝቅተኛው የመነሻ Match Percentage 35% ነው
}

// -------------------------------------------------------------
// Endpoint 1: Quick Apply (ስራ ፈላጊው ሲያመልክ)
// POST: http://localhost:5000/api/jobs/apply
// -------------------------------------------------------------
router.post('/apply', async (req, res) => {
    const { job_id, seeker_id, seeker_skills, required_skills } = req.body;

    if (!job_id || !seeker_id) {
        return res.status(400).json({ success: false, message: 'Job ID and Seeker ID are required.' });
    }

    try {
        // Match Score ማስላት
        const score = calculateRealMatch(seeker_skills, required_skills);

        // ወደ ዳታቤዝ ማስገባት
        const query = `INSERT INTO applications (job_id, seeker_id, match_score) VALUES (?, ?, ?)`;
        await db.query(query, [job_id, seeker_id, score]);

        res.status(201).json({ 
            success: true, 
            message: 'Application submitted successfully!',
            matchScore: score 
        });
    } catch (error) {
        // ድጋሚ ማመልከት ከሞከረ (Unique constraint violation)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'You have already applied for this job!' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

// -------------------------------------------------------------
// Endpoint 2: Get Applicants for a Job (ቀጣሪው አመልካቾችን ሲያይ)
// GET: http://localhost:5000/api/jobs/:jobId/applicants
// -------------------------------------------------------------
router.get('/:jobId/applicants', async (req, res) => {
    const { jobId } = req.params;

    try {
        const query = `
            SELECT a.id as application_id, u.id as seeker_id, u.name, u.email, u.skills, a.match_score, a.applied_at
            FROM applications a
            JOIN users u ON a.seeker_id = u.id
            WHERE a.job_id = ?
            ORDER BY a.match_score DESC
        `;
        const [applicants] = await db.query(query, [jobId]);

        res.json({ success: true, applicants });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:id', getJob);

module.exports = router;

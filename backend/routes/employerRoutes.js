const express = require('express');
const jwt = require('jsonwebtoken');
const controller = require('../controllers/employerController');

const router = express.Router();
const authenticate = (req, res, next) => {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required.' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key_here'); return next(); }
  catch { return res.status(401).json({ success: false, message: 'Invalid or expired token.' }); }
};
const employerOnly = (req, res, next) => ['employer', 'company', 'recruiter'].includes(String(req.user.role || '').toLowerCase()) ? next() : res.status(403).json({ success: false, message: 'Employer access required.' });
const isEmployerApiPath = (path) => path === '/jobs' || path.startsWith('/jobs/') || path === '/interviews' || path.startsWith('/interviews/') || path === '/employer' || path.startsWith('/employer/') || path === '/applications' || path.startsWith('/applications/');

router.use((req, res, next) => isEmployerApiPath(req.path) ? authenticate(req, res, () => employerOnly(req, res, next)) : next());
router.get('/employer/profile', controller.getCompanyProfile);
router.put('/employer/profile', controller.updateCompanyProfile);
router.post('/employer/profile', controller.updateCompanyProfile);
router.get('/employer/stats', controller.getDashboardStats);
router.get('/employer/dashboard', controller.getDashboardOverview);
router.get('/employer/applications', controller.getEmployerApplications);
router.patch('/employer/applications/:applicationId/status', controller.updateApplicationStatus);
router.patch('/employer/applications/:applicationId/stage', controller.updateApplicationStatus);
router.get('/employer/jobs', controller.getEmployerJobs);
router.post('/employer/jobs', controller.createJob);
router.put('/employer/jobs/:jobId', controller.updateJob);
router.get('/employer/jobs/:jobId/applications', controller.getJobApplicants);
router.get('/jobs/:jobId/top-candidates', controller.getTopCandidates);
router.get('/employer/jobs/:jobId/top-candidates', controller.getTopCandidates);
router.get('/employer/job-invitations', controller.getJobInvitations);
router.post('/employer/job-invitations', controller.createJobInvitation);
router.get('/employer/talent-pool', controller.getTalentPool);
router.post('/employer/talent-pool/save', controller.saveTalentPoolCandidate);
router.get('/employer/jobs/:jobId/ai-talent-pool', controller.getTopCandidates);
router.get('/employer/pipeline', controller.getEmployerPipeline);
router.get('/employer/offers', controller.getEmployerOffers);
router.post('/employer/offers', controller.createEmployerOffer);
router.get('/employer/onboarding', controller.getEmployerOnboarding);
router.patch('/employer/onboarding/:taskId', controller.updateEmployerOnboardingTask);
router.patch('/employer/applications/:applicationId/finalize', controller.finalizeEmployerEmployee);
router.patch('/employer/jobs/:jobId/status', controller.setJobStatus);
router.delete('/employer/jobs/:jobId', controller.deleteJob);
router.post('/jobs', controller.createJob);
router.put('/jobs/:jobId', controller.updateJob);
router.patch('/jobs/:jobId/publish', (req, res) => { req.body.status = 'published'; return controller.setJobStatus(req, res); });
router.patch('/jobs/:jobId/schedule', (req, res) => { req.body.status = 'published'; return controller.setJobStatus(req, res); });
router.patch('/applications/:applicationId/shortlist', (req, res) => { req.body.status = 'shortlisted'; return controller.updateApplicationStatus(req, res); });
router.patch('/applications/:applicationId/hire', (req, res) => { req.body.status = 'hired'; return controller.updateApplicationStatus(req, res); });
router.patch('/applications/:applicationId/reject', (req, res) => { req.body.status = 'rejected'; return controller.updateApplicationStatus(req, res); });
router.post('/interviews', controller.scheduleInterview);
router.post('/employer/interviews', controller.scheduleInterview);
router.get('/employer/interviews', controller.getUpcomingInterviews);
router.get('/employer/messages', controller.getEmployerMessages);
router.post('/employer/messages', controller.sendEmployerMessage);
router.get('/employer/notifications', controller.getEmployerNotifications);
router.patch('/employer/notifications/:id/read', controller.markEmployerNotificationRead);
router.get('/employer/settings', controller.getEmployerSettings);
router.put('/employer/settings', controller.updateEmployerSettings);
router.post('/employer/settings', controller.updateEmployerSettings);

module.exports = router;
const jobModel = require('../models/jobModel');

async function getJobs(req, res) {
  try {
    return res.json({ success: true, jobs: await jobModel.listJobs() });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load jobs.' });
  }
}

async function getJob(req, res) {
  try {
    const job = await jobModel.findJobById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    return res.json({ success: true, job });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load job.' });
  }
}

async function createJob(req, res) {
  const { title, description, jobType } = req.body;
  if (!title || !description || !jobType) return res.status(400).json({ success: false, message: 'title, description, and jobType are required.' });
  try {
    const job = await jobModel.createJob({ ...req.body, employerId: req.user.id });
    return res.status(201).json({ success: true, job });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to create job.' });
  }
}

module.exports = { getJobs, getJob, createJob };

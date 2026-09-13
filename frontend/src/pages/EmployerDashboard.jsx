import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Briefcase, Users, UserCheck, Calendar, CheckCircle2,
  XCircle, Search, Edit3, Trash2, PauseCircle, PlayCircle,
  Download, Sparkles, Eye, X, LayoutDashboard, Settings,
  Bell, UserRoundCheck, Target, FilePlus2
} from 'lucide-react';
import { notifyMockApplication, rescheduleMockInterview, scheduleMockInterview, updateMockInterview } from '../utils/interviewFlow';

const EmployerDashboard = () => {
  const navigate = useNavigate();

  // 1. User & Auth State
  const [user] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. Dashboard UI States
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // 3. Company Profile State
  const [companyProfile, setCompanyProfile] = useState({
    name: '',
    industry: '',
    location: '',
    website: ''
  });
  const [editCompanyMode, setEditCompanyMode] = useState(false);
  const [companySaving, setCompanySaving] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');

  // 4. Job Posts State
  const [jobs, setJobs] = useState(() => JSON.parse(localStorage.getItem('employerJobs') || '[]'));

  // 5. Applicants State
  const [applicants, setApplicants] = useState(() => JSON.parse(localStorage.getItem('employerApplications') || '[]'));
  const [interviews, setInterviews] = useState(() => JSON.parse(localStorage.getItem('employerInterviews') || '[]'));

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'company', label: 'Company Profile', icon: Building2 },
    { id: 'post', label: 'Post Job', icon: FilePlus2 },
    { id: 'jobs', label: 'My Jobs', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: Users },
    { id: 'matching', label: 'AI Candidate Matching', icon: Target },
    { id: 'shortlisted', label: 'Shortlisted', icon: UserRoundCheck },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'hired', label: 'Hired Candidates', icon: CheckCircle2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Modals State
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewForm, setInterviewForm] = useState({ date: '', time: '', type: 'Online', location: '', meetingLink: '', instructions: '' });

  // New Job Form State
  const [newJob, setNewJob] = useState({
    title: '',
    category: 'Software Development',
    location: '',
    salary: '',
    required_skills: '',
    description: '',
    job_type: 'full-time',
    work_mode: 'hybrid',
    required_education: 'any',
    years_of_experience_min: 0,
    application_deadline: ''
  });

  // Headers config for Auth
  useEffect(() => {
    localStorage.setItem('employerJobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('employerApplications', JSON.stringify(applicants));
  }, [applicants]);

  useEffect(() => {
    localStorage.setItem('employerInterviews', JSON.stringify(interviews));
  }, [interviews]);

  // Dynamic Dashboard Stats
  const stats = {
    activeJobs: jobs.filter(a => a.status === 'published').length,
    totalApplicants: applicants.length,
    shortlisted: applicants.filter(a => ['shortlisted', 'Shortlisted'].includes(a.status)).length,
    interviews: interviews.length,
    hired: applicants.filter(a => ['hired', 'Hired'].includes(a.status)).length
  };

  // Job Actions
  const toggleJobStatus = async (id) => {
    const jobToUpdate = jobs.find(j => j.id === id);
    if (!jobToUpdate) return;
    const newStatus = jobToUpdate.status === 'published' ? 'closed' : 'published';
    
    setJobs(jobs.map(j => j.id === id ? { ...j, status: newStatus } : j));
  };

  const deleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job post?')) {
      setJobs(jobs.filter(j => j.id !== id));
    }
  };

  const saveCompanyProfile = async () => {
    setCompanySaving(true);
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...storedUser, companyInfo: { ...storedUser.companyInfo, company_name: companyProfile.name, industry: companyProfile.industry, location: companyProfile.location, website: companyProfile.website } }));
    setEditCompanyMode(false);
    setCompanySaving(false);
  };

  // Create Job Handler
  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const today = new Date().toISOString().slice(0, 10);
      const createdJob = {
        ...newJob,
        id: Date.now(),
        company: companyProfile.name || user?.full_name || 'Employer company',
        locationValue: newJob.location,
        type: newJob.job_type,
        workplace: newJob.work_mode,
        experienceLevel: `${newJob.years_of_experience_min || 0}+ years`,
        education: newJob.required_education,
        sector: newJob.category,
        tags: newJob.required_skills.split(',').map((skill) => skill.trim()).filter(Boolean),
        shortDescription: newJob.description,
        fullDescription: newJob.description,
        deadline: newJob.application_deadline || 'No deadline',
        deadlineDate: newJob.application_deadline || '',
        postedAt: 'Just now',
        postedHoursAgo: 0,
        priorityRank: 1,
        salaryValue: Number.parseInt(String(newJob.salary).replace(/[^0-9]/g, ''), 10) || 0,
        aiMatchScore: null,
        status: 'published',
        created_at: today,
        applicantsCount: 0
      };
      setJobs([createdJob, ...jobs]);
      setPublishMessage('Job published successfully. It is now visible in Find Jobs.');
      window.setTimeout(() => setPublishMessage(''), 4000);
    } catch (error) {
      console.error('Unable to create local job:', error);
    } finally {
      setShowJobModal(false);
      setNewJob({ title: '', category: 'Software Development', location: '', salary: '', required_skills: '', description: '', job_type: 'full-time', work_mode: 'hybrid', required_education: 'any', years_of_experience_min: 0, application_deadline: '' });
    }
  };

  // Candidate Status Update
  const updateCandidateStatus = async (applicantId, newStatus) => {
      const applicant = applicants.find((item) => item.id === applicantId);
      if (!applicant) return;
      setApplicants(applicants.map(a => a.id === applicantId ? { ...a, status: newStatus, applicationStatus: newStatus } : a));
      if (['Shortlisted', 'Rejected'].includes(newStatus)) notifyMockApplication(applicant, newStatus);
    setApplicants(applicants.map(a => a.id === applicantId ? { ...a, status: newStatus } : a));
    if (selectedApplicant && selectedApplicant.id === applicantId) {
      setSelectedApplicant({ ...selectedApplicant, status: newStatus });
    }

  };

  const handleInterviewStatus = (interview, status) => {
    const updated = updateMockInterview(interview.id, { status });
    setInterviews((current) => current.map((item) => item.id === interview.id ? updated : item));
    setApplicants((current) => current.map((item) => item.id === interview.applicationId ? { ...item, interview: updated } : item));
  };

  const handleScheduleInterview = (event) => {
    event.preventDefault();
    if (!selectedApplicant) return;
    const interview = selectedApplicant.interview ? rescheduleMockInterview(selectedApplicant.interview, interviewForm) : scheduleMockInterview(selectedApplicant, interviewForm);
    setApplicants(applicants.map((applicant) => applicant.id === selectedApplicant.id ? { ...applicant, status: 'Interview', interviewId: interview.id, interview } : applicant));
    setInterviews((current) => [...current.filter((item) => item.applicationId !== selectedApplicant.id), interview]);
    setSelectedApplicant(null);
    setShowInterviewModal(false);
    setInterviewForm({ date: '', time: '', type: 'Online', location: '', meetingLink: '', instructions: '' });
  };

  const openReschedule = (interview) => {
    const applicant = applicants.find((item) => item.id === interview.applicationId);
    if (!applicant) return;
    setSelectedApplicant({ ...applicant, interview });
    setInterviewForm({ date: interview.date || '', time: interview.time || '', type: interview.type || 'Online', location: interview.location || '', meetingLink: interview.meetingLink || '', instructions: interview.instructions || '' });
    setShowInterviewModal(true);
  };

  // Safe Filter Applicants
  const filteredApplicants = applicants
    .filter(a => 
      (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (a.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(a => statusFilter === 'all' ? true : (a.status || '').toLowerCase() === statusFilter.toLowerCase());

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-blue-100 bg-blue-50/70 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Employer workspace</p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">Welcome to your Employer Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">Manage your company, publish jobs, and connect with the right candidates.</p>
          </div>
          <button type="button" onClick={() => setShowJobModal(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">
            <FilePlus2 className="h-4 w-4" /> Post New Job
          </button>
        </div>
        {publishMessage && <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{publishMessage}</div>}
        
        {/* Company Banner & Profile Edit */}
        <div className={`p-6 rounded-3xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-bold text-2xl border border-slate-700">
                <Building2 className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                {editCompanyMode ? (
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      value={companyProfile.name} 
                      onChange={(e) => setCompanyProfile({...companyProfile, name: e.target.value})} 
                      className="px-2 py-1 border rounded-lg text-sm font-bold dark:bg-slate-800"
                    />
                    <input 
                      type="text" 
                      value={companyProfile.industry} 
                      onChange={(e) => setCompanyProfile({...companyProfile, industry: e.target.value})} 
                      className="px-2 py-1 border rounded-lg text-xs block dark:bg-slate-800"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold">{companyProfile.name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{companyProfile.industry} • {companyProfile.location}</p>
                  </>
                )}
              </div>
            </div>

            <button 
              onClick={() => editCompanyMode ? saveCompanyProfile() : setEditCompanyMode(true)}
              disabled={companySaving}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-200 transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> {companySaving ? 'Saving...' : editCompanyMode ? 'Save Profile' : 'Edit Company Info'}
            </button>
          </div>
        </div>

        {/* Dynamic Analytics Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
            { label: 'Total Applicants', value: stats.totalApplicants, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
            { label: 'Shortlisted Candidates', value: stats.shortlisted, icon: CheckCircle2, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/40' },
            { label: 'Interviews Scheduled', value: stats.interviews, icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/40' },
            { label: 'Hired Candidates', value: stats.hired, icon: UserCheck, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40' }
          ].map((s, idx) => (
            <div key={idx} className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div>
                <span className="text-xs font-medium text-slate-400 block mb-1">{s.label}</span>
                <span className="text-2xl font-bold">{s.value}</span>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-28">
            <div className="mb-3 border-b border-slate-100 px-3 pb-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Employer workspace</p>
              <p className="mt-1 truncate text-sm font-bold text-slate-900">{companyProfile.name || user?.full_name || 'Your company'}</p>
            </div>
            <nav className="space-y-1">
              {navigationItems.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => {
                  if (id === 'company') navigate('/employee-profile-completion');
                  else if (id === 'post') setShowJobModal(true);
                  else setActiveTab(id);
                }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${activeTab === id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <section className="min-w-0 space-y-8">

        <>
            {/* TAB 1: AI APPLICANTS RANKING TABLE */}
            {['overview', 'applications', 'matching', 'shortlisted', 'hired'].includes(activeTab) && (
              <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="text-lg font-bold">{activeTab === 'overview' ? 'Recent Applications' : activeTab === 'matching' ? 'AI Candidate Matching' : activeTab === 'shortlisted' ? 'Shortlisted Candidates' : activeTab === 'hired' ? 'Hired Candidates' : 'Applications'}</h3>
                
                {/* Search & Filter Header */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search applicants by name or position..."
                      className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs outline-none ${
                        darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`px-4 py-2.5 rounded-2xl border text-xs outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="all">All Statuses</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Applicants Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Candidate</th>
                        <th className="py-3 px-4">Applied Job</th>
                        <th className="py-3 px-4">AI Match Score</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {(activeTab === 'shortlisted' ? filteredApplicants.filter((applicant) => ['shortlisted', 'Shortlisted'].includes(applicant.status)) : activeTab === 'hired' ? filteredApplicants.filter((applicant) => ['hired', 'Hired'].includes(applicant.status)) : filteredApplicants).length > 0 ? (
                        (activeTab === 'shortlisted' ? filteredApplicants.filter((applicant) => ['shortlisted', 'Shortlisted'].includes(applicant.status)) : activeTab === 'hired' ? filteredApplicants.filter((applicant) => ['hired', 'Hired'].includes(applicant.status)) : filteredApplicants).map(applicant => (
                          <tr key={applicant.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                            <td className="py-3.5 px-4 font-semibold">
                              <div>
                                <p className="font-bold">{applicant.name}</p>
                                <span className="text-[10px] text-slate-400">{applicant.email}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500">{applicant.jobTitle}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-fit ${
                                applicant.matchScore >= 90 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                applicant.matchScore >= 75 ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                <Sparkles className="w-3 h-3" /> {applicant.matchScore}% Match
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {applicant.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2">
                              <button 
                                onClick={() => setSelectedApplicant(applicant)}
                                className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => updateCandidateStatus(applicant.id, 'Shortlisted')}
                                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 hover:bg-emerald-100 transition cursor-pointer"
                                title="Shortlist"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => updateCandidateStatus(applicant.id, 'Rejected')}
                                className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 hover:bg-red-100 transition cursor-pointer"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-6 text-slate-400">
                            No applicants found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* TAB 2: MANAGE JOBS */}
            {activeTab === 'jobs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map(job => (
                  <div key={job.id} className={`p-6 rounded-3xl border shadow-sm space-y-3 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-base">{job.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{job.category} • {job.location}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${job.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {job.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>Applicants: <strong>{job.applicantsCount || 0}</strong></span>
                      <span>Posted: <strong>{job.created_at}</strong></span>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button 
                        onClick={() => toggleJobStatus(job.id)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {job.status === 'published' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                        {job.status === 'published' ? 'Close' : 'Publish'}
                      </button>
                      <button 
                        onClick={() => deleteJob(job.id)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-1 hover:bg-red-100 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'interviews' && (
              <div className={`rounded-3xl border p-6 shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="text-lg font-bold">Upcoming Interviews</h3>
                {interviews.length === 0 ? <p className="py-8 text-center text-sm text-slate-400">No interviews scheduled.</p> : <div className="mt-4 space-y-3">{interviews.map((interview) => <div key={interview.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"><div><p className="font-semibold">{interview.jobTitle || interview.job_title}</p><p className="text-xs text-slate-500">{interview.company || interview.candidate_name}</p></div><div className="text-right text-xs text-slate-500"><p>{interview.date || interview.scheduled_at} {interview.time || ''}</p><p className="capitalize">Interview: {interview.status || interview.interview_status}</p><div className="mt-2 flex flex-wrap justify-end gap-2"><button type="button" onClick={() => openReschedule(interview)} className="font-bold text-blue-700">Reschedule</button><button type="button" onClick={() => handleInterviewStatus(interview, 'Completed')} className="font-bold text-emerald-700">Complete</button><button type="button" onClick={() => handleInterviewStatus(interview, 'Cancelled')} className="font-bold text-red-600">Cancel</button></div>{interview.status === 'Completed' && <div className="mt-2 flex justify-end gap-2"><button type="button" onClick={() => updateCandidateStatus(interview.applicationId, 'Hired')} className="font-bold text-emerald-700">Hire</button><button type="button" onClick={() => updateCandidateStatus(interview.applicationId, 'Rejected')} className="font-bold text-red-600">Reject</button></div>}</div></div>)}</div>}
              </div>
            )}

            {!['overview', 'jobs', 'applications', 'matching', 'shortlisted', 'hired', 'interviews'].includes(activeTab) && (
              <div className={`p-10 rounded-3xl border text-center shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="text-lg font-bold">{activeTab === 'applications' ? 'Applications' : activeTab === 'matching' ? 'AI Candidate Matching' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                <p className="mt-2 text-sm text-slate-500">This view will show your real employer data when records are available.</p>
                {activeTab === 'applications' && applicants.length === 0 && <p className="mt-4 text-sm font-semibold text-slate-400">No applications yet.</p>}
                {activeTab === 'interviews' && <p className="mt-4 text-sm font-semibold text-slate-400">No interviews scheduled.</p>}
              </div>
            )}
          </>
          </section>
        </div>

      </div>

      {/* MODAL 1: CANDIDATE PROFILE VIEWER */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setSelectedApplicant(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg">
                {selectedApplicant.name?.charAt(0) || 'A'}
              </div>
              <div>
                <h3 className="font-bold text-lg">{selectedApplicant.name}</h3>
                <p className="text-xs text-slate-400">{selectedApplicant.email}</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center text-xs">
              <span>AI Skill Match Score:</span>
              <span className="font-extrabold text-blue-600 text-sm">{selectedApplicant.matchScore}%</span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Skills Extracted</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedApplicant.skills?.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <a 
                href={selectedApplicant.resumeUrl || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download CV
              </a>
              <button 
                onClick={() => { if (selectedApplicant.status === 'Shortlisted') setShowInterviewModal(true); }}
                disabled={selectedApplicant.status !== 'Shortlisted'}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-blue-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Calendar className="w-4 h-4" /> Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {showInterviewModal && selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <form onSubmit={handleScheduleInterview} className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Interview invitation</p><h3 className="mt-1 text-xl font-black text-slate-900">Schedule Interview</h3><p className="mt-1 text-sm text-slate-500">{selectedApplicant.jobTitle} · {selectedApplicant.name}</p></div><button type="button" onClick={() => setShowInterviewModal(false)} className="text-slate-400"><X className="h-5 w-5" /></button></div>
            <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-slate-600">Date<input required type="date" value={interviewForm.date} onChange={(event) => setInterviewForm({ ...interviewForm, date: event.target.value })} className="mt-1 min-h-10 w-full rounded-xl border border-slate-200 px-3" /></label><label className="text-xs font-bold text-slate-600">Time<input required type="time" value={interviewForm.time} onChange={(event) => setInterviewForm({ ...interviewForm, time: event.target.value })} className="mt-1 min-h-10 w-full rounded-xl border border-slate-200 px-3" /></label></div>
            <label className="block text-xs font-bold text-slate-600">Interview type<select value={interviewForm.type} onChange={(event) => setInterviewForm({ ...interviewForm, type: event.target.value })} className="mt-1 min-h-10 w-full rounded-xl border border-slate-200 px-3"><option>Online</option><option>In-person</option><option>Phone</option></select></label>
            {interviewForm.type === 'Online' && <label className="block text-xs font-bold text-slate-600">Meeting link<input required value={interviewForm.meetingLink} onChange={(event) => setInterviewForm({ ...interviewForm, meetingLink: event.target.value })} placeholder="https://" className="mt-1 min-h-10 w-full rounded-xl border border-slate-200 px-3" /></label>}
            {interviewForm.type === 'In-person' && <label className="block text-xs font-bold text-slate-600">Location<input required value={interviewForm.location} onChange={(event) => setInterviewForm({ ...interviewForm, location: event.target.value })} className="mt-1 min-h-10 w-full rounded-xl border border-slate-200 px-3" /></label>}
            <label className="block text-xs font-bold text-slate-600">Instructions<textarea value={interviewForm.instructions} onChange={(event) => setInterviewForm({ ...interviewForm, instructions: event.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" /></label>
            <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowInterviewModal(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Cancel</button><button type="submit" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">Schedule Interview</button></div>
          </form>
        </div>
      )}

      {/* MODAL 2: CREATE JOB POST */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setShowJobModal(false)} className="absolute top-4 right-4 text-slate-400 cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg mb-4">Post a New Job Opportunity</h3>

            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Job Title</label>
                <input 
                  type="text" 
                  required
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="e.g. Senior React Developer" 
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Required Skills (Comma separated for AI Engine)</label>
                <input 
                  type="text" 
                  required
                  value={newJob.required_skills}
                  onChange={(e) => setNewJob({ ...newJob, required_skills: e.target.value })}
                  placeholder="React, Node.js, Express, MySQL" 
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Location</label>
                  <input 
                    type="text" 
                    required
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    placeholder="Addis Ababa / Remote" 
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Salary Range</label>
                  <input 
                    type="text" 
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    placeholder="Negotiable" 
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Employment Type</label>
                  <select value={newJob.job_type} onChange={(e) => setNewJob({ ...newJob, job_type: e.target.value })} className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none">
                    <option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option><option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Work Mode</label>
                  <select value={newJob.work_mode} onChange={(e) => setNewJob({ ...newJob, work_mode: e.target.value })} className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none">
                    <option value="on-site">On-site</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Education</label>
                  <select value={newJob.required_education} onChange={(e) => setNewJob({ ...newJob, required_education: e.target.value })} className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none">
                    <option value="any">Any</option><option value="high-school">High school</option><option value="associate">Associate</option><option value="bachelor">Bachelor</option><option value="master">Master</option><option value="phd">PhD</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Minimum Experience (years)</label>
                  <input type="number" min="0" value={newJob.years_of_experience_min} onChange={(e) => setNewJob({ ...newJob, years_of_experience_min: e.target.value })} className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none" />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Application Deadline</label>
                <input type="date" value={newJob.application_deadline} onChange={(e) => setNewJob({ ...newJob, application_deadline: e.target.value })} className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none" />
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <textarea 
                  rows="3" 
                  required
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="Describe responsibilities and requirements..." 
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition mt-2 cursor-pointer"
              >
                Publish Job Listing
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployerDashboard;

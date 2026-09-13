import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { beginApplication } from '../utils/applicationFlow';
import { 
  Sparkles, CheckCircle2, AlertCircle, Briefcase, 
  MapPin, Building2, ArrowRight, ArrowLeft, ExternalLink, 
  TrendingUp, Award, Search, Filter, RefreshCw, Check
} from 'lucide-react';

const MatchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const sourceJob = location.state?.sourceJob;
  const [filterScore, setFilterScore] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);

  // 1. Fetch User & Extracted Resume Data dynamically from LocalStorage
  const [userCvData, setUserCvData] = useState(() => {
    const savedCv = localStorage.getItem('extracted_cv');
    return savedCv ? JSON.parse(savedCv) : {
      name: 'Kaleab Tadesse',
      title: 'Full-Stack Developer',
      detectedSkills: ['React', 'Node.js', 'Tailwind CSS', 'JavaScript', 'PostgreSQL', 'Git']
    };
  });

  // Mock AI Matched Jobs Data
  const [matchedJobs, setMatchedJobs] = useState([
    {
      id: 'job-1',
      title: 'Senior Frontend Engineer',
      company: 'Gebeya Inc.',
      location: 'Addis Ababa, Ethiopia (Hybrid)',
      type: 'Full-time',
      salary: '$1,500 - $2,500 / month',
      matchScore: 94,
      matchingSkills: ['React', 'JavaScript', 'Tailwind CSS', 'Git'],
      missingSkills: ['TypeScript', 'Next.js'],
      aiInsight: 'Strong alignment with core frontend stack. Adding TypeScript will make you a 100% fit.',
      postedDate: '2 days ago'
    },
    {
      id: 'job-2',
      title: 'Full Stack Node.js & React Developer',
      company: 'EagleLion System Solutions',
      location: 'Addis Ababa, Ethiopia (On-site)',
      type: 'Full-time',
      salary: '45,000 - 65,000 ETB / month',
      matchScore: 88,
      matchingSkills: ['React', 'Node.js', 'PostgreSQL', 'JavaScript'],
      missingSkills: ['Docker', 'Redis'],
      aiInsight: 'Great experience match for backend API design and React component structuring.',
      postedDate: 'Just now'
    },
    {
      id: 'job-3',
      title: 'Backend Node.js Architect',
      company: 'Sunpay Solutions',
      location: 'Remote',
      type: 'Contract',
      salary: '$30 - $45 / hour',
      matchScore: 72,
      matchingSkills: ['Node.js', 'PostgreSQL', 'Git'],
      missingSkills: ['Microservices', 'Kubernetes', 'AWS'],
      aiInsight: 'Good backend foundation, but requires additional DevOps and cloud architecture skills.',
      postedDate: '5 days ago'
    }
  ]);

  // Handle Back Navigation safely
  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1); // Go back to the previous page dynamically
    } else {
      navigate('/seeker-dashboard'); // Fallback route
    }
  };

  const handleReAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1200);
  };

  const handleApply = (jobId, jobTitle) => {
    const job = matchedJobs.find((item) => item.id === jobId);
    beginApplication(jobId, job, navigate, { isAuthenticated, role: user?.role, sourcePage: location.pathname, returnPath: location.pathname });
    if (!appliedJobs.includes(jobId)) setAppliedJobs([...appliedJobs, jobId]);
  };

  // Safe Search and Filter Logic
  const filteredJobs = matchedJobs.filter(job => {
    const matchesSearch = (job.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (job.company || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterScore === 'high') return matchesSearch && job.matchScore >= 85;
    if (filterScore === 'medium') return matchesSearch && job.matchScore < 85;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-100/80 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* 1. Header Navigation & Back Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <button 
              onClick={handleGoBack}
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm transition mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              {location.pathname === '/match-score-details' ? 'Match Score Details' : 'STEP 04 · Job Matches / Recommendations'} 
              <span className="p-1 rounded-lg bg-blue-100 text-blue-600 text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Powered
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {sourceJob ? `Matching your CV against ${sourceJob.title} at ${sourceJob.companyName || sourceJob.company}. ` : ""}
              Matched against extracted skills from your CV: <strong className="text-slate-800">{userCvData.detectedSkills.join(', ')}</strong>
            </p>
          </div>

          <button 
            onClick={handleReAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-2xl shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Re-analyzing...' : 'Re-Run AI Match'}</span>
          </button>
        </div>

        {/* 2. Top Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <p className="text-xs font-medium text-slate-300">Highest Match Score</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-white">94%</span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Excellent Fit
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Senior Frontend Engineer at Gebeya</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Total Compatible Jobs</p>
            <span className="text-3xl font-extrabold text-slate-900 mt-2 block">{matchedJobs.length}</span>
            <p className="text-[11px] text-blue-600 font-medium mt-1">Found in past 24 hours</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Recommended Next Skill</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-xl">
                TypeScript
              </span>
              <span className="text-[11px] text-slate-500">+12% Match Boost</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Requested in 2 out of 3 top matches</p>
          </div>
        </div>

        {/* 3. Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by job title or company..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filter Match:
            </span>
            <button 
              onClick={() => setFilterScore('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${filterScore === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              All ({matchedJobs.length})
            </button>
            <button 
              onClick={() => setFilterScore('high')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${filterScore === 'high' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'}`}
            >
              High Fit (85%+)
            </button>
            <button 
              onClick={() => setFilterScore('medium')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${filterScore === 'medium' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'}`}
            >
              Moderate Fit (&lt;85%)
            </button>
          </div>
        </div>

        {/* 4. Job List */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No Matched Jobs Found</h3>
              <p className="text-xs text-slate-400 mt-1">Try resetting your filter or searching for another keyword.</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isApplied = appliedJobs.includes(job.id);
              return (
                <div 
                  key={job.id} 
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition group relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-2">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="font-semibold text-slate-700">{job.company}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400"/> {job.location}</span>
                          <span>•</span>
                          <span className="font-medium text-slate-600">{job.salary}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-center bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/60">
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match Compatibility</p>
                        <p className={`text-xl font-extrabold ${job.matchScore >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {job.matchScore}%
                        </p>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                        job.matchScore >= 85 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        <Award className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 my-4">
                    <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                      <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Matching Skills ({job.matchingSkills.length})</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {job.matchingSkills.map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-800 text-[11px] font-semibold rounded-lg shadow-2xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100">
                      <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Skill Gap ({job.missingSkills.length})</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {job.missingSkills.map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-white border border-amber-200 text-amber-800 text-[11px] font-semibold rounded-lg shadow-2xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/50 flex items-center gap-2 w-full md:w-auto">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      <span><strong>AI Feedback:</strong> {job.aiInsight}</span>
                    </p>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
                      <button 
                        onClick={() => navigate(`/job-details/${job.id}`)}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        onClick={() => navigate(`/interviews/${job.id}`, { state: { job } })}
                        className="px-4 py-2 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <span>Interview</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button 
                        onClick={() => handleApply(job.id, job.title)}
                        disabled={isApplied}
                        className={`px-5 py-2 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
                          isApplied 
                            ? 'bg-emerald-600 text-white cursor-default' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Applied
                          </>
                        ) : (
                          <>
                            <span>Apply Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default MatchResults;
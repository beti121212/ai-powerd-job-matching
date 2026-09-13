import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getPendingApplication } from '../utils/applicationFlow';
import { 
  User, Mail, Phone, GraduationCap, 
  Briefcase, Plus, Trash2, Award, Languages, Link as LinkIcon, 
  Target, CheckCircle2, Sparkles, X, Globe, Save
} from 'lucide-react';

const Profile = ({ userData = {}, cvFile = null, onContinue, onNavigateNext }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_BACKEND_URL || '/api';
  const excludedSkills = new Set(['javascript', 'python', 'java', 'sql', 'networking', 'communication']);

  // Safe fallback to load stored user from localStorage
  const getInitialUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  };
  const savedUser = getInitialUser();
  const pendingCv = location.state?.updatedProfile || (() => {
    try { return JSON.parse(localStorage.getItem('pending_cv_data') || 'null'); } catch { return null; }
  })();
  const pendingSkills = Array.isArray(pendingCv?.skills) ? pendingCv.skills.map((skill) => typeof skill === 'string' ? skill : skill.skill_name).filter(Boolean).filter((skill) => !excludedSkills.has(skill.trim().toLowerCase())) : [];
  const pendingEducation = Array.isArray(pendingCv?.education) ? pendingCv.education.map((item, index) => ({
    id: item.id || `cv-education-${index}`,
    university: item.school_name || item.institution || '',
    degree: item.degree || '',
    department: item.field_of_study || '',
    graduationYear: item.graduationYear || (item.end_date ? String(item.end_date).slice(0, 4) : ''),
  })) : [];
  const pendingExperience = Array.isArray(pendingCv?.experience) ? pendingCv.experience.map((item, index) => ({
    id: item.id || `cv-experience-${index}`,
    company: item.company_name || item.company || '',
    position: item.job_title || item.role || '',
    startDate: item.start_date ? String(item.start_date).slice(0, 7) : '',
    endDate: item.end_date ? String(item.end_date).slice(0, 7) : (item.duration || ''),
    responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities.join('\n') : item.description || '',
  })) : [];
  const pendingName = pendingCv?.fullName || pendingCv?.full_name || '';
  const pendingNameParts = pendingName.trim().split(/\s+/).filter(Boolean);
  const pendingLocation = pendingCv?.location || '';
  const pendingLocationParts = pendingLocation.split(',').map((part) => part.trim()).filter(Boolean);

  // Dynamic Lists (Education, Experience, Skills, Languages)
  const [educationList, setEducationList] = useState(pendingEducation);

  const [experienceList, setExperienceList] = useState(pendingExperience);

  const [skills, setSkills] = useState(pendingSkills);
  const [newSkill, setNewSkill] = useState('');

  const [languages, setLanguages] = useState(['English', 'አማርኛ']);
  const [newLang, setNewLang] = useState('');

  // Personal Profile Data State
  const [profileData, setProfileData] = useState({
    firstName: userData?.firstName || pendingNameParts[0] || savedUser?.full_name?.split(' ')[0] || savedUser?.firstName || '',
    lastName: userData?.lastName || pendingNameParts.slice(1).join(' ') || savedUser?.full_name?.split(' ').slice(1).join(' ') || savedUser?.lastName || '',
    email: userData?.email || pendingCv?.email || savedUser?.email || '',
    phone: pendingCv?.phone || savedUser?.phone || '',
    dob: '',
    gender: '',
    country: pendingLocationParts[1] || '',
    city: pendingLocationParts[0] || '',
    github: '',
    linkedin: '',
    portfolio: '',
    jobCategory: '',
    preferredJob: userData?.preferredJob || '',
    employmentType: '',
    salaryExpectation: userData?.salaryExpectation || '',
    preferredCity: '',
    preferredWorkSetup: ''
  });

  const completionPercentage = 85;

  // Handlers
  const handleAddEducation = () => {
    setEducationList([
      ...educationList,
      { id: Date.now(), university: '', degree: '', department: '', graduationYear: '' }
    ]);
  };

  const handleEducationChange = (id, field, value) => {
    setEducationList(educationList.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveEducation = (id) => {
    setEducationList(educationList.filter((item) => item.id !== id));
  };

  const handleAddExperience = () => {
    setExperienceList([
      ...experienceList,
      { id: Date.now(), company: '', position: '', startDate: '', endDate: '', responsibilities: '' }
    ]);
  };

  const handleExperienceChange = (id, field, value) => {
    setExperienceList(experienceList.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveExperience = (id) => {
    setExperienceList(experienceList.filter((item) => item.id !== id));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleAddLanguage = () => {
    if (newLang.trim() && !languages.includes(newLang.trim())) {
      setLanguages([...languages, newLang.trim()]);
      setNewLang('');
    }
  };

  const handleRemoveLanguage = (langToRemove) => {
    setLanguages(languages.filter((lang) => lang !== langToRemove));
  };

  // 1. መረጃውን ለማስቀመጥ እና ወደ Dashboard ለመመለስ የተስተካከለ Handler
  const handleSaveProfile = async () => {
    const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
    const payload = {
      personal_info: {
        full_name: fullName,
        email: profileData.email,
        phone: profileData.phone,
        headline: pendingCv?.headline || pendingCv?.professional_title || profileData.preferredJob,
        bio: profileData.bio || '',
        location: [profileData.city, profileData.country].filter(Boolean).join(', '),
        city: profileData.city,
        country: profileData.country,
      },
      skills,
      education: educationList.map((item) => ({
        school_name: item.university,
        degree: item.degree,
        field_of_study: item.department,
        end_date: item.graduationYear ? `${item.graduationYear}-01-01` : null,
      })),
      experience: experienceList.map((item) => ({
        company_name: item.company,
        job_title: item.position,
        start_date: item.startDate ? `${item.startDate}-01` : null,
        end_date: item.endDate && !/present|current/i.test(item.endDate) ? `${item.endDate}-01` : null,
        is_current: /present|current/i.test(item.endDate || ''),
        description: item.responsibilities,
      })),
    };

    const response = await fetch(`${API_URL.replace(/\/$/, '')}/seeker/profile/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return;

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('userProfile', JSON.stringify({ ...profileData, education: educationList, experience: experienceList, skills, languages }));
    localStorage.setItem('user', JSON.stringify({ ...currentUser, full_name: fullName, email: profileData.email, phone: profileData.phone, onboardingProfileCompleted: true }));
    localStorage.removeItem('pending_cv_data');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    const continueHandler = onContinue || onNavigateNext;
    if (continueHandler) {
      continueHandler({ ...profileData, fullName, education: educationList, experience: experienceList, skills, languages });
      return;
    }

    // Return applicants to the original job so the updated Apply state is visible.
    const pending = getPendingApplication();
    if (pending?.jobId) {
      navigate(pending.returnPath || `/job-details/${encodeURIComponent(pending.jobId)}`, {
        state: { job: pending.selectedJob || undefined },
        replace: true,
      });
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto p-4 pb-10">
      
      <div className="flex items-center justify-between">
        {/* Save Profile Button */}
        <button
          type="button"
          onClick={handleSaveProfile}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Profile
        </button>
      </div>

      {/* Profile Progress Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" /> Profile Completion
          </span>
          <span className="text-blue-600 font-bold">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-linear-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Header Badge */}
      <div className="text-center mb-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-500/20 shadow-sm">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">User Profile Setup</h2>
        <p className="text-xs text-slate-500">
          Complete your information to get AI-matched job recommendations.
        </p>
      </div>

      {/* Personal Information */}
      <div className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2 border-slate-200">
          <User className="w-4 h-4 text-blue-600" /> Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 mb-1">First Name</label>
            <input 
              type="text" 
              value={profileData.firstName} 
              onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1">Last Name</label>
            <input 
              type="text" 
              value={profileData.lastName} 
              onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1">Email</label>
            <input 
              type="email" 
              value={profileData.email} 
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1">Phone Number</label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3" />
              <input 
                type="text" 
                value={profileData.phone} 
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 mb-1">Date of Birth <span className="italic">(Optional)</span></label>
            <input 
              type="date" 
              value={profileData.dob} 
              onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1">Gender <span className="italic">(Optional)</span></label>
            <select 
              value={profileData.gender} 
              onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-600 mb-1">Country</label>
              <input 
                type="text" 
                value={profileData.country} 
                onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">City</label>
              <input 
                type="text" 
                value={profileData.city} 
                onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Education Section */}
      <div className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b pb-2 border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" /> Education
          </h3>
          <button 
            type="button" 
            onClick={handleAddEducation}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Another Education
          </button>
        </div>

        {educationList.map((edu) => (
          <div key={edu.id} className="p-3.5 bg-white rounded-xl border border-slate-200 relative space-y-3">
            {educationList.length > 1 && (
              <button 
                type="button" 
                onClick={() => handleRemoveEducation(edu.id)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <input 
                type="text" 
                placeholder="University" 
                value={edu.university} 
                onChange={(e) => handleEducationChange(edu.id, 'university', e.target.value)}
                className="p-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500" 
              />
              <input 
                type="text" 
                placeholder="Degree" 
                value={edu.degree} 
                onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                className="p-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500" 
              />
              <input 
                type="text" 
                placeholder="Department" 
                value={edu.department} 
                onChange={(e) => handleEducationChange(edu.id, 'department', e.target.value)}
                className="p-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500" 
              />
              <input 
                type="text" 
                placeholder="Graduation Year" 
                value={edu.graduationYear} 
                onChange={(e) => handleEducationChange(edu.id, 'graduationYear', e.target.value)}
                className="p-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500" 
              />
            </div>
          </div>
        ))}
      </div>

      {/* Experience Section */}
      <div className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b pb-2 border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-amber-600" /> Experience
          </h3>
          <button 
            type="button" 
            onClick={handleAddExperience}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Experience
          </button>
        </div>

        {experienceList.map((exp) => (
          <div key={exp.id} className="p-3.5 bg-white rounded-xl border border-slate-200 relative space-y-3">
            {experienceList.length > 1 && (
              <button 
                type="button" 
                onClick={() => handleRemoveExperience(exp.id)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <input 
                type="text" 
                placeholder="Company" 
                value={exp.company} 
                onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                className="p-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500" 
              />
              <input 
                type="text" 
                placeholder="Position" 
                value={exp.position} 
                onChange={(e) => handleExperienceChange(exp.id, 'position', e.target.value)}
                className="p-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500" 
              />
              <input 
                type="month" 
                value={exp.startDate} 
                onChange={(e) => handleExperienceChange(exp.id, 'startDate', e.target.value)}
                className="p-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500" 
              />
              <input 
                type="text" 
                placeholder="End Date (or Present)" 
                value={exp.endDate} 
                onChange={(e) => handleExperienceChange(exp.id, 'endDate', e.target.value)}
                className="p-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500" 
              />
            </div>
            <textarea 
              rows={2} 
              placeholder="Responsibilities..." 
              value={exp.responsibilities} 
              onChange={(e) => handleExperienceChange(exp.id, 'responsibilities', e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-500"
            />
          </div>
        ))}
      </div>

      {/* Skills Section */}
      <div className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2 border-slate-200">
          <Award className="w-4 h-4 text-emerald-600" /> Skills (AI Extracted & Custom)
        </h3>

        <div className="flex flex-wrap gap-2 py-1">
          {skills.map((skill) => (
            <span key={skill} className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center border border-blue-200">
              {skill}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Add a new skill" 
            value={newSkill} 
            onChange={(e) => setNewSkill(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 flex-1 bg-white outline-none focus:border-blue-500"
          />
          <button 
            type="button" 
            onClick={handleAddSkill} 
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      {/* Languages Section */}
      <div className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2 border-slate-200">
          <Languages className="w-4 h-4 text-purple-600" /> Languages
        </h3>

        <div className="flex flex-wrap gap-2 py-1">
          {languages.map((lang) => (
            <span key={lang} className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold flex items-center border border-purple-200">
              {lang}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Add language (e.g. Afaan Oromo, English)" 
            value={newLang} 
            onChange={(e) => setNewLang(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 flex-1 bg-white outline-none focus:border-purple-500"
          />
          <button 
            type="button" 
            onClick={handleAddLanguage} 
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      {/* Portfolio Links */}
      <div className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2 border-slate-200">
          <LinkIcon className="w-4 h-4 text-sky-600" /> Portfolio & Links
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="relative flex items-center">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3" />
            <input 
              type="url" 
              placeholder="GitHub Profile" 
              value={profileData.github} 
              onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="relative flex items-center">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3" />
            <input 
              type="url" 
              placeholder="LinkedIn Profile" 
              value={profileData.linkedin} 
              onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="relative flex items-center">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3" />
            <input 
              type="url" 
              placeholder="Portfolio Website" 
              value={profileData.portfolio} 
              onChange={(e) => setProfileData({ ...profileData, portfolio: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Job Preferences */}
      <div className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2 border-slate-200">
          <Target className="w-4 h-4 text-rose-600" /> Job Preferences
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 mb-1">Desired Position</label>
            <input 
              type="text" 
              value={profileData.preferredJob} 
              onChange={(e) => setProfileData({ ...profileData, preferredJob: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1">Job Category</label>
            <input 
              type="text" 
              value={profileData.jobCategory} 
              onChange={(e) => setProfileData({ ...profileData, jobCategory: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1">Employment Type</label>
            <select 
              value={profileData.employmentType} 
              onChange={(e) => setProfileData({ ...profileData, employmentType: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
            >
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 mb-1">Salary Expectation</label>
            <input 
              type="text" 
              value={profileData.salaryExpectation} 
              onChange={(e) => setProfileData({ ...profileData, salaryExpectation: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1">Preferred Location (City)</label>
            <input 
              type="text" 
              value={profileData.preferredCity} 
              onChange={(e) => setProfileData({ ...profileData, preferredCity: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1">Work Setup</label>
            <select 
              value={profileData.preferredWorkSetup} 
              onChange={(e) => setProfileData({ ...profileData, preferredWorkSetup: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={handleSaveProfile}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
        >
          Continue <span aria-hidden="true">→</span>
        </button>
      </div>

    </div>
  );
};

export default Profile;
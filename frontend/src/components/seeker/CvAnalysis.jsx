import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, RefreshCw, FileText, CheckCircle2, Pencil, Save, Briefcase, GraduationCap, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const AiCvAnalysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [analyzing, setAnalyzing] = useState(!location.state?.analysis);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [analysis, setAnalysis] = useState(location.state?.analysis || null);
  const [skills, setSkills] = useState(location.state?.analysis?.skills || []);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const getLabeledName = (text) => {
    const source = String(text || '');
    return {
      firstName: source.match(/\b(?:first\s*name|given\s*name)\s*[:\-]\s*([A-Za-z][A-Za-z'\-]*(?:\s+[A-Za-z][A-Za-z'\-]*){0,3}?)(?=[,;\s]+(?:last\s*name|surname|family\s*name|email|phone|mobile)\b|\n|$)/i)?.[1]?.trim() || '',
      lastName: source.match(/\b(?:last\s*name|surname|family\s*name)\s*[:\-]\s*([A-Za-z][A-Za-z'\-]*(?:\s+[A-Za-z][A-Za-z'\-]*){0,3}?)(?=[,;\s]+(?:first\s*name|given\s*name|email|phone|mobile)\b|\n|$)/i)?.[1]?.trim() || '',
    };
  };

  useEffect(() => {
    if (location.state?.analysis) {
      setIsSuccess(true);
      setFileName(location.state.analysis.file_name || 'Uploaded CV');
      return;
    }
    loadAnalysis();
  }, [location.state?.analysis]);

  const loadAnalysis = async () => {
    setAnalyzing(true);
    setError('');
    setIsSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const cvId = localStorage.getItem('lastAnalyzedCvId');
      if (!token || !cvId) throw new Error('No analyzed CV found. Please upload a CV first.');
      const response = await fetch(`/api/cv/${cvId}/analysis`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to load CV analysis.');
      setAnalysis(result.data);
      setSkills(result.data.skills || []);
      setFileName(result.data.file_name || 'Uploaded CV');
      setIsSuccess(true);
      setAnalyzing(false);
    } catch (err) {
      setError(err.message || 'CV analysis failed. Please upload a valid resume and try again.');
      setAnalyzing(false);
    }
  };

  const continueToProfile = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setSaving(true);
    try {
      const labeledName = getLabeledName(analysis?.rawText);
      const extractedName = [labeledName.firstName, labeledName.lastName].filter(Boolean).join(' ') || analysis?.fullName || analysis?.full_name || analysis?.name || [analysis?.firstName, analysis?.lastName].filter(Boolean).join(' ');
      const nameParts = String(extractedName || '').trim().split(/\s+/).filter(Boolean);
      const pendingData = {
        ...analysis,
        skills,
        fullName: extractedName || '',
        full_name: extractedName || '',
        firstName: labeledName.firstName || analysis?.firstName || nameParts[0] || '',
        lastName: labeledName.lastName || analysis?.lastName || nameParts.slice(1).join(' '),
      };
      localStorage.setItem('pending_cv_data', JSON.stringify(pendingData));
      localStorage.setItem('candidateProfile', JSON.stringify(pendingData));
      localStorage.setItem('cvUploaded', 'true');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        onboardingCvUploaded: true,
        cvSkipped: false,
        cvFileName: pendingData.file_name || currentUser.cvFileName,
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      navigate('/seeker/personal-info', { replace: true, state: { updatedProfile: pendingData, profile: pendingData, fromCvUpload: true } });
    } catch (saveError) { setError(saveError.message || 'Unable to continue to your profile.'); } finally { setSaving(false); }
  };

  const updateField = (field, value) => setAnalysis((current) => {
    const next = { ...current, [field]: value };
    if (field === 'firstName' || field === 'lastName') {
      next.fullName = [field === 'firstName' ? value : current.firstName, field === 'lastName' ? value : current.lastName].filter(Boolean).join(' ').trim();
      next.full_name = next.fullName;
    }
    if (field === 'fullName') next.full_name = value;
    if (field === 'headline') next.professional_title = value;
    return next;
  });
  const updateEntry = (section, index, field, value) => setAnalysis((current) => ({ ...current, [section]: (current[section] || []).map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
  const addSkill = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const value = event.currentTarget.value.trim().toLowerCase();
    if (value && !skills.some((item) => (item.skill_name || item).toLowerCase() === value)) setSkills((current) => [...current, { skill_name: value, skill_category: 'technical', proficiency_level: 'intermediate' }]);
    event.currentTarget.value = '';
  };

  const handleRetry = () => {
    navigate('/upload-cv', { state: { replaceMode: true } });
  };

  const handleReplace = () => {
    navigate('/upload-cv', { state: { replaceMode: true } });
  };

  const displayName = analysis?.fullName || analysis?.full_name || 'Candidate profile';
  const headline = analysis?.headline || analysis?.professional_title;
  const firstEducation = analysis?.education?.[0];
  const firstExperience = analysis?.experience?.[0];
  const matchScore = analysis?.matchScore ?? analysis?.keywordMatch;
  const skillLabel = (skill) => typeof skill === 'string' ? skill : skill.skill_name;
  const visibleSkills = skills.filter((skill) => skillLabel(skill));

  return (
    <div className="min-h-screen w-full bg-slate-100/70 flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-4xl lg:max-w-5xl my-auto overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl transition-all sm:p-8 lg:p-10">
        {/* 1. Analyzing State */}
        {analyzing && (
          <div className="flex flex-col items-center py-8 space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <h2 className="text-xl font-bold text-slate-900">AI CV Analysis in Progress...</h2>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              We are extracting essential information from your CV.
            </p>
            {fileName && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600 text-[11px] font-medium">
                <FileText className="w-3.5 h-3.5" />
                <span>{fileName}</span>
              </div>
            )}
          </div>
        )}

        {/* 3. Success State */}
        {!analyzing && isSuccess && analysis && (
          <div className="text-left">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-6 w-6" /></div>
              <div><h1 className="text-2xl font-extrabold text-slate-950">Your CV was analyzed successfully</h1><p className="mt-1 text-sm text-slate-500">Review your extracted profile details below. You can edit any field before confirming.</p></div>
            </div>
            <div className="grid grid-cols-1 gap-8 pt-8 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-7">
                <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6">
                  <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">Candidate profile</span><button type="button" onClick={() => setEditing((value) => !value)} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">{editing ? <Save className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}{editing ? 'Done' : 'Edit fields'}</button></div>
                  {editing ? <div className="space-y-3">{[['firstName', 'First name'], ['lastName', 'Last name'], ['email', 'Email'], ['phone', 'Phone'], ['location', 'Location'], ['headline', 'Headline']].map(([field, label]) => <label key={field} className="block text-xs font-bold text-slate-600">{label}<input value={analysis[field] || ''} onChange={(event) => updateField(field, event.target.value)} className="mt-1 w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200" /></label>)}<label className="block text-xs font-bold text-slate-600">Add skill<input onKeyDown={addSkill} placeholder="Type a skill and press Enter" className="mt-1 w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200" /></label><div className="flex flex-wrap gap-2">{visibleSkills.map((skill, index) => <button type="button" key={`${skillLabel(skill)}-${index}`} onClick={() => setSkills((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg border border-blue-200 bg-white px-3 py-1 text-xs font-bold text-blue-700">{skillLabel(skill)} x</button>)}</div></div> : <><h2 className="text-2xl font-extrabold text-slate-900">{displayName}</h2><div className="grid gap-3 pt-2 text-sm text-slate-600 sm:grid-cols-2">{analysis.email && <div className="flex min-w-0 items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-slate-400" /><span className="truncate">{analysis.email}</span></div>}{analysis.phone && <div className="flex items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-slate-400" /><span>{analysis.phone}</span></div>}{analysis.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-slate-400" /><span>{analysis.location}</span></div>}</div>{headline && <p className="border-t border-slate-200 pt-3 text-sm font-semibold text-slate-700">{headline}</p>}</>}
                </section>

                <div className="space-y-4">{firstEducation && (firstEducation.degree || firstEducation.school_name || firstEducation.institution) && <section className="rounded-xl border border-slate-200/80 bg-white p-5"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><GraduationCap className="h-4 w-4 text-blue-600" />Education</div><p className="mt-2 text-sm font-bold text-slate-800">{[firstEducation.degree, firstEducation.field_of_study].filter(Boolean).join(' in ')}</p><p className="mt-1 text-xs text-slate-500">{[firstEducation.school_name || firstEducation.institution, firstEducation.graduationYear || firstEducation.end_date].filter(Boolean).join(' • ')}</p></section>}{firstExperience && (firstExperience.job_title || firstExperience.role || firstExperience.company_name || firstExperience.company) && <section className="rounded-xl border border-slate-200/80 bg-white p-5"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><Briefcase className="h-4 w-4 text-emerald-600" />Experience</div><p className="mt-2 text-sm font-bold text-slate-800">{firstExperience.job_title || firstExperience.role}</p><p className="mt-1 text-xs text-slate-500">{[firstExperience.company_name || firstExperience.company, firstExperience.duration].filter(Boolean).join(' • ')}</p>{(firstExperience.responsibilities?.length || firstExperience.description) && <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-600">{(firstExperience.responsibilities?.length ? firstExperience.responsibilities : [firstExperience.description]).slice(0, 3).map((item, index) => <li key={index}>• {item}</li>)}</ul>}</section>}</div>

                <section><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Verified skills</span><div className="flex flex-wrap gap-2">{visibleSkills.length ? visibleSkills.map((skill, index) => <span key={`${skillLabel(skill)}-${index}`} className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold capitalize text-slate-800">{skillLabel(skill)}</span>) : <span className="text-sm text-slate-500">No verified skills detected yet.</span>}</div></section>
              </div>

              <div className="flex flex-col justify-between space-y-6 lg:col-span-5">
                <section className="space-y-4 rounded-2xl border border-blue-200/80 bg-linear-to-br from-blue-50 via-indigo-50/40 to-emerald-50/40 p-6"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-blue-700">AI job market compatibility</span><span className="rounded-lg bg-blue-100 p-1.5 text-blue-700"><Sparkles className="h-4 w-4" /></span></div><div className="flex items-baseline gap-2"><span className="text-5xl font-extrabold tracking-tight text-blue-600">{matchScore ?? '--'}{matchScore !== undefined && <span>%</span>}</span><span className="text-xs font-semibold text-slate-500">compatibility score</span></div><p className="text-xs leading-relaxed text-slate-600">Calculated from normalized candidate skills against published job requirements.</p><div className="space-y-2 border-t border-blue-200/60 pt-3 text-xs font-medium text-slate-700"><div className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" /><span>{visibleSkills.length ? `${visibleSkills.length} verified skills available for matching.` : 'Add skills to improve matching precision.'}</span></div><div className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" /><span>{firstExperience ? 'Professional experience is included in the profile.' : 'Education and skills can still support entry-level matches.'}</span></div></div></section>
                <div className="space-y-3 pt-2"><button type="button" onClick={continueToProfile} disabled={saving} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-75">{saving ? <><Loader2 size={18} className="animate-spin" /> Preparing profile...</> : <><span>Save and Continue</span><ArrowRight className="h-5 w-5" /></>}</button><div className="grid grid-cols-2 gap-3 pt-1"><button type="button" onClick={() => setEditing(true)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50">Edit fields</button><button type="button" onClick={handleReplace} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"><RefreshCw className="h-3.5 w-3.5" />Replace CV</button></div></div>
              </div>
            </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AiCvAnalysis;
import { useEffect, useState } from 'react';
import { BadgeCheck, Code2, Download, Plus, Sparkles, X } from 'lucide-react';
import skillsApi, { defaultSkills } from '../../services/skillsApiService';

const filters = [['all', 'All Skills (18)'], ['frontend', 'Frontend (6)'], ['backend', 'Backend & Cloud (5)'], ['ai', 'AI & Machine Learning (4)'], ['databases', 'Databases (3)'], ['soft', 'Soft Skills & Leadership (2)']];

export default function SkillsPortfolioView() {
  const [skills, setSkills] = useState(defaultSkills);
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice] = useState('');
  const [newSkill, setNewSkill] = useState({ name: '', level: 'INTERMEDIATE', percentage: 70, category: 'frontend' });

  useEffect(() => {
    let mounted = true;
    skillsApi.getSkills('current-seeker').then((items) => mounted && setSkills(items));
    const refresh = () => skillsApi.getSkills('current-seeker').then((items) => mounted && setSkills(items));
    window.addEventListener('job-matching:skills-updated', refresh);
    return () => { mounted = false; window.removeEventListener('job-matching:skills-updated', refresh); };
  }, []);

  const visibleSkills = filter === 'all' ? skills : skills.filter((skill) => skill.category === filter);
  const addSkill = async (event) => {
    event.preventDefault();
    if (!newSkill.name.trim()) return;
    const skill = await skillsApi.addSkill('current-seeker', { ...newSkill, name: newSkill.name.trim() });
    setSkills((items) => [...items, skill]);
    setNewSkill({ name: '', level: 'INTERMEDIATE', percentage: 70, category: 'frontend' });
    setShowAdd(false);
    setNotice('Skill added and AI match recalculated.');
  };
  const verifySkill = async (skill) => {
    await skillsApi.requestAiVerification('current-seeker', skill.id);
    setSkills((items) => items.map((item) => item.id === skill.id ? { ...item, verified: true } : item));
    setNotice(`${skill.name} is now AI verified.`);
  };
  const exportSkills = () => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([skills.map((skill) => `${skill.name}: ${skill.percentage}% (${skill.level})`).join('\n')], { type: 'text/plain' }));
    link.download = 'skill-sheet.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return <section className="space-y-6"><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600"><Code2 className="h-3.5 w-3.5" /> Skills</div><h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Core Technical Skills</h2><p className="mt-2 text-sm text-slate-600">Verified technical proficiencies, algorithmic competencies, and AI-evaluated domain strengths.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Add Custom Skill</button><button type="button" onClick={() => setNotice('Endorsement request sent.')} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">Endorsements (24)</button><button type="button" onClick={exportSkills} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"><Download className="h-4 w-4" /> Export Skill Sheet</button></div></div></div><div className="flex flex-wrap gap-2">{filters.map(([id, label]) => <button key={id} type="button" onClick={() => setFilter(id)} className={`rounded-xl px-3 py-2 text-xs font-bold ${filter === id ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-blue-50'}`}>{label}</button>)}</div><div className="grid gap-5 md:grid-cols-2">{visibleSkills.map((skill) => <article key={skill.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-bold text-slate-900">{skill.name}</h3><p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">{skill.level}</p></div>{skill.verified ? <BadgeCheck className="h-5 w-5 text-emerald-500" aria-label="AI verified" /> : <button type="button" onClick={() => verifySkill(skill)} className="text-xs font-bold text-blue-600 hover:underline">Verify</button>}</div><div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${skill.percentage}%` }} /></div><div className="mt-3 flex justify-between text-xs font-bold text-slate-500"><span>{skill.percentage}%</span><span>{skill.years || '3+ yrs'} · {skill.repos || 'projects'}</span></div><p className="mt-3 text-xs leading-5 text-slate-500">{skill.stack}</p></article>)}</div><div className="rounded-2xl border border-blue-100 bg-blue-50 p-6"><div className="flex items-start gap-3"><Sparkles className="h-5 w-5 shrink-0 text-blue-600" /><div><h3 className="font-black text-blue-950">Live AI Skill Assessment</h3><p className="mt-2 text-sm leading-6 text-blue-900">Your React and JavaScript expertise ranks in the <strong>top 4%</strong> of candidate profiles in the region. This gives you a <strong>94% Match Fit</strong> for Senior Frontend and Full Stack roles.</p><button type="button" onClick={() => setNotice('AI skill verification request submitted.')} className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Request AI Skill Verification Badge</button></div></div></div>{notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{notice}</p>}{showAdd && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><form onSubmit={addSkill} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h3 className="text-xl font-black">Add Custom Skill</h3><button type="button" onClick={() => setShowAdd(false)} aria-label="Close"><X className="h-5 w-5" /></button></div><input required value={newSkill.name} onChange={(event) => setNewSkill({ ...newSkill, name: event.target.value })} placeholder="Skill name" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /><div className="grid grid-cols-2 gap-3"><select value={newSkill.level} onChange={(event) => setNewSkill({ ...newSkill, level: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"><option>EXPERT</option><option>ADVANCED</option><option>INTERMEDIATE</option></select><select value={newSkill.category} onChange={(event) => setNewSkill({ ...newSkill, category: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"><option value="frontend">Frontend</option><option value="backend">Backend</option><option value="ai">AI</option><option value="databases">Databases</option><option value="soft">Soft Skills</option></select></div><div className="flex justify-end gap-2"><button type="button" onClick={() => setShowAdd(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button><button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Add Skill</button></div></form></div>}</section>;
}

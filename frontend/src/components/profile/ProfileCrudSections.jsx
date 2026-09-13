import { useState } from 'react';
import { Award, BriefcaseBusiness, GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react';

function CollectionSection({ title, icon: Icon, items, emptyText, onAdd, onEdit, onDelete, renderItem }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-black text-slate-900"><Icon className="h-5 w-5 text-[var(--brand-deep)]" /> {title}</h2><button type="button" onClick={() => onAdd()} className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-[var(--brand-deep)]"><Plus className="h-4 w-4" /> Add</button></div>{items.length === 0 ? <p className="mt-4 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">{emptyText}</p> : <div className="mt-4 space-y-3">{items.map((item) => <article key={item.id} className="rounded-xl border border-slate-100 p-4"><div>{renderItem(item)}</div><div className="mt-4 flex gap-3 border-t border-slate-100 pt-3"><button type="button" onClick={() => onEdit(item)} className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-[var(--brand-deep)]"><Pencil className="h-4 w-4" /> Edit</button><button type="button" onClick={() => onDelete(item)} className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-red-600"><Trash2 className="h-4 w-4" /> Delete</button></div></article>)}</div>}</section>;
}

export function EducationSection({ items = [], onAdd, onEdit, onDelete }) {
  return (
    <CollectionSection
      title="Education"
      icon={GraduationCap}
      items={items}
      emptyText="No education added yet. Click + Add to showcase your background."
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      renderItem={(item) => {
        const institution = item.institution || item.university || 'Institution';
        const field = item.field || item.department || '';
        const startDate = item.startDate || 'Start date';
        const endDate = item.endDate || 'Present';

        return (
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-black text-slate-900">
                  {item.degree || 'Degree or qualification'}
                </h3>
                {item.gpa && (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                    GPA {item.gpa}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {institution}
                {field ? ` • ${field}` : ''}
              </p>
              <p className="mt-2 text-xs font-medium text-slate-400">
                {startDate} – {endDate}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {item.description || 'No description added.'}
              </p>
            </div>
          </div>
        );
      }}
    />
  );
}

export function ExperienceSection({ items = [], onAdd, onEdit, onDelete }) {
  return (
    <CollectionSection
      title="Experience"
      icon={BriefcaseBusiness}
      items={items}
      emptyText="No experience added yet. Add work, projects, or internships."
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      renderItem={(item) => {
        const company = item.company || 'Company';
        const title = item.jobTitle || item.position || 'Job title';
        const employmentType = item.employmentType || 'Employment type';
        const startDate = item.startDate || 'Start date';
        const endDate = item.endDate || 'Present';

        return (
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-slate-900">{title}</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">{company}</p>
              <p className="mt-2 text-xs font-medium text-slate-400">
                {employmentType} • {startDate} – {endDate}
              </p>
              {item.achievements?.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
                  {item.achievements.map((achievement) => (
                    <li key={achievement}>{achievement}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-600">No achievements added.</p>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}

export function CertificationsSection({ items = [], onAdd, onEdit, onDelete, onView }) { return <CollectionSection title="Certifications" icon={Award} items={items} emptyText="No certifications added yet. Click + Add to showcase your credentials." onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} renderItem={(item) => <><h3 className="font-black text-slate-900">{item.title || 'Certification title'}</h3><p className="mt-1 text-sm text-slate-500">{item.issuer || 'Issuing organization'}</p><p className="mt-2 text-xs text-slate-400">Issued {item.issueDate || 'date'}{item.expirationDate ? ` · Expires ${item.expirationDate}` : ''}</p>{(item.credentialUrl || item.credentialFile) && <button type="button" onClick={() => onView(item)} className="mt-3 text-sm font-bold text-[var(--brand-deep)] hover:underline">View Certificate</button>}</>}/>; }

export function SkillsSection({ skills = {}, onEdit }) { const values = Array.isArray(skills) ? skills : Object.values(skills || {}).flat(); return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-black text-slate-900"><Award className="h-5 w-5 text-[var(--brand-deep)]" /> Skills</h2><button type="button" onClick={onEdit} className="min-h-11 text-sm font-bold text-[var(--brand-deep)]">Edit</button></div>{values.length ? <div className="mt-4 flex flex-wrap gap-2">{values.map((skill, index) => <span key={`${skill.name || skill}-${index}`} className="rounded-full bg-[var(--brand-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--brand-deep)]">{typeof skill === 'object' ? skill.name || skill.title : skill}</span>)}</div> : <p className="mt-4 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No skills added yet. Add skills to improve AI matching.</p>}</section>; }

export function ItemEditor({ type, item, onCancel, onSave }) { const defaults = type === 'education' ? { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', description: '' } : type === 'experience' ? { jobTitle: '', company: '', employmentType: '', startDate: '', endDate: '', achievementsText: '' } : { title: '', issuer: '', issueDate: '', expirationDate: '', credentialUrl: '', credentialId: '' }; const [form, setForm] = useState({ ...defaults, ...item, achievementsText: item?.achievements?.join('\n') || '' }); const update = (key, value) => setForm((current) => ({ ...current, [key]: value })); const submit = (event) => { event.preventDefault(); const payload = { ...form }; if (type === 'experience') { payload.achievements = form.achievementsText.split('\n').map((line) => line.trim()).filter(Boolean); delete payload.achievementsText; } onSave(payload); }; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"><form onSubmit={submit} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-black text-slate-900">{item ? 'Edit' : 'Add'} {type}</h2><button type="button" onClick={onCancel} className="min-h-11 px-3 text-slate-500">Close</button></div><div className="grid gap-3 sm:grid-cols-2">{Object.keys(defaults).map((key) => key === 'description' || key === 'achievementsText' ? <textarea key={key} rows={3} value={form[key] || ''} onChange={(event) => update(key, event.target.value)} placeholder={key} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm sm:col-span-2" /> : <input key={key} type={key.toLowerCase().includes('date') ? 'date' : key.toLowerCase().includes('url') ? 'url' : 'text'} value={form[key] || ''} onChange={(event) => update(key, event.target.value)} placeholder={key} className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm" />)}</div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onCancel} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600">Cancel</button><button type="submit" className="min-h-11 rounded-xl bg-[var(--brand-primary)] px-5 text-sm font-bold text-white">Save</button></div></form></div>; }

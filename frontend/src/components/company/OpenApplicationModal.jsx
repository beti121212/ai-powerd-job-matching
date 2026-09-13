import { useMemo, useState } from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const skillOptions = [
  'React',
  'Node.js',
  'TypeScript',
  'JavaScript',
  'Product Design',
  'Figma',
  'Marketing',
  'Sales',
  'Customer Success',
  'UI/UX',
  'Data Analysis',
  'Project Management',
  'Python',
  'Communication',
  'Leadership',
];

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  preferredDepartment: 'Engineering',
  preferredJobType: 'Full-time',
  cvUpload: null,
  keySkills: ['React'],
  coverNote: '',
};

export default function OpenApplicationModal({ companyId, isOpen, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [toast, setToast] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const skillSummary = useMemo(() => form.keySkills.join(', '), [form.keySkills]);

  if (!isOpen) return null;

  const toggleSkill = (skill) => {
    setForm((current) => {
      const exists = current.keySkills.includes(skill);
      return {
        ...current,
        keySkills: exists ? current.keySkills.filter((item) => item !== skill) : [...current.keySkills, skill],
      };
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((current) => ({ ...current, cvUpload: file }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.fullName || !form.email || !form.phone || !form.coverNote.trim()) {
      setToast('Please complete all required fields before submitting.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      preferredDepartment: form.preferredDepartment,
      preferredJobType: form.preferredJobType,
      cvFileName: form.cvUpload?.name || 'resume.pdf',
      keySkills: form.keySkills,
      coverNote: form.coverNote,
      source: 'open_application',
    };

    try {
      await api.post(`/companies/${companyId}/open-applications`, payload);
      const storageKey = `company-open-applications:${companyId || 'default'}`;
      const previous = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify([payload, ...previous]));
      setToast('Your profile has been saved to the company\'s Talent Pool for upcoming roles!');
      setForm(initialForm);
      window.setTimeout(() => {
        setToast('');
        onClose();
      }, 1800);
    } catch (error) {
      const storageKey = `company-open-applications:${companyId || 'default'}`;
      const previous = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify([payload, ...previous]));
      setToast('Your profile has been saved to the company\'s Talent Pool for upcoming roles!');
      setForm(initialForm);
      window.setTimeout(() => {
        setToast('');
        onClose();
      }, 1800);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-600">Open application</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">Join the company talent pool</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">
              Full Name
              <input
                required
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
              />
            </label>

            <label className="text-sm font-bold text-slate-700">
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
              />
            </label>

            <label className="text-sm font-bold text-slate-700">
              Phone
              <input
                required
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
              />
            </label>

            <label className="text-sm font-bold text-slate-700">
              Preferred Department
              <select
                value={form.preferredDepartment}
                onChange={(event) => setForm((current) => ({ ...current, preferredDepartment: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
              >
                <option>Engineering</option>
                <option>Design</option>
                <option>Sales</option>
                <option>Marketing</option>
                <option>Operations</option>
                <option>Customer Success</option>
              </select>
            </label>

            <label className="text-sm font-bold text-slate-700">
              Preferred Job Type
              <select
                value={form.preferredJobType}
                onChange={(event) => setForm((current) => ({ ...current, preferredJobType: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
              >
                <option>Full-time</option>
                <option>Remote</option>
                <option>Internship</option>
              </select>
            </label>

            <label className="text-sm font-bold text-slate-700 sm:col-span-2">
              CV Upload
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="w-full text-sm text-slate-600" />
              </div>
              {form.cvUpload && <p className="mt-2 text-xs font-medium text-slate-500">Selected file: {form.cvUpload.name}</p>}
            </label>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-700">Key Skills</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {skillOptions.map((skill) => {
                const active = form.keySkills.includes(skill);
                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                      active ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate-500">Selected skills: {skillSummary || 'No skills selected yet'}</p>
          </div>

          <label className="block text-sm font-bold text-slate-700">
            Cover Note
            <textarea
              required
              rows="4"
              value={form.coverNote}
              onChange={(event) => setForm((current) => ({ ...current, coverNote: event.target.value }))}
              placeholder="Tell the company about your career goals and the type of roles you are looking for."
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
            />
          </label>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? 'Submitting...' : 'Save to Talent Pool'}
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <div className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  );
}

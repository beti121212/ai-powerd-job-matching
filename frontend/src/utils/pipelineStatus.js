export const PIPELINE_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'applied', label: 'Applied' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

const LABELS = {
  applied: 'Applied',
  'under-review': 'Under Review',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  hired: 'Hired',
  rejected: 'Rejected',
};

const STATUS_CLASSES = {
  applied: 'border border-amber-200 bg-amber-50 text-amber-700',
  'under-review': 'border border-blue-200 bg-blue-50 text-blue-700',
  shortlisted: 'border border-violet-200 bg-violet-50 text-violet-700',
  interview: 'border border-indigo-200 bg-indigo-50 text-indigo-700',
  hired: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border border-rose-200 bg-rose-50 text-rose-700',
};

const STATUS_ALIASES = {
  all: 'all',
  applied: 'applied',
  pending: 'applied',
  submitted: 'applied',
  new: 'applied',
  'under-review': 'under-review',
  'under review': 'under-review',
  'in-review': 'under-review',
  'in review': 'under-review',
  review: 'under-review',
  shortlisted: 'shortlisted',
  interview: 'interview',
  'interview-scheduled': 'interview',
  'interview scheduled': 'interview',
  hired: 'hired',
  accepted: 'hired',
  'offer': 'hired',
  rejected: 'rejected',
  declined: 'rejected',
  withdrawn: 'rejected',
};

export function normalizePipelineStatus(value) {
  if (value === null || value === undefined) return 'applied';

  const raw = String(value).trim().toLowerCase();
  if (!raw) return 'applied';

  const normalized = raw.replace(/\s+/g, '-');
  return STATUS_ALIASES[raw] || STATUS_ALIASES[normalized] || normalized;
}

export function getPipelineStatusLabel(value) {
  const normalized = normalizePipelineStatus(value);

  if (normalized === 'all') return 'All statuses';

  return LABELS[normalized] || normalized
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getPipelineStatusClasses(value) {
  const normalized = normalizePipelineStatus(value);
  return STATUS_CLASSES[normalized] || 'border border-slate-200 bg-slate-100 text-slate-600';
}

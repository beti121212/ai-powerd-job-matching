import type {
  ApplicationStats,
  DashboardSummary,
  JobApplication,
  JobMatch,
  RecommendedJob,
  UpcomingInterview,
  UserProfile,
} from '../types/dashboard';
import { getUpcomingMockInterview } from '../utils/interviewFlow';
import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const mockProfile: UserProfile = {
  id: 'seeker-demo',
  name: 'Job Seeker',
  email: '',
  headline: 'Complete your profile to receive better AI job matches',
  profileCompletion: 72,
  cvReviewScore: 86,
};

const mockStats: ApplicationStats = {
  total: 0,
  pending: 0,
  shortlisted: 0,
  interviewScheduled: 0,
  hired: 0,
};

const mockMatches: JobMatch[] = [
  {
    id: 'match-101', title: 'Frontend Engineer', company: 'Blue Nile Tech', location: 'Addis Ababa · Hybrid', salary: '45,000–65,000 ETB', matchScore: 94,
    reasons: ['React and TypeScript experience', 'Matches your preferred work setup'], tags: ['React', 'TypeScript', 'Mid-level'],
  },
  {
    id: 'match-102', title: 'Full Stack Developer', company: 'Mella Digital', location: 'Remote · Ethiopia', salary: '50,000–75,000 ETB', matchScore: 89,
    reasons: ['Strong JavaScript skill alignment', 'Your CV matches the role seniority'], tags: ['Node.js', 'PostgreSQL', 'Remote'],
  },
  {
    id: 'match-103', title: 'Product Engineer', company: 'Fintech Hub', location: 'Addis Ababa · On-site', salary: '55,000–80,000 ETB', matchScore: 84,
    reasons: ['Your UI and API experience is relevant', 'Growing company with career progression'], tags: ['React', 'APIs', 'Product'],
  },
];

const mockApplications: JobApplication[] = [
  { id: 'application-201', company: 'Ethiopian Digital', role: 'React Developer', appliedDate: 'Aug 18, 2026', status: 'Shortlisted', location: 'Addis Ababa' },
  { id: 'application-202', company: 'Kifiya Financial', role: 'Frontend Engineer', appliedDate: 'Aug 14, 2026', status: 'Pending', location: 'Remote' },
  { id: 'application-203', company: 'Mella Digital', role: 'Full Stack Developer', appliedDate: 'Aug 08, 2026', status: 'Interview Scheduled', location: 'Addis Ababa' },
];

const mockInterviews: UpcomingInterview[] = [
  { id: 'interview-301', jobTitle: 'React Developer', company: 'Ethiopian Digital', date: 'Thursday, Aug 27, 2026', time: '10:30 AM – 11:15 AM', format: 'Video', interviewerName: 'Sara Bekele', interviewerRole: 'Engineering Manager', meetingUrl: 'https://meet.google.com/' },
];

const mockRecommended: RecommendedJob[] = [
  { id: 'recommended-401', title: 'Frontend Developer', company: 'Awash Innovation', salary: '40,000–60,000 ETB', location: 'Addis Ababa', tags: ['React', 'UI/UX', 'Full-time'], postedAt: '2 days ago' },
  { id: 'recommended-402', title: 'Junior Software Engineer', company: 'Ethio Telecom Labs', salary: '30,000–45,000 ETB', location: 'Addis Ababa · Hybrid', tags: ['JavaScript', 'Git', 'Entry-level'], postedAt: '4 days ago' },
  { id: 'recommended-403', title: 'Backend Developer', company: 'Chapa', salary: '50,000–70,000 ETB', location: 'Remote · Ethiopia', tags: ['Node.js', 'API', 'Remote'], postedAt: '1 week ago' },
];

async function request<T>(path: string, fallback: T): Promise<T> {
  return fallback;
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return request('/seeker/dashboard/summary', { profile: mockProfile, stats: mockStats });
}

export async function fetchJobMatches(): Promise<JobMatch[]> {
  return request('/seeker/dashboard/job-matches', mockMatches);
}

export async function fetchRecentApplications(): Promise<JobApplication[]> {
  try {
    const { data } = await api.get('/seeker/applications');
    if (Array.isArray(data.applications)) return data.applications.map((item) => ({ ...item, role: item.role || item.title, company: item.company || item.company_name, status: String(item.status || '').toLowerCase() === 'under-review' ? 'Under Review' : item.status }));
  } catch {
    // Preserve the existing local demo fallback when the API is unavailable.
  }
  let localApplications: JobApplication[] = [];
  try {
    localApplications = JSON.parse(localStorage.getItem('mockApplications') || '[]');
  } catch {
    localApplications = [];
  }
  return [...localApplications, ...mockApplications].filter((item, index, list) => list.findIndex((candidate) => String(candidate.id) === String(item.id)) === index);
}

export async function fetchMatchedJobs(): Promise<any[]> {
  const { data } = await api.get('/jobs/match');
  return (data.jobs || []).map((job: any) => ({
    ...job,
    company: job.company || job.company_name,
    salary: job.salary || (job.salary_min || job.salary_max ? `${job.currency || 'ETB'} ${job.salary_min || ''}${job.salary_min && job.salary_max ? ' - ' : ''}${job.salary_max || ''}` : 'Negotiable'),
    type: job.type || job.job_type,
    skills: job.skills || job.requiredSkills || [],
    tags: job.tags || job.requiredSkills || [],
  }));
}

export async function fetchUpcomingInterviews(): Promise<UpcomingInterview[]> {
  const localInterview = getUpcomingMockInterview();
  if (localInterview) return [{ ...localInterview, format: localInterview.type === 'Online' ? 'Video' : localInterview.type, meetingUrl: localInterview.meetingLink, employerNotes: localInterview.instructions } as UpcomingInterview];
  return request('/seeker/dashboard/interviews/upcoming', mockInterviews);
}

export async function fetchRecommendedJobs(): Promise<RecommendedJob[]> {
  return request('/seeker/dashboard/recommended-jobs', mockRecommended);
}

export const getDashboardSummary = fetchDashboardSummary;
export const getJobMatches = fetchJobMatches;
export const getRecentApplications = fetchRecentApplications;
export const getUpcomingInterviews = fetchUpcomingInterviews;
export const getRecommendedJobs = fetchRecommendedJobs;
export const getMatchedJobs = fetchMatchedJobs;

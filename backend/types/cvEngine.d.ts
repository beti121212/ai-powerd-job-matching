export type SkillCategory = 'technical' | 'tools' | 'soft' | string;

export interface CandidateSkill {
  skill_name: string;
  skill_category?: SkillCategory;
  proficiency_level?: string;
  years_of_experience?: number | null;
}

export interface CandidateEducation {
  degree?: string | null;
  institution?: string | null;
  school_name?: string | null;
  fieldOfStudy?: string | null;
  field_of_study?: string | null;
  graduationYear?: string | null;
}

export interface CandidateExperience {
  role?: string | null;
  job_title?: string | null;
  company?: string | null;
  company_name?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean;
  responsibilities?: string[];
}

export interface CandidateProfile {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  headline: string;
  location: string;
  skills: CandidateSkill[];
  education: CandidateEducation[];
  experience: CandidateExperience[];
  languages: Array<{ language_name: string; proficiency?: string }>;
}

export interface JobMatch {
  id: number;
  title: string;
  required_skills: string[];
  matched_skills: string[];
  match_breakdown: { skills: number; title: number; education: number };
  match_score: number;
}

export interface ValidateAndParseResponse {
  success: true;
  candidateProfile: CandidateProfile;
  overallMatchScore: number;
  topMatchedJobs: JobMatch[];
}

export interface InvalidCvResponse {
  success: false;
  message: string;
}

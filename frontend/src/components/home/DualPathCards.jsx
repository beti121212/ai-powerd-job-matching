import { useNavigate } from 'react-router-dom';
import { UserCheck, Building2, ArrowRight, CheckCircle } from 'lucide-react';

export default function DualPathCards() {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-6 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
            Tailored Experience
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Both Candidates & Employers
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Whether you're looking for your next tech role or hiring top software talent, Lemesrat.ai automates the process with precision.
          </p>
        </div>

        {/* Dual Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Path 1: For Job Seekers */}
          <div className="card-floating flex flex-col justify-between group">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-7 h-7" />
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                  For Job Seekers
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Find Your Perfect Role</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Upload your CV to let our AI extract your skill matrix, match you with top Ethiopian tech companies, and give real-time compatibility scores.
                </p>
              </div>

              <ul className="space-y-3 pt-2">
                {[
                  'Instant AI CV Skill Analysis',
                  'Personalized Job Match Ratings (%)',
                  'Direct Job Applications & Status Tracking'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8 mt-6 border-t border-slate-100">
              <button
                onClick={() => navigate('/upload-cv')}
                className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Upload CV & Match</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
 {/* Path 2: For Employers */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7" />
                </div>
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
                  For Employers
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Hire Pre-Vetted Engineers</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Post developer jobs and let our AI algorithm automatically screen applicant resumes to find candidates with exact tech stack matches.
                </p>
              </div>

              <ul className="space-y-3 pt-2">
                {[
                  'Automated Resume Screening & Ranking',
                  'AI Skill Match Summaries per Candidate',
                  'Streamlined Hiring Dashboard'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8 mt-6 border-t border-slate-100">
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-white hover:bg-slate-50 text-slate-900 hover:text-indigo-600 font-bold py-3.5 px-6 rounded-2xl text-sm transition-all duration-200 border border-slate-300 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Post a Developer Job</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
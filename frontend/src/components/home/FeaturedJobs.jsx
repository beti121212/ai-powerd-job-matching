import { Link } from 'react-router-dom';
import { Building2, MapPin, Sparkles, ArrowRight, Briefcase } from 'lucide-react';

export default function FeaturedJobs() {
  const jobs = [
    { 
      title: 'Frontend React Developer', 
      company: 'Ethiopian Tech Hub', 
      location: 'Addis Ababa (Hybrid)', 
      type: 'Full-time', 
      match: '98% Match', 
      skills: ['React', 'JavaScript', 'Tailwind'] 
    },
    { 
      title: 'Full Stack Engineer', 
      company: 'PayEthio FinTech', 
      location: 'Remote', 
      type: 'Full-time', 
      match: '85% Match', 
      skills: ['React', 'Node.js', 'PostgreSQL'] 
    },
    { 
      title: 'Python Backend Engineer', 
      company: 'NextGen Solutions', 
      location: 'Addis Ababa', 
      type: 'Contract', 
      match: '92% Match', 
      skills: ['Python', 'FastAPI', 'Docker'] 
    },
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommended For You</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Featured Opportunities
          </h2>
          <p className="text-slate-500 text-sm">High-match technical roles updated daily.</p>
        </div>

        <Link 
          to="/jobs" 
          className="text-blue-600 hover:text-blue-700 font-bold text-sm inline-flex items-center gap-1.5 transition-colors group"
        >
          <span>Browse All Jobs</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {jobs.map((job, idx) => (
          <div 
            key={idx} 
            className="card-floating flex flex-col justify-between group sm:p-9"
          >
            <div>
              {/* Badges Header */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                  {job.type}
                </span>
                <span className="text-[11px] font-extrabold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  {job.match}
                </span>
              </div>

              {/* Title & Info */}
              <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                {job.title}
              </h3>

              <div className="space-y-1.5 mb-5">
                <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{job.company}</span>
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{job.location}</span>
                </p>
              </div>
 {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {job.skills.map((s) => (
                  <span 
                    key={s} 
                    className="text-[11px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium border border-blue-100/80"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <Link 
              to="/login" 
              className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-xs transition shadow-sm shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Apply with AI Resume</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
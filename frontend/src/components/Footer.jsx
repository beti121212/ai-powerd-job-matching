import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin, Globe, Share2, MessageSquare } from 'lucide-react';

function Footer() {
  return (
    <footer className="relative z-[60] border-t border-blue-900/60 bg-gradient-to-br from-[#071b2b] via-[#0b3554] to-[#02070c] text-slate-300 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 text-white transition-opacity hover:opacity-90">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-300/30 bg-blue-500/20 text-blue-200 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                job matching
              </span>
            </Link>
            
            <p className="max-w-sm text-xs leading-relaxed text-slate-300 md:text-sm">
              Ethiopia's premiere AI-powered tech talent platform. Connecting developer skills with top software engineering opportunities with precision matching.
            </p>

            {/* Social / Web Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-300/30 bg-blue-950/50 text-blue-200 transition hover:bg-blue-500 hover:text-white" title="Website">
                <Globe className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-300/30 bg-blue-950/50 text-blue-200 transition hover:bg-blue-500 hover:text-white" title="Community">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-300/30 bg-blue-950/50 text-blue-200 transition hover:bg-blue-500 hover:text-white" title="Contact">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">Quick Links</h4>
            <ul className="space-y-2.5 text-xs md:text-sm">
              <li>
                <Link to="/" className="transition hover:text-blue-200">Home</Link>
              </li>
              <li>
                <Link to="/jobs" className="transition hover:text-blue-200">Find Jobs</Link>
              </li>
              <li>
                <Link to="/about" className="transition hover:text-blue-200">About Us</Link>
              </li>
            </ul>
          </div>

          {/* Platform Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">For Talent</h4>
            <ul className="space-y-2.5 text-xs md:text-sm">
              <li>
                <Link to="/register" className="transition hover:text-blue-200">Create Account</Link>
              </li>
              <li>
                <Link to="/upload-cv" className="transition hover:text-blue-200">AI CV Analysis</Link>
              </li>
              <li>
                <Link to="/jobs" className="transition hover:text-blue-200">Skill Matching</Link>
              </li>
              <li>
                <Link to="/login" className="transition hover:text-blue-200">Job Alerts</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">Get in Touch</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-blue-300" />
                <span>Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-blue-300" />
                <span>support@job matching</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-blue-300" />
                <span>0900455339</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} EthioSolve AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="#" className="transition hover:text-blue-200">Privacy Policy</Link>
            <Link to="#" className="transition hover:text-blue-200">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
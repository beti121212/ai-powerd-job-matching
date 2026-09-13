import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import peopleImg from '../../pages/images/peoples.jpg';

export default function HeroSection() {
  const navigate = useNavigate();
  const headlineRef = useRef(null);
  const [hoveredLine, setHoveredLine] = useState(null);

  //  Navigation Handlers
  const handleStartNow = () => {
    navigate('/register');
  };

  const handleExploreJobs = () => {
    navigate('/jobs');
  };

  return (
    <section className="relative w-full min-h-[92vh] overflow-hidden bg-slate-900">
      
      {/* BACKGROUND LAYER - Hero Image (lowest z-index) */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <img
          src={peopleImg}
          alt="Hero Background"
          className="w-full h-full object-cover object-center pointer-events-none select-none"
        />
      </div>

      {/* OVERLAY LAYER - Dark Gradient for Text Legibility (middle z-index) */}
      <div className="absolute inset-0 z-10 bg-linear-to-r from-slate-950/35 via-blue-950/30 to-slate-950/40" />

      {/* FOREGROUND LAYER - Content (highest z-index) */}
      <div className="relative z-20 w-full min-h-[92vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="w-full max-w-5xl mx-auto text-center space-y-6">
          
          {/* Brand Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/30 border border-blue-400/50 text-blue-200 rounded-full text-xs sm:text-sm font-black tracking-wide uppercase shadow-lg backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>AI-Powered Job Matching Platform</span>
          </div>

          {/* High-Contrast, Big & Bold Headline with Line-by-Line 3D Pop-Out Effect */}
          <div ref={headlineRef} className="perspective">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
              {/* Line 1: Find Your Dream Job with - Full line pops forward */}
              <motion.div
                onMouseEnter={() => setHoveredLine(1)}
                onMouseLeave={() => setHoveredLine(null)}
                animate={{
                  scale: hoveredLine === 1 ? 1.18 : 1,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, mass: 0.5 }}
                className={`inline-block cursor-pointer transition-all ${
                  hoveredLine === 1
                    ? 'drop-shadow-[0_10px_32px_rgba(0,0,0,1)]'
                    : 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]'
                }`}
              >
                <span className="text-white">
                  Find Your Dream Job with <br className="hidden sm:inline" />
                </span>
              </motion.div>

              {/* Line 2: Intelligent AI Precision - Full line pops forward with glowing shadow */}
              <motion.div
                onMouseEnter={() => setHoveredLine(2)}
                onMouseLeave={() => setHoveredLine(null)}
                animate={{
                  scale: hoveredLine === 2 ? 1.22 : 1,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, mass: 0.5 }}
                className={`inline-block cursor-pointer transition-all ${
                  hoveredLine === 2
                    ? 'drop-shadow-[0_12px_40px_rgba(0,200,255,1)]'
                    : 'drop-shadow-[0_4px_16px_rgba(0,200,255,0.6)]'
                }`}
              >
                <span className="text-sky-300">
                  Intelligent AI Precision
                </span>
              </motion.div>
            </h1>
          </div>
 {/* Clean, Readable Subtitle (Pure High-Contrast White) */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-100 font-semibold max-w-2xl mx-auto leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            Connect with top verified employers across Ethiopia. Upload your CV and let AI instantly match and score opportunities tailored to your career.
          </p>

          {/* Dual Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center">
            {/* Primary: Start Now Button */}
            <button
              onClick={handleStartNow}
              className="h-14 px-10 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-blue-600/40 transition-all cursor-pointer"
            >
              Start Now
            </button>

            {/* Secondary: Explore All Jobs Button */}
            <button
              onClick={handleExploreJobs}
              className="h-14 px-10 bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white font-black text-base sm:text-lg rounded-2xl border-2 border-white/40 backdrop-blur-md shadow-lg transition-all cursor-pointer"
            >
              Explore All Jobs
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
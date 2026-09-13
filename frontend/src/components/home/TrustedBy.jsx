import React, { useState } from 'react';
import { TRUSTED_BRANDS } from '../../data/trustedBrands';
import './TrustedBy.css';

export default function TrustedBy() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <section className="w-full bg-white py-16 sm:py-20 px-6 border-b border-slate-100">
      <div className="w-full">
        {/* Centered Title */}
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-900 mb-12 sm:mb-16">
          Trusted By
        </h2>

        {/* Marquee Container */}
        <div 
          className="relative overflow-hidden h-20 sm:h-24 flex items-center"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Left gradient fade - from white to transparent */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-r from-white via-white to-transparent z-20 pointer-events-none" />

          {/* Logos Marquee - Infinite scrolling */}
          <div 
            className="trusted-by-marquee flex gap-16 sm:gap-24 lg:gap-32 items-center"
            style={{
              animationPlayState: isHovering ? 'paused' : 'running'
            }}
          >
            {/* Duplicate for seamless infinite loop */}
            {[...TRUSTED_BRANDS, ...TRUSTED_BRANDS].map((brand, idx) => (
              <div
                key={`${brand.id}-${idx}`}
                className="flex-shrink-0 h-16 sm:h-20 flex items-center justify-center cursor-default"
                title={brand.name}
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-full w-auto max-w-[160px] sm:max-w-[200px] object-contain filter drop-shadow-none"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* Right gradient fade - from transparent to white */}
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-l from-white via-white to-transparent z-20 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

import React, { useEffect, useState } from 'react';

const Hero: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000); // 3 seconds total

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Intro Overlay */}
      {showIntro && (
        <div className="fixed inset-0 bg-[#3D1F0F] text-white flex items-center justify-center z-50 animate-slideUp">
          <div className="text-xl tracking-wider uppercase font-light opacity-0 animate-fadeIn">
            KAIZZCER
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-screen bg-[#FAF6F2] flex items-center justify-center overflow-hidden">
        {/* Background Scrolling Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="text-6xl md:text-8xl lg:text-9xl font-black whitespace-nowrap uppercase tracking-tighter hero-scrolling-text"
            style={{ color: 'var(--scroll-text)' }}
          >
            LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT LUMEN POINT
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 text-center">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-[#683B2B] uppercase tracking-tighter leading-none mb-4">
            LUMEN POINT
          </h1>
          <p className="text-lg md:text-xl text-[#683B2B] opacity-70 uppercase tracking-wide">
            Decoding the Complex
          </p>
        </div>
      </section>
    </>
  );
};

export default Hero;

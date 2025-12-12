import React from 'react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  return (
    <motion.section
      className="py-32 bg-[#FAF6F2]"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Left Column - Organic Blob */}
          <div className="relative group cursor-pointer">
            <svg
              viewBox="0 0 400 400"
              className="w-full h-auto transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M200 0C150 0 100 50 50 100C0 150 0 200 50 250C100 300 150 350 200 350C250 350 300 300 350 250C400 200 400 150 350 100C300 50 250 0 200 0Z"
                fill="#D49E8D"
                fillOpacity="0.4"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-5xl md:text-6xl font-serif text-[#683B2B] leading-tight transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
                Unlocking The Core Logic.
              </h2>
            </div>
          </div>

          {/* Right Column - Editorial Text */}
          <div className="space-y-8">
            <p className="text-4xl md:text-5xl font-serif text-[#683B2B] leading-relaxed">
              From F1 Engineering to AI Architecture, we distill the world's noise into a single Lumen Point.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default About;

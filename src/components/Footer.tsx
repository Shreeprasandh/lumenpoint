import React from 'react';
import { Chrome, Youtube, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#683B2B] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-[#FAF6F2] text-opacity-70 mb-6">
          © Lumen Point
        </p>
        <div className="flex justify-center space-x-6">
          <a
            href="#home"
            className="text-[#FAF6F2] text-opacity-70 hover:text-[#B08401] transition-colors duration-300"
          >
            <Chrome size={24} />
          </a>
          <a
            href="https://www.youtube.com/@ourlumenpoint"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FAF6F2] text-opacity-70 hover:text-[#B08401] transition-colors duration-300"
          >
            <Youtube size={24} />
          </a>
          <a
            href="https://www.instagram.com/canticumsongs/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FAF6F2] text-opacity-70 hover:text-[#B08401] transition-colors duration-300"
          >
            <Instagram size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

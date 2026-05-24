
import React from 'react';
import { Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-auto relative z-10 flex flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      
      {/* Info Bar Section */}
      <div className="w-full bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            
            {/* Left: Copyright */}
            <div className="text-gray-500 dark:text-gray-400 font-medium tracking-wide order-2 md:order-1">
              BilKo's PC &copy; 2026
            </div>

            {/* Center: Credits */}
            <div className="text-gray-600 dark:text-gray-300 text-center order-3 md:order-2">
              Created by <span className="font-bold text-gray-900 dark:text-white">BilKo(Ch)al</span> with the help of AI
            </div>

            {/* Right: Github Link */}
            <div className="order-1 md:order-3">
              <a 
                href="https://bilkochal.github.io/BilKos-PC/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all duration-200 group bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600"
              >
                <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">BilKo(Ch)al</span>
              </a>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};

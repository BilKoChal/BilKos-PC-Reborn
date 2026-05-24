
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Menu, Moon, Sun, X, Github, Bug, BookOpen, Monitor, Home, LayoutGrid, Book, Trophy, Map, Database } from 'lucide-react';
import { DashboardTab } from '../editor/EditorDashboard';

interface HeaderProps {
    onNavigate?: (tab: DashboardTab) => void;
    hasActiveSave?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, hasActiveSave }) => {
  const { mode, toggleMode, getGameTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const theme = getGameTheme();
  const isLightTheme = theme?.id === 'yellow' || theme?.id === 'gold' || theme?.id === 'silver' || theme?.id === 'crystal';
  
  const iconColor = isLightTheme ? 'text-yellow-500' : 'text-red-500';

  const handleNavClick = (tab: DashboardTab) => {
      if (onNavigate) {
          onNavigate(tab);
          setIsMenuOpen(false);
      }
  };

  return (
    <>
      <header 
        className="sticky top-0 z-50 w-full shadow-md transition-colors duration-300 bg-theme-primary text-theme-text-on-primary"
      >
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Area */}
          <div className="flex items-center space-x-3 select-none">
            <div className="bg-white rounded-full p-1 border-4 border-theme-secondary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={iconColor}>
                 <circle cx="12" cy="12" r="10" fill="#F0F0F0" stroke="black" strokeWidth="2"/>
                 <path d="M2 12H22" stroke="black" strokeWidth="2"/>
                 <circle cx="12" cy="12" r="3" fill="white" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-wider uppercase hidden sm:block">BilKo's PC</span>
            <span className="font-bold text-xl tracking-wider uppercase sm:hidden">PC</span>
          </div>

          {/* Actions Area */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            <div className="hidden sm:flex items-center px-3 py-1 rounded text-xs font-mono opacity-80 bg-current/15">
              v1.1.0-alpha
            </div>

            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleMode}
              className="p-2 rounded-full hover:bg-current/10 active:scale-95 transition-all"
              aria-label="Toggle Theme"
            >
              {mode === 'light' ? <Moon size={24} /> : <Sun size={24} />}
            </button>

            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-full hover:bg-current/10 active:scale-95 transition-all"
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Hamburger Menu Overlay & Sidebar */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* Sidebar Drawer */}
          <div className="relative w-80 h-full bg-white dark:bg-gray-950 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-200 dark:border-gray-800">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <span className="font-black text-lg text-gray-800 dark:text-white uppercase tracking-wide">Menu</span>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Navigation Section (Only if Active Save) */}
              {hasActiveSave && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Navigation</h4>
                    <div className="space-y-1">
                      <button onClick={() => handleNavClick('home')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-gray-700 dark:text-gray-200 font-bold text-sm text-left">
                        <Home size={18} className="text-orange-500" /> Dashboard
                      </button>
                      <button onClick={() => handleNavClick('storage')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-gray-700 dark:text-gray-200 font-bold text-sm text-left">
                        <LayoutGrid size={18} className="text-blue-500" /> PC Storage
                      </button>
                      <button onClick={() => handleNavClick('encounters')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-gray-700 dark:text-gray-200 font-bold text-sm text-left">
                        <Database size={18} className="text-purple-500" /> Encounter DB
                      </button>
                      <button onClick={() => handleNavClick('pokedex')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-gray-700 dark:text-gray-200 font-bold text-sm text-left">
                        <Book size={18} className="text-red-500" /> Pokédex
                      </button>
                      <button onClick={() => handleNavClick('battle')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-gray-700 dark:text-gray-200 font-bold text-sm text-left">
                        <Trophy size={18} className="text-green-500" /> Battle Guide
                      </button>
                      <button onClick={() => handleNavClick('events')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-gray-700 dark:text-gray-200 font-bold text-sm text-left">
                        <Map size={18} className="text-purple-500" /> World Events
                      </button>
                      <button onClick={() => handleNavClick('hof')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-gray-700 dark:text-gray-200 font-bold text-sm text-left">
                        <Trophy size={18} className="text-yellow-500" /> Hall of Fame
                      </button>
                    </div>
                  </div>
              )}

              {/* Section: Links */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Links</h4>
                <div className="space-y-1">
                  <a 
                    href="https://github.com/BilKoChal/BilKos-PC" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-gray-600 dark:text-gray-300 font-medium text-sm"
                  >
                    <Github size={18} />
                    GitHub Repository
                  </a>
                  <a 
                    href="https://github.com/BilKoChal/BilKos-PC/issues" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-gray-600 dark:text-gray-300 font-medium text-sm"
                  >
                    <Bug size={18} />
                    Report a Bug
                  </a>
                  <a 
                    href="https://bulbapedia.bulbagarden.net/wiki/Main_Page" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-gray-600 dark:text-gray-300 font-medium text-sm"
                  >
                    <BookOpen size={18} />
                    Bulbapedia Wiki
                  </a>
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500">
                  <Monitor size={20} />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 dark:text-white text-sm">BilKo's PC</h5>
                  <p className="text-xs text-gray-500">Gen 1 Save Editor</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

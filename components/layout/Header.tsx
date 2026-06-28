
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSpriteMode, SpriteMode } from '../../context/SpriteContext';
import { Menu, Moon, Sun, X, Github, Bug, BookOpen, Monitor, Home, LayoutGrid, Book, Trophy, Map, Database, Settings, Check, Image, Gamepad2, Sparkles } from 'lucide-react';
import { DashboardTab } from '../editor/EditorDashboard';
import { useModalA11y } from '../../lib/hooks/useModalA11y';
import { ModalPortal } from '../../lib/hooks/ModalPortal';

interface HeaderProps {
    onNavigate?: (tab: DashboardTab) => void;
    hasActiveSave?: boolean;
}

const SPRITE_MODE_OPTIONS: { value: SpriteMode; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'game-specific',
    label: 'Game Specific',
    description: 'Version-specific pixel sprites (R/B, Yellow, Gold, Silver, Crystal)',
    icon: <Gamepad2 size={18} />,
  },
  {
    value: 'master',
    label: 'Master',
    description: 'Standard pixel sprites (same across all versions)',
    icon: <Sparkles size={18} />,
  },
  {
    value: 'artwork',
    label: 'Artwork',
    description: 'Official artwork illustrations (high-res)',
    icon: <Image size={18} />,
  },
];

export const Header: React.FC<HeaderProps> = ({ onNavigate, hasActiveSave }) => {
  const { mode, toggleMode, getGameTheme } = useTheme();
  const { mode: spriteMode, setMode: setSpriteMode } = useSpriteMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // G1: Sidebar drawer accessibility
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const { modalRef: drawerRef, handleKeyDown: drawerKeyDown, modalProps: drawerProps, headingId: drawerHeadingId } = useModalA11y({
    isOpen: isMenuOpen,
    onClose: closeMenu,
    lockScroll: true,
    inertBackground: true,
  });
  
  const theme = getGameTheme();
  const isLightTheme = theme?.id === 'yellow' || theme?.id === 'gold' || theme?.id === 'silver' || theme?.id === 'crystal';
  
  const iconColor = isLightTheme ? 'text-yellow-500' : 'text-red-500';

  // Close settings panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSettingsOpen]);

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

            {/* Active Sprite Mode Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-current/10 border border-current/10">
              {spriteMode === 'game-specific' ? <Gamepad2 size={12} /> : spriteMode === 'artwork' ? <Image size={12} /> : <Sparkles size={12} />}
              <span className="hidden md:inline">{spriteMode === 'game-specific' ? 'Game' : spriteMode === 'artwork' ? 'Art' : 'Master'}</span>
            </div>

            {/* Dark Mode Toggle — UX-A04 fix: added `title` for sighted users
                who see only an icon and need a hover tooltip to know what it does. */}
            <button 
              onClick={toggleMode}
              className="p-2 rounded-full hover:bg-current/10 active:scale-95 transition-all"
              aria-label="Toggle Theme"
              title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {mode === 'light' ? <Moon size={24} /> : <Sun size={24} />}
            </button>

            {/* Settings Icon — UX-A04 fix: added `title` tooltip. */}
            <div className="relative" ref={settingsRef}>
              <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-2 rounded-full hover:bg-current/10 active:scale-95 transition-all ${isSettingsOpen ? 'bg-current/15' : ''}`}
                aria-label="Settings"
                title="Sprite Settings"
              >
                <Settings size={22} className={`transition-transform duration-300 ${isSettingsOpen ? 'rotate-90' : ''}`} />
              </button>

              {/* Settings Popup Panel */}
              {isSettingsOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[2000] animate-in slide-in-from-top-2 duration-200">
                  {/* Panel Header */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2">
                      <Settings size={16} className="text-gray-400" />
                      <h3 className="font-black text-sm text-gray-800 dark:text-white uppercase tracking-wider">Sprite Settings</h3>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">Choose how Pokemon sprites appear throughout the app</p>
                  </div>

                  {/* Mode Options */}
                  <div className="p-3 space-y-2">
                    {SPRITE_MODE_OPTIONS.map((opt) => {
                      const isActive = spriteMode === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => { setSpriteMode(opt.value); }}
                          className={`
                            w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-3 transition-all border-2
                            ${isActive
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-sm'
                              : 'bg-gray-50 dark:bg-gray-800/50 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                            }
                          `}
                        >
                          {/* Radio Indicator */}
                          <div className={`
                            mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                            ${isActive ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'}
                          `}>
                            {isActive && <Check size={12} className="text-white" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-sm ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                {opt.label}
                              </span>
                              <span className={`text-gray-400 ${isActive ? 'text-blue-500' : ''}`}>
                                {opt.icon}
                              </span>
                              {opt.value === 'game-specific' && (
                                <span className="text-[9px] font-bold uppercase bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">Default</span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{opt.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Preview Hint */}
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-400 text-center font-medium">
                      Sprites update instantly across all views
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Menu — UX-A04 fix: added `title` tooltip. */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-full hover:bg-current/10 active:scale-95 transition-all"
              aria-label="Open Menu"
              title="Open Menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Hamburger Menu Overlay & Sidebar */}
      {isMenuOpen && (
        <ModalPortal>
        <div className="fixed inset-0 z-[1000] flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closeMenu}
          ></div>

          {/* Sidebar Drawer */}
          <div
            ref={drawerRef as React.RefObject<HTMLDivElement>}
            {...drawerProps}
            aria-labelledby={drawerHeadingId}
            className="relative w-80 h-full bg-white dark:bg-gray-950 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-200 dark:border-gray-800"
            onKeyDown={drawerKeyDown}
          >

            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <span id={drawerHeadingId} className="font-black text-lg text-gray-800 dark:text-white uppercase tracking-wide">Menu</span>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Close Menu"
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
                  {/* UX-U01 fix: corrected the repository URL from BilKos-PC to
                      BilKos-PC-Reborn (the actual repo name). Both links were 404. */}
                  <a 
                    href="https://github.com/BilKoChal/BilKos-PC-Reborn" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-gray-600 dark:text-gray-300 font-medium text-sm"
                  >
                    <Github size={18} />
                    GitHub Repository
                  </a>
                  <a 
                    href="https://github.com/BilKoChal/BilKos-PC-Reborn/issues" 
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
                  <p className="text-xs text-gray-500">Gen 1 &amp; 2 Save Editor</p>
                </div>
              </div>
            </div>

          </div>
        </div>
        </ModalPortal>
      )}
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { Section, Language } from '../types';
import { translations } from '../translations';
import {
  Menu, X, Home, User, Briefcase, BookOpen,
  Mail, Calendar, Image as ImageIcon, Globe,
  ChevronDown, ArrowRight, Lock
} from 'lucide-react';

interface NavigationProps {
  currentSection: Section;
  onNavigate: (section: Section) => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

interface NavItem {
  id: string;
  label: string;
  isSubmenu?: boolean;
  children?: { id: Section; label: string }[];
}

export const Navigation: React.FC<NavigationProps> = ({ currentSection, onNavigate, lang, setLang }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSubmenuOpen, setIsMobileSubmenuOpen] = useState(true);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const t = translations[lang].nav;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navStructure: NavItem[] = [
    { id: Section.HOME, label: t.home },
    { id: Section.ABOUT, label: t.about },
    {
      id: 'trayectoria',
      label: t.career,
      isSubmenu: true,
      children: [
        { id: Section.EXPERIENCE, label: t.experience },
        { id: Section.RESEARCH, label: t.research },
      ]
    },
    { id: Section.PERFORMANCES, label: t.performances },
    { id: Section.GALLERY, label: t.gallery },
    // { id: Section.RESOURCES, label: t.resources },
    { id: Section.BLOG, label: t.blog },
    { id: Section.CONTACT, label: t.contact },
  ];

  const handleNavigate = (section: Section) => {
    onNavigate(section);
    setIsMobileMenuOpen(false);
  };

  const isTrayectoriaActive = [Section.EXPERIENCE, Section.RESEARCH].includes(currentSection);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 border-b border-transparent ${isScrolled
          ? 'bg-maestro-dark/90 backdrop-blur-xl border-white/5 py-4 shadow-2xl'
          : 'bg-transparent py-8'
          } `}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <div
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => handleNavigate(Section.HOME)}
          >
            <div className="w-11 h-11 flex items-center justify-center bg-white/10 border border-white/20 rounded-full p-0 shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:border-maestro-gold/50 overflow-hidden">
              <img
                src="/images/logo-portada.png"
                alt="Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(212,175,55,0.4)] scale-125 transition-transform duration-500"
              />
            </div>
            <span className="text-2xl font-serif font-bold tracking-wide text-maestro-light hidden md:block">
              DIEGO <span className="text-maestro-gold">CARRIÓN G.</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex space-x-8 items-center">
            {navStructure.map((item) => {
              if (item.isSubmenu && item.children) {
                return (
                  <div key={item.id} className="relative group">
                    <button
                      className={`flex items-center gap-1 text-[10px] xl:text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:text-maestro-gold drop-shadow-sm ${isTrayectoriaActive
                        ? 'text-maestro-gold font-bold border-b border-maestro-gold pb-1'
                        : 'text-maestro-light/90'
                        } `}
                    >
                      {item.label}
                      <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                      <div className="bg-maestro-dark border border-white/10 p-2 min-w-[180px] shadow-2xl rounded-sm">
                        {item.children.map(child => (
                          <button
                            key={child.id}
                            onClick={() => handleNavigate(child.id)}
                            className={`block w-full text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-white/5 hover:text-maestro-gold transition-colors ${currentSection === child.id ? 'text-maestro-gold' : 'text-maestro-light/90'
                              } `}
                          >
                            {child.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id as Section)}
                  className={`text-[10px] xl:text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:text-maestro-gold drop-shadow-sm ${currentSection === item.id
                    ? 'text-maestro-gold font-bold border-b border-maestro-gold pb-1'
                    : 'text-maestro-light/90'
                    } `}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="text-[10px] xl:text-xs tracking-[0.2em] uppercase transition-all duration-300 text-maestro-light/90 hover:text-maestro-gold flex items-center gap-2 border-l border-white/10 pl-6 drop-shadow-sm"
              >
                <Globe size={12} /> {lang.toUpperCase()}
              </button>
              {isLangMenuOpen && (
                <div className="absolute top-full right-0 mt-4 bg-maestro-dark border border-white/10 p-2 shadow-xl">
                  {(['es', 'en', 'ru'] as Language[]).map(l => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setIsLangMenuOpen(false); }}
                      className={`block w-full text-left px-4 py-2 text-[10px] uppercase hover:bg-white/5 ${lang === l ? 'text-maestro-gold font-bold' : 'text-maestro-light/60'} `}
                    >
                      {l === 'es' ? 'Español' : l === 'en' ? 'English' : 'Русский'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Login Button Desktop */}
            <button
              onClick={() => handleNavigate(Section.ADMIN)}
              className={`text-[10px] xl:text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:text-maestro-gold flex items-center gap-2 border border-white/10 px-3 py-1 rounded-sm ${currentSection === Section.ADMIN
                ? 'text-maestro-gold border-maestro-gold'
                : 'text-maestro-light/50'
                } `}
              title={t.admin}
            >
              <Lock size={12} />
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden text-maestro-light hover:text-maestro-gold transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden overflow-hidden ${isMobileMenuOpen ? 'visible' : 'invisible'} `}
      >
        {/* Darkened Backdrop (Left side) */}
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-700 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'} `}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Panel (Right side) */}
        <div
          className={`absolute top-0 right-0 h-full w-[65%] sm:w-[40%] bg-maestro-dark/95 backdrop-blur-2xl border-l border-white/5 shadow-2xl transition-transform duration-700 cubic-bezier(0.7, 0, 0.3, 1) ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} `}
        >
          <div className="relative h-full flex flex-col">
            {/* Header in Overlay */}
            <div className="flex justify-between items-center px-6 py-8">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 flex items-center justify-center bg-white/10 border border-white/20 rounded-full p-0 shadow-sm overflow-hidden">
                  <img
                    src="/images/logo-portada.png"
                    alt="Logo"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(212,175,55,0.4)] scale-125"
                  />
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-maestro-light hover:text-maestro-gold transition-colors p-2"
              >
                <X size={32} />
              </button>
            </div>

            <div className="px-8 pb-12 flex flex-col flex-grow overflow-y-auto">
              {/* Mobile Language Switcher */}
              <div
                className="flex gap-4 mb-10 transition-all duration-700 delay-100 transform"
                style={{
                  opacity: isMobileMenuOpen ? 1 : 0,
                  transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)'
                }}
              >
                {(['es', 'en', 'ru'] as Language[]).map((l, index) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`text-[10px] uppercase tracking-[0.2em] relative py-2 ${lang === l ? 'text-maestro-gold font-bold' : 'text-maestro-light/40'} `}
                  >
                    {l === 'es' ? 'Esp' : l === 'en' ? 'Eng' : 'Рус'}
                    {lang === l && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-maestro-gold" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex flex-col space-y-6">
                {navStructure.map((item, index) => {
                  const isActive = item.isSubmenu ? isTrayectoriaActive : currentSection === item.id;

                  if (item.isSubmenu && item.children) {
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col items-start w-full group transition-all duration-700 transform"
                        style={{
                          opacity: isMobileMenuOpen ? 1 : 0,
                          transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(15px)',
                          transitionDelay: `${(index + 2) * 100}ms`
                        }}
                      >
                        <button
                          onClick={() => setIsMobileSubmenuOpen(!isMobileSubmenuOpen)}
                          className={`text-2xl font-serif transition-all duration-500 flex items-center justify-between w-full hover:text-maestro-gold ${isActive ? 'text-maestro-gold' : 'text-maestro-light'} `}
                        >
                          <span className="flex items-center gap-4">
                            {item.label}
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-maestro-gold animate-pulse" />}
                          </span>
                          <ChevronDown
                            size={18}
                            className={`transition-transform duration-500 text-maestro-gold/50 ${isMobileSubmenuOpen ? 'rotate-180' : ''} `}
                          />
                        </button>

                        <div className={`
w-full pl-4 flex flex-col space-y-4 overflow-hidden transition-all duration-500 ease-in-out
                            ${isMobileSubmenuOpen ? 'max-h-[300px] mt-4 opacity-100' : 'max-h-0 opacity-0'}
`}>
                          {item.children.map(child => (
                            <button
                              key={child.id}
                              onClick={() => handleNavigate(child.id)}
                              className={`text-base font-serif text-left transition-all duration-300 hover:text-maestro-gold ${currentSection === child.id ? 'text-maestro-gold italic pl-3 border-l border-maestro-gold' : 'text-maestro-light/60'} `}
                            >
                              {child.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id as Section)}
                      className={`text-2xl font-serif text-left transition-all duration-700 transform group ${currentSection === item.id ? 'text-maestro-gold italic' : 'text-maestro-light'} `}
                      style={{
                        opacity: isMobileMenuOpen ? 1 : 0,
                        transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(15px)',
                        transitionDelay: `${(index + 2) * 100}ms`
                      }}
                    >
                      <span className="flex items-center gap-4 hover:translate-x-1 transition-transform duration-300">
                        {item.label}
                        {currentSection === item.id && <span className="w-1.5 h-1.5 rounded-full bg-maestro-gold animate-pulse" />}
                      </span>
                    </button>
                  );
                })}

                {/* Admin Link */}
                <button
                  onClick={() => handleNavigate(Section.ADMIN)}
                  className="text-[10px] uppercase tracking-[0.2em] text-left transition-all duration-700 transform flex items-center gap-3 pt-4 border-t border-white/5 w-full text-maestro-light/30 hover:text-maestro-gold"
                  style={{
                    opacity: isMobileMenuOpen ? 1 : 0,
                    transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(15px)',
                    transitionDelay: `${(navStructure.length + 2) * 100}ms`
                  }}
                >
                  <Lock size={12} /> {t.admin}
                </button>
              </div>

              {/* Mobile Footer Section */}
              <div
                className="mt-auto pt-10 text-center transition-all duration-700 transform"
                style={{
                  opacity: isMobileMenuOpen ? 1 : 0,
                  transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(15px)',
                  transitionDelay: `${(navStructure.length + 4) * 100}ms`
                }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="h-px w-8 bg-maestro-gold/30" />
                  <span className="text-[9px] uppercase tracking-[0.3em] text-maestro-light/20">
                    Diego Carrión Granda
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
import React, { useState, useEffect } from 'react';
import { Section, Language } from '../types';
import { translations } from '../translations';
import { Menu, X, ChevronDown, Lock, Globe } from 'lucide-react';

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
        { id: Section.PERFORMANCES, label: t.performances },
      ]
    },
    { id: Section.GALLERY, label: t.gallery },
    { id: Section.RESOURCES, label: t.resources },
    { id: Section.BLOG, label: t.blog },
    { id: Section.CONTACT, label: t.contact },
  ];

  const handleNavigate = (section: Section) => {
    onNavigate(section);
    setIsMobileMenuOpen(false);
  };

  const isTrayectoriaActive = [Section.EXPERIENCE, Section.RESEARCH, Section.PERFORMANCES].includes(currentSection);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 border-b border-transparent ${isScrolled
        ? 'bg-maestro-dark/90 backdrop-blur-xl border-white/5 py-4 shadow-2xl'
        : 'bg-transparent py-8'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => handleNavigate(Section.HOME)}
        >
          <div className="w-10 h-10 rounded-full border border-maestro-gold flex items-center justify-center bg-maestro-gold/10 group-hover:bg-maestro-gold transition-all duration-500">
            <span className="font-serif font-bold text-maestro-gold group-hover:text-maestro-dark text-lg">DC</span>
          </div>
          <span className="text-2xl font-serif font-bold tracking-wide text-maestro-light hidden md:block">
            DIEGO <span className="text-maestro-gold">CARRIÓN</span>
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
                      }`}
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
                            }`}
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
                  }`}
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
                    className={`block w-full text-left px-4 py-2 text-[10px] uppercase hover:bg-white/5 ${lang === l ? 'text-maestro-gold font-bold' : 'text-maestro-light/60'}`}
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
              }`}
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

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black z-40 flex flex-col pt-32 px-10 space-y-6 transition-transform duration-700 cubic-bezier(0.7, 0, 0.3, 1) lg:hidden overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-8 right-8 text-maestro-light hover:text-maestro-gold"
        >
          <X size={32} />
        </button>

        {/* Mobile Language Switcher */}
        <div className="flex gap-4 border-b border-white/10 pb-4">
          {(['es', 'en', 'ru'] as Language[]).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`text-sm uppercase tracking-widest ${lang === l ? 'text-maestro-gold font-bold' : 'text-maestro-light/40'}`}
            >
              {l}
            </button>
          ))}
        </div>

        {navStructure.map((item) => {
          if (item.isSubmenu && item.children) {
            return (
              <div key={item.id} className="flex flex-col items-start w-full border-b border-white/5 pb-4">
                <button
                  onClick={() => setIsMobileSubmenuOpen(!isMobileSubmenuOpen)}
                  className={`text-3xl font-serif transition-colors duration-300 flex items-center justify-between w-full ${isTrayectoriaActive ? 'text-maestro-gold' : 'text-maestro-light'
                    }`}
                >
                  {item.label}
                  <ChevronDown
                    size={24}
                    className={`transition-transform duration-300 ${isMobileSubmenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <div className={`
                    w-full pl-6 flex flex-col space-y-4 overflow-hidden transition-all duration-500 ease-in-out
                    ${isMobileSubmenuOpen ? 'max-h-[300px] mt-4 opacity-100' : 'max-h-0 opacity-0'}
                 `}>
                  {item.children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => handleNavigate(child.id)}
                      className={`text-lg font-serif text-left transition-colors duration-300 ${currentSection === child.id ? 'text-maestro-gold italic' : 'text-maestro-light/60'
                        }`}
                    >
                      — {child.label}
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
              className={`text-3xl font-serif text-left transition-colors duration-300 border-b border-white/5 pb-4 w-full ${currentSection === item.id ? 'text-maestro-gold italic' : 'text-maestro-light'
                }`}
            >
              {item.label}
            </button>
          );
        })}

        {/* Mobile Admin Link */}
        <button
          onClick={() => handleNavigate(Section.ADMIN)}
          className={`text-xl font-serif text-left transition-colors duration-300 pt-4 w-full flex items-center gap-3 ${currentSection === Section.ADMIN ? 'text-maestro-gold italic' : 'text-maestro-light/50'
            }`}
        >
          <Lock size={20} /> {t.admin}
        </button>

      </div>
    </nav>
  );
};
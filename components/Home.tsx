import React, { useEffect, useState } from 'react';
import { ChevronDown, ArrowRight, Music2, BookOpen, Briefcase, Calendar } from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../src/firebase';
import { Section, Language, ExperienceItem, Performance } from '../types';
import { translations } from '../translations';
import { FadeIn } from './FadeIn';
import { transformDataForLang } from '../src/services/db';

interface HomeProps {
  onNavigate: (section: Section) => void;
  lang: Language;
  experienceItems: ExperienceItem[];
  performanceItems: Performance[];
}

export const Home: React.FC<HomeProps> = ({ onNavigate, lang, experienceItems, performanceItems }) => {
  const t = translations[lang].home;
  const tExp = translations[lang].experience;
  const [offsetY, setOffsetY] = useState(0);

  // Parallax effect logic
  useEffect(() => {
    const handleScroll = () => setOffsetY(window.pageYOffset);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // MiniCalendar Component Helper
  const MiniCalendar = () => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [hoveredEvent, setHoveredEvent] = useState<Performance | null>(null);

    const monthNames = translations[lang].calendar.months;

    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

    const days = [];
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    // Empty slots before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const getDynamicStatus = (perf: Performance): 'upcoming' | 'past' => {
      // 1. Prefer dateISO if available
      if (perf.dateISO) {
        const eventDate = new Date(perf.dateISO);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today ? 'upcoming' : 'past';
      }

      // 2. Legacy fallback: Attempt to parse the date string (format "DD MMM YYYY")
      try {
        // Prioritize date_raw (always Spanish) if available from transformation, 
        // otherwise try localized versions or current string
        const dateStr = (perf as any).date_raw || (perf.date as any)?.es || (perf.date as any)?.en || (typeof perf.date === 'string' ? perf.date : '');

        if (dateStr && typeof dateStr === 'string') {
          const parts = dateStr.trim().split(' ');
          if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const monthStr = parts[1].toLowerCase().replace('.', '');
            const year = parseInt(parts[2]);

            if (!isNaN(day) && !isNaN(year)) {
              const months: Record<string, number> = {
                // Spanish
                'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5, 'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11,
                // English
                'jan': 0, 'apr': 3, 'aug': 7, 'dec': 11,
                // Russian (Transliterated/Common)
                'янв': 0, 'фев': 1, 'апр': 3, 'май': 4, 'июн': 5, 'июл': 6, 'авг': 7, 'сен': 8, 'окт': 9, 'ноя': 10, 'дек': 11
              };

              const month = months[monthStr.substring(0, 3)];
              if (month !== undefined) {
                const eventDate = new Date(year, month, day);
                return eventDate >= today ? 'upcoming' : 'past';
              }
            }
          }
        }
      } catch (e) { }

      return perf.status;
    };

    const hasEvent = (day: number) => {
      return performanceItems.some(perf => {
        if (perf.dateISO) {
          const d = new Date(perf.dateISO);
          return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }
        const perfDate = new Date((perf as any).date_raw || perf.date);
        return perfDate.getDate() === day && perfDate.getMonth() === currentMonth && perfDate.getFullYear() === currentYear;
      });
    };

    const getEventForDay = (day: number) => {
      return performanceItems.find(perf => {
        if (perf.dateISO) {
          const d = new Date(perf.dateISO);
          return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }
        const perfDate = new Date((perf as any).date_raw || perf.date);
        return perfDate.getDate() === day && perfDate.getMonth() === currentMonth && perfDate.getFullYear() === currentYear;
      });
    };

    return (
      <div className="relative max-w-md mx-auto bg-maestro-dark/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl overflow-visible">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-serif text-maestro-gold tracking-widest">{monthNames[currentMonth]} {currentYear}</h3>
          <div className="flex gap-2">
            <button onClick={() => setCurrentMonth(prev => prev === 0 ? 11 : prev - 1)} className="text-white/40 hover:text-maestro-gold transition-colors">
              <ChevronDown size={20} className="rotate-90" />
            </button>
            <button onClick={() => setCurrentMonth(prev => prev === 11 ? 0 : prev + 1)} className="text-white/40 hover:text-maestro-gold transition-colors">
              <ChevronDown size={20} className="-rotate-90" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-[10px] uppercase tracking-tighter text-white/40 mb-4 font-bold">
          {translations[lang].calendar.days.map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-y-3 relative">
          {days.map((day, idx) => {
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            const event = day ? getEventForDay(day) : null;

            return (
              <div
                key={idx}
                className={`
                  h-10 flex items-center justify-center text-sm relative cursor-default
                  ${day ? 'hover:text-maestro-gold transition-colors' : ''}
                  ${isToday ? 'text-maestro-gold font-bold' : 'text-white/80'}
                `}
                onMouseEnter={() => event && setHoveredEvent(event)}
                onMouseLeave={() => setHoveredEvent(null)}
              >
                {day}
                {event && (
                  <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)] animate-pulse ${getDynamicStatus(event) === 'upcoming' ? 'bg-maestro-gold' : 'bg-white/20 shadow-none'}`} />
                )}

                {/* Tooltip Popup */}
                {hoveredEvent === event && event && day && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-4 w-64 z-50 animate-fade-in pointer-events-auto">
                    <div className="bg-maestro-dark border border-maestro-gold/40 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                      {(event.images?.[0] || event.image) && (
                        <div className="h-24 w-full relative">
                          <img src={event.images?.[0] || event.image} alt={event.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-maestro-dark to-transparent" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="absolute top-2 right-2 w-4 h-4 bg-maestro-dark border-r border-b border-maestro-gold/40 rotate-45 -mb-2" />
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] uppercase tracking-widest text-maestro-gold font-bold block">{event.date}</span>
                          <span className={`text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded border ${getDynamicStatus(event) === 'upcoming' ? 'text-maestro-gold border-maestro-gold/30' : 'text-white/30 border-white/10'}`}>
                            {getDynamicStatus(event) === 'upcoming' ? translations[lang].performances.statusUpcoming : translations[lang].performances.statusPast}
                          </span>
                        </div>
                        <h4 className="text-sm font-serif text-white mb-1 leading-tight">{event.title}</h4>
                        <p className="text-[10px] text-white/50 mb-2">{event.location}</p>
                        <button
                          onClick={() => onNavigate(Section.PERFORMANCES)}
                          className="text-[10px] uppercase tracking-[0.2em] font-bold text-maestro-gold hover:text-white transition-colors flex items-center gap-2 group"
                        >
                          {translations[lang].calendar.viewDetails}
                          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">

      {/* 1. CINEMATIC HERO SECTION WITH CONDUCTOR PHOTO */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-maestro-dark">

        {/* Orchestra Background - Full Width */}
        <div className="absolute inset-0 z-0">
          {/* Main Orchestra Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
            style={{
              backgroundImage: `url('/images/section-portada.webp')`,
              transform: `scale(${1 + offsetY * 0.0002})`,
            }}
          />

          {/* Dramatic Gradient Overlays - Even Lighter */}
          <div className="absolute inset-0 bg-maestro-dark/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-maestro-dark/80 via-transparent to-maestro-dark/70" />
          <div className="absolute inset-0 bg-black/20" />

          {/* Animated Gold Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-maestro-gold/10 via-transparent to-transparent animate-pulse-slow" />

          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)',
              backgroundSize: '80px 80px'
            }}
          />
        </div>



        {/* Main Content Container - Two Column Layout with Left-Aligned Branding */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
          <div className="grid grid-cols-1 gap-10 md:gap-12 lg:gap-16 xl:gap-20 items-center w-full py-24 md:py-20 lg:py-0">

            {/* LEFT SIDE - Branding Content */}
            <div className="text-center space-y-0 order-2 lg:order-1 flex flex-col items-center justify-center w-full">
              <FadeIn>

                {/* 1. New Central/Left Logo */}
                <div className="relative mb-0 group w-full flex justify-center">
                  <div className="absolute -inset-6 bg-maestro-gold/10 blur-2xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-1000" />
                  <img
                    src="/images/logo-portada.png"
                    alt="Diego Carrión G. Logo"
                    className="w-52 h-52 md:w-72 md:h-72 xl:w-96 xl:h-96 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  />
                </div>

                {/* 2. Main Title - Red Vibrant Name (Single Line) */}
                <div className="relative -mt-20 md:-mt-28 mb-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-serif leading-tight drop-shadow-2xl tracking-tight">
                    <span className="text-[#C41E3A] animate-fade-in-up uppercase font-bold whitespace-nowrap" style={{ animationDelay: '0.1s' }}>
                      Diego Carrión G.
                    </span>
                  </h1>
                </div>

                {/* 3. Role / Subtitle - White Serif */}
                <div className="space-y-4">
                  <p className="text-maestro-light text-base sm:text-lg md:text-xl lg:text-2xl font-serif italic leading-relaxed drop-shadow-xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    {t.role}
                  </p>
                  {/* Intro Quote - Lighter */}
                  <p className="text-maestro-light/60 text-sm sm:text-base md:text-lg font-serif italic animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    {t.intro}
                  </p>
                </div>

                {/* 4. Animated Divider */}
                <div className="relative h-px w-24 md:w-32 lg:w-40 mx-auto lg:mx-0 group mt-8 mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-maestro-gold via-maestro-gold/60 to-transparent" />
                  <div className="absolute inset-0 bg-maestro-gold blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* 5. CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2 animate-fade-in-up justify-center" style={{ animationDelay: '0.7s' }}>
                  <button
                    onClick={() => onNavigate(Section.RESEARCH)}
                    className="group relative px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-maestro-gold to-[#c9a961] text-maestro-dark font-bold hover:shadow-2xl hover:shadow-maestro-gold/50 transition-all duration-500 uppercase tracking-widest text-[10px] md:text-xs overflow-hidden rounded-sm"
                  >
                    <span className="relative z-10">{t.ctaWork}</span>
                    <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    <span className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 flex items-center justify-center text-maestro-dark font-bold transition-opacity duration-500">
                      {t.ctaWork}
                    </span>
                  </button>
                  <button
                    onClick={() => onNavigate(Section.CONTACT)}
                    className="group relative px-8 md:px-10 py-3 md:py-4 border-2 border-maestro-gold/50 text-maestro-light hover:border-maestro-gold hover:text-maestro-gold transition-all duration-500 uppercase tracking-widest text-[10px] md:text-xs backdrop-blur-md bg-black/30 hover:bg-black/50 overflow-hidden rounded-sm"
                  >
                    <span className="relative z-10">{t.ctaContact}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-maestro-gold/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </button>
                </div>
              </FadeIn>
            </div>

            {/* RIGHT SIDE - Conductor Photo - TEMPORARILY REMOVED
            <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
              <FadeIn delay={200}>
                <div className="relative group w-56 sm:w-64 md:w-72 lg:w-68 xl:w-76 2xl:w-[24rem]">
                  <div className="absolute -inset-3 md:-inset-4 bg-gradient-to-br from-maestro-gold/30 via-maestro-gold/10 to-transparent blur-2xl md:blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700" />

                  <div className="relative overflow-hidden rounded-sm">
                    <img
                      src="/images/diego-home.webp"
                      alt="Diego Carrión Granda - Director y Musicólogo"
                      className="w-full h-auto object-contain group-hover:scale-105 transition-all duration-1000 shadow-2xl"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-maestro-dark via-transparent to-transparent opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-br from-maestro-gold/5 via-transparent to-transparent" />

                    <div className="absolute inset-0 border-2 border-maestro-gold/20 group-hover:border-maestro-gold/40 transition-colors duration-500" />
                  </div>

                  <div className="absolute -top-2 -left-2 w-8 h-8 md:w-10 md:h-10 border-l-2 border-t-2 border-maestro-gold opacity-60" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 border-r-2 border-b-2 border-maestro-gold opacity-60" />

                  <div className="absolute -bottom-3 md:-bottom-4 -right-3 md:-right-4 bg-maestro-dark/90 backdrop-blur-sm border border-maestro-gold/30 px-3 md:px-4 py-1.5 md:py-2 hidden md:block">
                    <p className="text-maestro-gold text-[10px] md:text-xs font-bold tracking-widest uppercase">{t.conductorTag}</p>
                  </div>
                </div>
              </FadeIn>
            </div>
            */}

          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center gap-2 animate-bounce-slow cursor-pointer group"
          onClick={() => document.getElementById('about-preview')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <div className="relative">
            <ChevronDown size={24} className="text-maestro-gold opacity-60 group-hover:opacity-100 transition-opacity" />
            <ChevronDown size={24} className="text-maestro-gold absolute top-2 opacity-20 animate-bounce" />
          </div>
        </div>

        {/* Decorative Corner Elements */}
        <div className="absolute top-6 left-6 w-20 h-20 border-l border-t border-maestro-gold/15 z-20 hidden xl:block" />
        <div className="absolute bottom-6 right-6 w-20 h-20 border-r border-b border-maestro-gold/15 z-20 hidden xl:block" />
      </section>

      {/* ABOUT PREVIEW SECTION - Elegant Introduction */}
      <section id="about-preview" className="relative py-80 px-6 bg-maestro-dark overflow-hidden">
        {/* Orchestra Background Image - Local section-header2.jpg - Lightened */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="/images/section-header2.webp"
            alt="Fondo Seccíon Sobre Mí"
            className="w-full h-full object-cover opacity-80 grayscale mix-blend-overlay"
          />
          {/* Top Fade to match Hero's Bottom Fade */}
          <div className="absolute inset-0 bg-gradient-to-b from-maestro-dark via-transparent to-transparent h-48" />

          <div className="absolute inset-0 bg-gradient-to-t from-maestro-dark/60 via-maestro-dark/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-maestro-dark/40 via-transparent to-maestro-dark/40" />
        </div>

        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-maestro-gold/5 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px] opacity-20 pointer-events-none z-0" />
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Centered Title Section */}
          <FadeIn>
            <div className="text-center space-y-4">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-maestro-light leading-tight drop-shadow-2xl">
                {t.aboutTitle}
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-maestro-gold to-transparent mx-auto rounded-full" />
            </div>
          </FadeIn>

          <div className="max-w-4xl mx-auto">
            {/* Centered Bio & Text */}
            <FadeIn delay={100}>
              <div className="text-center space-y-8">
                <h3 className="text-3xl md:text-4xl font-serif text-maestro-light/90 leading-tight">
                  {t.aboutHeading}
                </h3>

                {/* Bio Preview Text */}
                <div className="space-y-6 text-lg text-maestro-light/80 font-light leading-relaxed font-serif italic relative z-10">
                  <p>{t.aboutText1}</p>
                </div>

                {/* Read More Button */}
                <div className="pt-4 relative z-10 flex justify-center">
                  <button
                    onClick={() => onNavigate(Section.ABOUT)}
                    className="group relative inline-flex items-center gap-3 px-8 py-3 overflow-hidden rounded-full border border-maestro-gold/30 hover:border-maestro-gold/60 transition-all duration-300"
                  >
                    <span className="text-maestro-gold uppercase tracking-widest text-xs font-bold group-hover:text-white transition-colors">
                      {t.readBio}
                    </span>
                    <ArrowRight size={16} className="text-maestro-gold group-hover:text-white group-hover:translate-x-1 transition-all" />
                    <div className="absolute inset-0 bg-maestro-gold/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left -z-10" />
                  </button>
                </div>
              </div>
            </FadeIn>

            {/* Right Column: Stats Grid - Commented out for now
            <FadeIn delay={200} className="relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-maestro-dark/80 backdrop-blur-md border border-maestro-gold/20 p-6 rounded-lg text-left hover:border-maestro-gold/50 transition-colors group h-full">
                  <Music2 className="text-maestro-gold w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-2xl font-bold text-white mb-1">20+ <span className="text-sm font-normal text-maestro-light/60">{lang === 'es' ? 'Años' : lang === 'en' ? 'Years' : 'Лет'}</span></h4>
                  <p className="text-xs text-maestro-light/50 uppercase tracking-wider">{lang === 'es' ? 'De experiencia musical' : lang === 'en' ? 'Of musical experience' : 'Музыкального опыта'}</p>
                </div>

                <div className="bg-maestro-dark/80 backdrop-blur-md border border-maestro-gold/20 p-6 rounded-lg text-left hover:border-maestro-gold/50 transition-colors group h-full">
                  <BookOpen className="text-maestro-gold w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xl font-bold text-white mb-1">PhD <span className="text-sm font-normal text-maestro-light/60">{lang === 'es' ? 'Candidato' : lang === 'en' ? 'Candidate' : 'Кандидат'}</span></h4>
                  <p className="text-xs text-maestro-light/50 uppercase tracking-wider">{lang === 'es' ? 'En Musicología' : lang === 'en' ? 'In Musicology' : 'В музыковедении'}</p>
                </div>

                <div className="bg-maestro-dark/80 backdrop-blur-md border border-maestro-gold/20 p-6 rounded-lg text-left hover:border-maestro-gold/50 transition-colors group h-full">
                  <Briefcase className="text-maestro-gold w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-2xl font-bold text-white mb-1">25+ <span className="text-sm font-normal text-maestro-light/60">{lang === 'es' ? 'Conciertos' : lang === 'en' ? 'Concerts' : 'Концертов'}</span></h4>
                  <p className="text-xs text-maestro-light/50 uppercase tracking-wider">{lang === 'es' ? 'Internacionales' : lang === 'en' ? 'International' : 'Международных'}</p>
                </div>

                <div className="bg-maestro-dark/80 backdrop-blur-md border border-maestro-gold/20 p-6 rounded-lg text-left hover:border-maestro-gold/50 transition-colors group h-full">
                  <div className="text-maestro-gold w-8 h-8 mb-4 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-1">{lang === 'es' ? 'Pasión' : lang === 'en' ? 'Passion' : 'Страсть'}</h4>
                  <p className="text-xs text-maestro-light/50 uppercase tracking-wider">{lang === 'es' ? 'Por la enseñanza' : lang === 'en' ? 'For teaching' : 'К преподаванию'}</p>
                </div>
              </div>
            </FadeIn>
            */}
          </div>
        </div>
        {/* Seamless transition to next section */}
        <div className="absolute bottom-0 left-0 w-full h-48 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-maestro-dark via-maestro-dark/40 to-transparent" />
        </div>
      </section>



      {/* 3. EXPERIENCE SECTION (Timeline ) - Commented out for now
      <section id="experience" className="py-24 px-6 bg-maestro-navy relative overflow-hidden">
        <div className="absolute inset-0  z-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-75 mix-blend-soft-light grayscale"
            style={{
              backgroundImage: `url('/images/section-experience.webp')`,
              WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 20%, black 80%, transparent 100%)',
              maskImage: 'linear-gradient(to top, transparent 0%, black 20%, black 80%, transparent 100%)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-maestro-navy/95 via-maestro-navy/50 to-maestro-navy/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-maestro-dark via-transparent to-transparent h-64" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-maestro-light leading-tight drop-shadow-2xl">
                {tExp.subtitle}
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-maestro-gold to-transparent mx-auto rounded-full" />
            </div>
          </FadeIn>

          <div className="relative">
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-maestro-gold/30 to-transparent"></div>

            <div className="space-y-6">
              {experienceItems.slice(0, 4).map((item: ExperienceItem, index: number) => (
                <FadeIn key={index} delay={index * 100}>
                  <div className={`flex flex-col md:flex-row gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} relative`}>
                    <div className="absolute left-[-5px] md:left-1/2 transform md:-translate-x-1/2 w-3 h-3 bg-maestro-gold rounded-full border-4 border-maestro-dark z-10 mt-6"></div>

                    <div className="md:w-1/2 flex justify-start md:justify-end pl-8 md:pl-0 md:pr-12">
                      <div className={`bg-maestro-dark/80 backdrop-blur-sm border border-maestro-gold/30 p-8 rounded-xl hover:border-maestro-gold/60 hover:shadow-[0_10px_40px_-10px_rgba(212,175,55,0.2)] hover:-translate-y-1 transition-all duration-500 w-full max-w-xl group relative overflow-hidden text-left`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Music2 size={40} className="text-maestro-gold" />
                        </div>

                        <span className="inline-flex items-center gap-2 text-maestro-gold font-bold text-sm tracking-wider mb-2">
                          <Calendar size={14} /> {item.year}
                        </span>

                        <h3 className="text-2xl font-serif text-white mb-1 transition-colors">{item.role}</h3>
                        <div className="flex items-center gap-2 text-white/50 text-sm mb-4">
                          <Briefcase size={14} /> {item.institution}
                        </div>

                        <p className="text-maestro-light/70 font-light leading-relaxed mb-6">
                          {item.description}
                        </p>

                        <button
                          onClick={() => onNavigate(Section.EXPERIENCE)}
                          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-maestro-gold hover:text-white transition-colors border-b border-maestro-gold/30 hover:border-white pb-1"
                        >
                          {tExp.viewDetails || 'Ver Experiencia'} <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="md:w-1/2 hidden md:block"></div>
                  </div>
                </FadeIn>
              ))}
            </div>

            {experienceItems.length > 4 && (
              <FadeIn delay={200}>
                <div className="text-center mt-16 relative z-10">
                  <button
                    onClick={() => onNavigate(Section.EXPERIENCE)}
                    className="group inline-flex items-center gap-3 px-8 py-3 rounded-full border border-maestro-gold/30 hover:bg-maestro-gold hover:text-maestro-dark transition-all duration-300"
                  >
                    <span className="text-maestro-gold font-bold uppercase tracking-widest text-xs group-hover:text-maestro-dark transition-colors">
                      {tExp.viewAll}
                    </span>
                    <ArrowRight size={16} className="text-maestro-gold group-hover:text-maestro-dark group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-b from-transparent to-maestro-dark pointer-events-none" />
      </section>
      */}

      {/* 4. RESEARCH SECTION - Opacity 70% - Commented out for now
      <section id="research" className="py-80 px-6 bg-maestro-emerald relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70 mix-blend-soft-light grayscale"
            style={{
              backgroundImage: `url('/images/section-research.webp')`,
              WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 20%, black 80%, transparent 100%)',
              maskImage: 'linear-gradient(to top, transparent 0%, black 20%, black 80%, transparent 100%)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-maestro-emerald/60 via-maestro-emerald/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-maestro-dark via-transparent to-transparent h-64 opacity-50" />

          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-b from-transparent to-maestro-dark z-10" />
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
          <FadeIn>
            <div className="space-y-6">
              <span className="text-maestro-gold uppercase tracking-widest text-sm font-bold">{t.resTitle}</span>
              <h2 className="text-4xl font-serif text-maestro-light">{t.resDesc}</h2>
              <button onClick={() => onNavigate(Section.RESEARCH)} className="inline-flex items-center gap-3 px-6 py-3 border border-maestro-gold/30 rounded-full text-maestro-gold hover:bg-maestro-gold hover:text-maestro-dark transition-all duration-300 mt-4">
                {t.readPapers} <ArrowRight size={16} />
              </button>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="bg-maestro-dark p-8 border border-white/5 rounded-lg relative">
              <BookOpen size={40} className="text-maestro-gold mb-6" />
              <p className="text-xl font-serif italic text-white/80">"{t.quote}"</p>
            </div>
          </FadeIn>
        </div>
      </section>
      */}

      <section id="performances" className="py-80 px-6 bg-maestro-wine relative overflow-hidden">
        {/* Cinematic Section Blending */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Background Image with Wine Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-overlay grayscale hover:grayscale-0 transition-all duration-1000"
            style={{
              backgroundImage: "url('/images/section-events.webp')",
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)'
            }}
          />
          {/* No top gradient needed here as the bridge is established in the previous section */}
        </div>
        {/* Main Content Container - Absolute Clarity Layer */}
        <div className="relative z-30 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* LEFT SIDE - Interactive Calendar (Mobile: Second / Desktop: First) */}
            <div className="order-2 lg:order-1">
              <FadeIn delay={200}>
                <div className="relative">
                  <div className="absolute -inset-4 bg-maestro-gold/5 blur-3xl rounded-full animate-pulse-slow" />
                  <MiniCalendar />
                </div>
              </FadeIn>
            </div>

            {/* RIGHT SIDE - Content (Mobile: First / Desktop: Second) */}
            <div className="order-1 lg:order-2">
              <FadeIn>
                <div className="text-center lg:text-left space-y-6">
                  <span className="text-maestro-gold uppercase tracking-[0.3em] text-xs font-bold block mb-2">{t.perfTitle}</span>
                  <h2 className="text-5xl font-serif text-white leading-tight">
                    {t.perfHeading1} <span className="text-maestro-gold italic">{t.perfHeading2}</span>
                  </h2>
                  <p className="text-xl text-white/90 font-serif italic max-w-xl mx-auto lg:mx-0">
                    {t.perfDesc}
                  </p>
                  <div className="pt-8 block">
                    <button
                      onClick={() => onNavigate(Section.PERFORMANCES)}
                      className="group inline-flex items-center gap-4 px-10 py-4 bg-maestro-gold/5 border border-maestro-gold/50 rounded-full text-maestro-gold hover:bg-maestro-gold hover:text-maestro-dark transition-all duration-500 font-bold uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(234,179,8,0.1)]"
                    >
                      {t.viewAgenda}
                      <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* Seamless transition to next section (Dark-Fixed/Footer) */}
        <div className="absolute bottom-0 left-0 w-full h-48 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-maestro-dark via-maestro-dark/40 to-transparent" />
        </div>
      </section>

      {/* 4. PARALLAX QUOTE */}
      <section className="relative py-80 flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <div className="absolute inset-0 bg-fixed bg-cover bg-center bg-no-repeat grayscale grayscale-0 transition-all duration-1000"
          style={{ backgroundImage: 'url("/images/section-text.webp")' }}>
          <div className="absolute inset-0 bg-maestro-dark/85"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <Music2 size={32} className="text-maestro-gold mx-auto mb-8 opacity-80" />
            <h2 className="text-3xl md:text-5xl font-serif italic text-maestro-light leading-snug mb-8">
              {t.quote}
            </h2>
            <p className="text-maestro-gold uppercase tracking-[0.2em] text-sm font-bold">
              — Wolfgang Amadeus Mozart
            </p>
          </FadeIn>
        </div>
      </section>

      {/* 5. LATEST UPDATE / FOOTER-ISH SECTION */}
      <section className="relative py-64 px-6 bg-maestro-dark overflow-hidden">
        {/* Cinematic Background Image Layer */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-45 grayscale mix-blend-soft-light transition-transform duration-[10000ms] hover:scale-110"
            style={{ backgroundImage: "url('/images/section-avaliable.webp')" }}
          />
          {/* Section Transition Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-maestro-dark via-transparent to-maestro-dark" />
          <div className="absolute inset-0 bg-gradient-to-r from-maestro-dark/60 via-transparent to-maestro-dark/60" />

          {/* Existing Glow & Grid Layers */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-maestro-gold/5 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:32px_32px] opacity-20" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-8">
          <FadeIn>
            <div className="space-y-4">
              <h3 className="text-maestro-light text-4xl md:text-5xl font-serif">
                {t.collabTitle}
              </h3>
              <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-maestro-gold/50 to-transparent mx-auto" />
            </div>

            <p className="text-maestro-light/80 max-w-xl mx-auto font-light leading-relaxed font-serif italic text-lg">
              {t.collabText}
            </p>

            <div className="pt-6">
              <button
                onClick={() => onNavigate(Section.CONTACT)}
                className="group relative inline-flex items-center gap-3 px-10 py-4 overflow-hidden rounded-full border border-maestro-gold/40 hover:border-maestro-gold transition-all duration-500"
              >
                <span className="relative z-10 text-maestro-gold uppercase tracking-[0.3em] text-xs font-bold group-hover:text-white transition-colors">
                  {t.letsTalk}
                </span>
                <ArrowRight size={16} className="relative z-10 text-maestro-gold group-hover:text-white group-hover:translate-x-1 transition-all" />
                <div className="absolute inset-0 bg-maestro-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left -z-10" />
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

    </div >
  );
};
import React, { useEffect, useState } from 'react';
import { ChevronDown, ArrowRight, Music2, BookOpen, Briefcase, Calendar } from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../src/firebase';
import { Section, Language, ExperienceItem } from '../types';
import { translations } from '../translations';
import { FadeIn } from './FadeIn';

interface HomeProps {
  onNavigate: (section: Section) => void;
  lang: Language;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, lang }) => {
  const t = translations[lang].home;
  const tExp = translations[lang].experience;
  const [offsetY, setOffsetY] = useState(0);
  const [experienceItems, setExperienceItems] = useState<ExperienceItem[]>([]);

  // Parallax effect logic
  useEffect(() => {
    const handleScroll = () => setOffsetY(window.pageYOffset);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Experience from Firebase
  useEffect(() => {
    const q = query(collection(db, 'experience'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        return data[lang] as ExperienceItem; // Get data for current language
      }).filter(item => item !== undefined); // Filter out undefined if lang missing

      // Sort by year (descending logic if possible, or just ID) - For now rely on seed order or add sort field
      // Simple sort by ID for now to match seed order
      items.sort((a, b) => Number(a.id) - Number(b.id));

      if (items.length > 0) {
        setExperienceItems(items);
      } else {
        // Fallback to static if empty
        setExperienceItems(tExp.items as unknown as ExperienceItem[]);
      }
    });

    return () => unsubscribe();
  }, [lang, tExp.items]);

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
              backgroundImage: `url('https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=2670&auto=format&fit=crop')`,
              transform: `scale(${1 + offsetY * 0.0002})`,
            }}
          />

          {/* Dramatic Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-maestro-dark via-maestro-dark/95 to-maestro-dark/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-maestro-dark/40 via-transparent to-maestro-dark" />
          <div className="absolute inset-0 bg-gradient-to-t from-maestro-dark via-transparent to-transparent" />

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



        {/* Main Content Container - Fully Responsive Layout */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 lg:gap-16 xl:gap-20 items-center w-full py-24 md:py-20 lg:py-0">

            {/* LEFT SIDE - Text Content */}
            <div className="text-center lg:text-left space-y-4 md:space-y-5 lg:space-y-6 order-2 lg:order-1">
              <FadeIn>
                {/* Role Badge */}
                <div className="flex items-center justify-center lg:justify-start gap-3 md:gap-4 group mb-4">
                  <span className="h-px w-12 md:w-16 bg-gradient-to-r from-maestro-gold/80 to-maestro-gold/30 group-hover:to-maestro-gold transition-all duration-500" />
                  <h2 className="text-maestro-gold tracking-[0.4em] md:tracking-[0.5em] uppercase text-[10px] md:text-xs lg:text-sm font-bold drop-shadow-xl animate-fade-in-down flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 md:w-2 md:h-2 bg-maestro-gold rounded-full animate-pulse" />
                    {t.role}
                  </h2>
                  <span className="h-px w-12 md:w-16 bg-gradient-to-l from-maestro-gold/80 to-maestro-gold/30 group-hover:to-maestro-gold transition-all duration-500 lg:hidden" />
                </div>

                {/* Main Title - Single Line Impact */}
                <div className="relative">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[9rem] font-serif leading-none drop-shadow-2xl tracking-tight whitespace-nowrap">
                    <span className="inline-block text-maestro-light animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                      Diego
                    </span>
                    <span className="inline-block w-3 md:w-5"></span>
                    <span className="inline-block text-maestro-gold italic animate-fade-in-up hover:scale-105 transition-transform duration-300 cursor-default pb-2" style={{ animationDelay: '0.3s' }}>
                      Carrión
                    </span>
                  </h1>
                </div>

                {/* Animated Divider */}
                <div className="relative h-px w-24 md:w-32 lg:w-40 mx-auto lg:mx-0 group mt-6 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-maestro-gold via-maestro-gold/60 to-transparent" />
                  <div className="absolute inset-0 bg-maestro-gold blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Intro Text */}
                <p className="text-maestro-light/90 text-sm sm:text-base md:text-lg lg:text-xl font-light max-w-lg mx-auto lg:mx-0 lg:max-w-xl font-serif italic leading-relaxed drop-shadow-xl animate-fade-in-up px-2 sm:px-0" style={{ animationDelay: '0.5s' }}>
                  {t.intro}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-3 animate-fade-in-up justify-center lg:justify-start" style={{ animationDelay: '0.7s' }}>
                  <button
                    onClick={() => onNavigate(Section.RESEARCH)}
                    className="group relative px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-maestro-gold to-[#c9a961] text-maestro-dark font-bold hover:shadow-2xl hover:shadow-maestro-gold/50 transition-all duration-500 uppercase tracking-widest text-[10px] md:text-xs overflow-hidden"
                  >
                    <span className="relative z-10">{t.ctaWork}</span>
                    <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    <span className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 flex items-center justify-center text-maestro-dark font-bold transition-opacity duration-500">
                      {t.ctaWork}
                    </span>
                  </button>
                  <button
                    onClick={() => onNavigate(Section.CONTACT)}
                    className="group relative px-8 md:px-10 py-3 md:py-4 border-2 border-maestro-gold/50 text-maestro-light hover:border-maestro-gold hover:text-maestro-gold transition-all duration-500 uppercase tracking-widest text-[10px] md:text-xs backdrop-blur-md bg-black/30 hover:bg-black/50 overflow-hidden"
                  >
                    <span className="relative z-10">{t.ctaContact}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-maestro-gold/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </button>
                </div>
              </FadeIn>
            </div>

            {/* RIGHT SIDE - Conductor Photo */}
            <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
              <FadeIn delay={200}>
                {/* Main Photo Container */}
                <div className="relative group w-56 sm:w-64 md:w-72 lg:w-64 xl:w-72 2xl:w-80">
                  {/* Glow Effect Behind */}
                  <div className="absolute -inset-3 md:-inset-4 bg-gradient-to-br from-maestro-gold/30 via-maestro-gold/10 to-transparent blur-2xl md:blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700" />

                  {/* Photo Frame */}
                  <div className="relative aspect-[2/3] overflow-hidden">
                    {/* The Main Photo */}
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
                      alt="Diego Carrión - Director y Musicólogo"
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 shadow-2xl"
                    />

                    {/* Gradient Overlays on Photo */}
                    <div className="absolute inset-0 bg-gradient-to-t from-maestro-dark via-transparent to-transparent opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-br from-maestro-gold/5 via-transparent to-transparent" />

                    {/* Golden Border Effect */}
                    <div className="absolute inset-0 border-2 border-maestro-gold/20 group-hover:border-maestro-gold/40 transition-colors duration-500" />
                  </div>

                  {/* Decorative Frame Corners */}
                  <div className="absolute -top-2 -left-2 w-8 h-8 md:w-10 md:h-10 border-l-2 border-t-2 border-maestro-gold opacity-60" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 border-r-2 border-b-2 border-maestro-gold opacity-60" />

                  {/* Floating Name Tag - Hidden on mobile */}
                  <div className="absolute -bottom-3 md:-bottom-4 -right-3 md:-right-4 bg-maestro-dark/90 backdrop-blur-sm border border-maestro-gold/30 px-3 md:px-4 py-1.5 md:py-2 hidden md:block">
                    <p className="text-maestro-gold text-[10px] md:text-xs font-bold tracking-widest uppercase">Director</p>
                  </div>
                </div>
              </FadeIn>
            </div>

          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce-slow cursor-pointer group"
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
      <section id="about-preview" className="relative py-32 px-6 bg-maestro-dark border-t border-maestro-gold/10 overflow-hidden">
        {/* Orchestra Background Image - Improved Visibility */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1465847899078-b413929f7120?q=80&w=2000&auto=format&fit=crop"
            alt="Symphony Orchestra Background"
            className="w-full h-full object-cover opacity-30 grayscale mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-maestro-dark via-maestro-dark/90 to-maestro-dark/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-maestro-dark via-transparent to-maestro-dark" />
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Bio & Text */}
            <FadeIn delay={100}>
              <div className="text-center lg:text-left space-y-8">
                <h3 className="text-3xl md:text-4xl font-serif text-maestro-light/90 leading-tight">
                  {t.aboutHeading}
                </h3>

                {/* Bio Preview Text */}
                <div className="space-y-6 text-lg text-maestro-light/80 font-light leading-relaxed font-serif italic relative z-10">
                  <p>{t.aboutText1}</p>
                </div>

                {/* Read More Button */}
                <div className="pt-4 relative z-10 flex justify-center lg:justify-start">
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

            {/* Right Column: Stats Grid */}
            <FadeIn delay={200} className="relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Stat 1: Experience */}
                <div className="bg-maestro-dark/80 backdrop-blur-md border border-maestro-gold/20 p-6 rounded-lg text-left hover:border-maestro-gold/50 transition-colors group h-full">
                  <Music2 className="text-maestro-gold w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-2xl font-bold text-white mb-1">15+ <span className="text-sm font-normal text-maestro-light/60">Años</span></h4>
                  <p className="text-xs text-maestro-light/50 uppercase tracking-wider">De experiencia musical</p>
                </div>

                {/* Stat 2: PhD */}
                <div className="bg-maestro-dark/80 backdrop-blur-md border border-maestro-gold/20 p-6 rounded-lg text-left hover:border-maestro-gold/50 transition-colors group h-full">
                  <BookOpen className="text-maestro-gold w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xl font-bold text-white mb-1">PhD <span className="text-sm font-normal text-maestro-light/60">Candidato</span></h4>
                  <p className="text-xs text-maestro-light/50 uppercase tracking-wider">En Musicología</p>
                </div>

                {/* Stat 3: Concerts */}
                <div className="bg-maestro-dark/80 backdrop-blur-md border border-maestro-gold/20 p-6 rounded-lg text-left hover:border-maestro-gold/50 transition-colors group h-full">
                  <Briefcase className="text-maestro-gold w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-2xl font-bold text-white mb-1">20+ <span className="text-sm font-normal text-maestro-light/60">Conciertos</span></h4>
                  <p className="text-xs text-maestro-light/50 uppercase tracking-wider">Internacionales</p>
                </div>

                {/* Stat 4: Passion */}
                <div className="bg-maestro-dark/80 backdrop-blur-md border border-maestro-gold/20 p-6 rounded-lg text-left hover:border-maestro-gold/50 transition-colors group h-full">
                  <div className="text-maestro-gold w-8 h-8 mb-4 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-1">Pasión</h4>
                  <p className="text-xs text-maestro-light/50 uppercase tracking-wider">Por la enseñanza</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>



      {/* 3. EXPERIENCE SECTION (Timeline) */}
      <section id="experience" className="py-24 px-6 bg-maestro-dark relative overflow-hidden">
        {/* Same Background as Hero Section */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay grayscale"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=2670&auto=format&fit=crop')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-maestro-dark via-maestro-dark/80 to-maestro-dark" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-16 space-y-4">
              <span className="text-maestro-gold uppercase tracking-widest text-sm font-bold">{tExp.title}</span>
              <h2 className="text-4xl md:text-5xl font-serif text-maestro-light">{tExp.subtitle}</h2>
              <div className="h-1 w-24 bg-maestro-gold mx-auto rounded-full mt-4" />
            </div>
          </FadeIn>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-maestro-gold/30 to-transparent"></div>

            <div className="space-y-6">
              {experienceItems.slice(0, 4).map((item: ExperienceItem, index: number) => (
                <FadeIn key={index} delay={index * 100}>
                  <div className={`flex flex-col md:flex-row gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} relative`}>
                    {/* Timeline Dot */}
                    <div className="absolute left-[-5px] md:left-1/2 transform md:-translate-x-1/2 w-3 h-3 bg-maestro-gold rounded-full border-4 border-maestro-dark z-10 mt-6"></div>

                    {/* Content Side */}
                    <div className="md:w-1/2 flex justify-start md:justify-end pl-8 md:pl-0 md:pr-12">
                      {/* Card */}
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

                    {/* Empty Side for alignment (Desktop only) */}
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
      </section>

      {/* 4. RESEARCH SECTION */}
      <section id="research" className="py-24 px-6 bg-maestro-gray border-t border-white/5 relative overflow-hidden">
        {/* Research Background */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 grayscale"
            style={{
              backgroundImage: `url('/images/section-search.png')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-maestro-gray via-maestro-gray/80 to-transparent" />
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

      {/* 5. PERFORMANCES SECTION */}
      <section id="performances" className="py-24 px-6 bg-maestro-dark border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <FadeIn>
            <span className="text-maestro-gold uppercase tracking-widest text-sm font-bold block mb-4">{t.perfTitle}</span>
            <h2 className="text-4xl font-serif text-white mb-8">{t.perfDesc}</h2>
            <button onClick={() => onNavigate(Section.PERFORMANCES)} className="inline-flex items-center gap-3 px-8 py-3 bg-maestro-gold text-maestro-dark font-bold rounded-full hover:bg-white transition-colors">
              {t.viewAgenda} <ArrowRight size={16} />
            </button>
          </FadeIn>
        </div>
      </section>

      {/* 4. PARALLAX QUOTE */}
      <section className="relative py-40 flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <div className="absolute inset-0 bg-fixed bg-cover bg-center bg-no-repeat grayscale"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1507838153414-b4b713384ebd?q=80&w=2670&auto=format&fit=crop")' }}>
          <div className="absolute inset-0 bg-maestro-dark/80"></div>
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
      <section className="py-24 px-6 bg-maestro-dark flex flex-col items-center justify-center text-center">
        <FadeIn>
          <h3 className="text-maestro-light text-2xl font-serif mb-6">{t.collabTitle}</h3>
          <p className="text-white/50 max-w-xl mx-auto mb-10 font-light">
            {t.collabText}
          </p>
          <button
            onClick={() => onNavigate(Section.CONTACT)}
            className="text-maestro-gold border border-maestro-gold px-8 py-3 hover:bg-maestro-gold hover:text-maestro-dark transition-all duration-300 uppercase tracking-widest text-xs font-bold"
          >
            {t.letsTalk}
          </button>
        </FadeIn>
      </section>

    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { ChevronDown, ArrowRight, Music2, BookOpen, Briefcase } from 'lucide-react';
import { Section, Language } from '../types';
import { translations } from '../translations';
import { FadeIn } from './FadeIn';

interface HomeProps {
  onNavigate: (section: Section) => void;
  lang: Language;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, lang }) => {
  const t = translations[lang].home;
  const [offsetY, setOffsetY] = useState(0);

  // Parallax effect logic
  useEffect(() => {
    const handleScroll = () => setOffsetY(window.pageYOffset);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-maestro-dark">
        {/* Background Image with Parallax & Zoom */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[30s] ease-in-out transform scale-110 hover:scale-100"
            style={{ 
                // Image: Close up of sheet music / instruments - perfect for PhD Musicology vibe
                backgroundImage: `url('https://images.unsplash.com/photo-1507838153414-b4b713384ebd?q=80&w=2670&auto=format&fit=crop')`,
                transform: `translateY(${offsetY * 0.4}px) scale(1.1)`,
                opacity: 0.4 // Increased visibility of the background
            }}
          />
          {/* Gradient Overlay for Text Readability - Lighter at top/center, darker at bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-maestro-dark/60 via-maestro-dark/40 to-maestro-dark" />
          
          {/* Noise Texture for 'Academic/History' feel */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-16">
          <FadeIn>
            <h2 className="text-maestro-gold tracking-[0.4em] uppercase text-xs md:text-sm mb-8 font-bold drop-shadow-lg flex items-center justify-center gap-4">
              <span className="h-px w-8 bg-maestro-gold/50"></span>
              {t.role}
              <span className="h-px w-8 bg-maestro-gold/50"></span>
            </h2>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-maestro-light mb-6 leading-[0.9] drop-shadow-2xl tracking-tight">
              Diego <br/><span className="text-maestro-gold italic">Carrión</span>
            </h1>
            
            <div className="h-px w-24 bg-maestro-gold/80 mx-auto my-10 shadow-[0_0_15px_rgba(212,175,55,0.6)]"></div>
            
            <p className="text-maestro-light/90 text-xl md:text-2xl font-light max-w-3xl mx-auto mb-12 font-serif italic leading-relaxed drop-shadow-lg">
              {t.intro}
            </p>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <button 
                onClick={() => onNavigate(Section.RESEARCH)}
                className="px-10 py-4 bg-maestro-gold text-maestro-dark font-bold hover:bg-white transition-all duration-300 uppercase tracking-widest text-xs shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.4)]"
              >
                {t.ctaWork}
              </button>
              <button 
                onClick={() => onNavigate(Section.CONTACT)}
                className="px-10 py-4 border border-maestro-light/30 text-maestro-light hover:border-maestro-gold hover:text-maestro-gold transition-all duration-300 uppercase tracking-widest text-xs backdrop-blur-sm bg-black/30 hover:bg-black/50"
              >
                {t.ctaContact}
              </button>
            </div>
          </FadeIn>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer opacity-60 hover:opacity-100 transition-opacity z-20">
          <ChevronDown size={32} className="text-maestro-gold" />
        </div>
      </section>

      {/* 2. INTRODUCCION / FILOSOFIA */}
      <section className="py-32 px-6 bg-maestro-dark relative overflow-hidden">
        {/* Decorative background letter */}
        <div className="absolute top-0 right-0 text-[20rem] font-serif text-white/[0.02] leading-none pointer-events-none -translate-y-1/4 translate-x-1/4">
          D
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <FadeIn>
            <div className="space-y-8">
              <span className="text-maestro-gold uppercase tracking-widest text-xs font-bold flex items-center gap-2">
                <div className="w-8 h-px bg-maestro-gold"></div>
                {t.aboutTitle}
              </span>
              <h2 className="text-5xl md:text-6xl font-serif text-maestro-light leading-tight">
                {t.aboutHeading}
              </h2>
              <p className="text-maestro-light/70 text-lg font-light leading-relaxed">
                {t.aboutText1}
              </p>
              <p className="text-maestro-light/70 text-lg font-light leading-relaxed">
                {t.aboutText2}
              </p>
              
              <button 
                onClick={() => onNavigate(Section.ABOUT)}
                className="group flex items-center gap-3 text-maestro-gold uppercase tracking-widest text-xs font-bold mt-4"
              >
                {t.readBio}
                <ArrowRight size={16} className="transform group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </FadeIn>

          <FadeIn delay={200} className="relative">
            <div className="relative z-10 aspect-[4/5] overflow-hidden rounded-sm">
              <img 
                src="https://images.unsplash.com/photo-1576189658514-69970977d2fa?q=80&w=2574&auto=format&fit=crop" 
                alt="Director" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-maestro-dark/80 via-transparent to-transparent opacity-60"></div>
            </div>
            {/* Outline box effect */}
            <div className="absolute top-8 -right-8 w-full h-full border border-maestro-gold/20 -z-0 hidden md:block"></div>
          </FadeIn>
        </div>
      </section>

      {/* 3. TRAYECTORIA */}
      <section className="py-24 px-6 bg-maestro-gray border-t border-white/5 relative">
        {/* Background accent */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-maestro-gold/30 to-transparent"></div>

        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16">
              <span className="text-maestro-gold uppercase tracking-widest text-sm font-bold">{t.focusTitle}</span>
              <h2 className="text-4xl font-serif text-maestro-light mt-4">{t.focusHeading}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Experiencia */}
            <FadeIn delay={0}>
              <div className="group bg-maestro-dark p-10 h-full border border-white/5 hover:border-maestro-gold/30 transition-all duration-500 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                  <Briefcase size={80} className="text-white" />
                </div>
                <div className="mb-6 text-maestro-gold">
                   <Briefcase size={32} />
                </div>
                <h3 className="text-3xl font-serif text-white mb-4 group-hover:text-maestro-gold transition-colors">{t.expTitle}</h3>
                <p className="text-white/60 font-light leading-relaxed mb-8 flex-grow">
                  {t.expDesc}
                </p>
                <button onClick={() => onNavigate(Section.EXPERIENCE)} className="flex items-center gap-2 text-xs uppercase tracking-widest text-maestro-light hover:text-maestro-gold transition-colors mt-auto">
                  {t.viewTimeline} <ArrowRight size={14} />
                </button>
              </div>
            </FadeIn>

            {/* Card 2: Investigación */}
            <FadeIn delay={200}>
              <div className="group bg-maestro-dark p-10 h-full border border-white/5 hover:border-maestro-gold/30 transition-all duration-500 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                  <BookOpen size={80} className="text-white" />
                </div>
                <div className="mb-6 text-maestro-gold">
                   <BookOpen size={32} />
                </div>
                <h3 className="text-3xl font-serif text-white mb-4 group-hover:text-maestro-gold transition-colors">{t.resTitle}</h3>
                <p className="text-white/60 font-light leading-relaxed mb-8 flex-grow">
                  {t.resDesc}
                </p>
                <button onClick={() => onNavigate(Section.RESEARCH)} className="flex items-center gap-2 text-xs uppercase tracking-widest text-maestro-light hover:text-maestro-gold transition-colors mt-auto">
                  {t.readPapers} <ArrowRight size={14} />
                </button>
              </div>
            </FadeIn>

            {/* Card 3: Actuaciones */}
            <FadeIn delay={400}>
               <div className="group bg-maestro-dark p-10 h-full border border-white/5 hover:border-maestro-gold/30 transition-all duration-500 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                  <Music2 size={80} className="text-white" />
                </div>
                <div className="mb-6 text-maestro-gold">
                   <Music2 size={32} />
                </div>
                <h3 className="text-3xl font-serif text-white mb-4 group-hover:text-maestro-gold transition-colors">{t.perfTitle}</h3>
                <p className="text-white/60 font-light leading-relaxed mb-8 flex-grow">
                   {t.perfDesc}
                </p>
                <button onClick={() => onNavigate(Section.PERFORMANCES)} className="flex items-center gap-2 text-xs uppercase tracking-widest text-maestro-light hover:text-maestro-gold transition-colors mt-auto">
                  {t.viewAgenda} <ArrowRight size={14} />
                </button>
              </div>
            </FadeIn>
          </div>
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
import React from 'react';
import { FadeIn } from './FadeIn';
import { BookOpen, FileText } from 'lucide-react';
import { ResearchPaper, Language } from '../types';
import { translations } from '../translations';

interface ResearchProps {
  items: ResearchPaper[];
  lang: Language;
}

export const Research: React.FC<ResearchProps> = ({ items, lang }) => {
  const t = translations[lang].research;

  return (
    <section className="relative py-24 px-6 bg-maestro-dark overflow-hidden min-h-screen">
      {/* Background Image with Cinematic Overlay (Fixed/Parallax) */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-65"
          style={{ backgroundImage: "url('/images/page-research.webp')" }}
        />
        {/* Gradients to merge with edges and maintain readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-maestro-dark/95 via-transparent to-maestro-dark/90 z-1"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-maestro-dark/40 via-transparent to-maestro-dark/40 z-1"></div>
        <div className="absolute inset-0 bg-black/20 z-1" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/10 pb-8">
          <div>
            <span className="text-maestro-gold uppercase tracking-[0.3em] text-xs font-bold block mb-2" style={{ textShadow: '0 0 20px rgba(212,175,55,0.3)' }}>{t.badge}</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-maestro-light mt-2">{t.title}</h2>
          </div>
          <p className="text-maestro-light/60 max-w-md text-right mt-6 md:mt-0 italic font-serif">
            {t.quote}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((paper, idx) => (
            <FadeIn key={paper.id} delay={idx * 100}>
              <div className="bg-maestro-dark/40 backdrop-blur-md border border-white/5 p-8 hover:bg-maestro-dark/60 hover:border-maestro-gold/50 transition-all duration-500 group h-full flex flex-col shadow-2xl">
                <div className="mb-6 flex justify-between items-start">
                  <div className="p-3 bg-maestro-dark/60 rounded border border-white/10 group-hover:border-maestro-gold group-hover:text-maestro-gold transition-colors">
                    <FileText size={24} />
                  </div>
                  <span className="text-4xl font-serif text-white/5 group-hover:text-maestro-gold/20 transition-colors">0{idx + 1}</span>
                </div>

                <h3 className="text-xl font-bold text-maestro-light mb-2 group-hover:text-maestro-gold transition-colors font-serif">
                  {paper.title}
                </h3>
                <p className="text-sm text-maestro-gold/80 mb-4 font-mono tracking-wider">{paper.journal} — {paper.year}</p>

                <p
                  className="blog-content text-maestro-light/70 text-sm leading-relaxed mb-6 flex-grow font-serif italic"
                  dangerouslySetInnerHTML={{ __html: paper.abstract }}
                />

                <button className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-maestro-gold hover:text-white transition-all group/link mt-auto">
                  <span>{t.read}</span>
                  <div className="w-6 h-px bg-maestro-gold/30 group-hover/link:w-10 group-hover/link:bg-white transition-all" />
                  <BookOpen size={14} className="group-hover/link:translate-x-1 transition-transform" />
                </button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
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
    <section className="py-24 px-6 bg-maestro-dark">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/5 pb-8">
          <div>
            <span className="text-maestro-gold uppercase tracking-widest text-sm font-bold">{t.badge}</span>
            <h2 className="text-4xl md:text-5xl font-serif text-maestro-light mt-2">{t.title}</h2>
          </div>
          <p className="text-maestro-light/50 max-w-md text-right mt-6 md:mt-0 italic">
            {t.quote}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((paper, idx) => (
            <FadeIn key={paper.id} delay={idx * 100}>
              <div className="bg-white/5 border border-white/5 p-8 hover:bg-white/10 hover:border-maestro-gold/50 transition-all duration-500 group h-full flex flex-col">
                <div className="mb-6 flex justify-between items-start">
                  <div className="p-3 bg-maestro-dark rounded border border-white/10 group-hover:border-maestro-gold group-hover:text-maestro-gold transition-colors">
                    <FileText size={24} />
                  </div>
                  <span className="text-4xl font-serif text-white/5 group-hover:text-maestro-gold/20 transition-colors">0{idx + 1}</span>
                </div>

                <h3 className="text-xl font-bold text-maestro-light mb-2 group-hover:text-maestro-gold transition-colors">
                  {paper.title}
                </h3>
                <p className="text-sm text-maestro-gold mb-4 font-mono">{paper.journal} — {paper.year}</p>

                <p className="text-maestro-light/60 text-sm leading-relaxed mb-6 flex-grow">
                  {paper.abstract}
                </p>

                <button className="flex items-center gap-2 text-xs uppercase tracking-widest text-maestro-light hover:text-maestro-gold transition-colors mt-auto">
                  {t.read} <BookOpen size={14} />
                </button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
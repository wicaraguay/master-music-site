import React from 'react';
import { FadeIn } from './FadeIn';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { ResearchPaper, Language } from '../types';
import { translations } from '../translations';

interface ResearchProps {
  items: ResearchPaper[];
  lang: Language;
}

export const Research: React.FC<ResearchProps> = ({ items, lang }) => {
  const t = translations[lang].research;

  // Sorting items by year (descending)
  const sortedItems = [...items].sort((a, b) => {
    const yearA = parseInt(a.year) || 0;
    const yearB = parseInt(b.year) || 0;
    return yearB - yearA;
  });

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

        {/* Square Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedItems.map((paper, idx) => (
            <FadeIn key={paper.id} delay={idx * 100}>
              <div
                className="group relative aspect-square bg-maestro-dark/40 overflow-hidden border border-white/10 hover:border-maestro-gold/50 transition-all duration-700 cursor-pointer shadow-2xl"
                onClick={() => paper.pdfUrl && window.open(paper.pdfUrl, '_blank')}
              >
                {/* PDF Preview Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.5s] group-hover:scale-110"
                  style={{ backgroundImage: `url('${paper.previewImage || '/images/section-text.webp'}')` }}
                />

                {/* Elegant Glassmorphism Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-maestro-gold/80 font-mono tracking-[0.2em] uppercase transition-colors group-hover:text-maestro-gold">
                        {paper.journal} — {paper.year}
                      </span>
                      {paper.articleLanguage && (
                        <span className="text-[9px] px-2 py-0.5 bg-maestro-gold/10 border border-maestro-gold/30 text-maestro-gold font-bold font-mono uppercase rounded-sm shadow-lg whitespace-nowrap">
                          {t.languageLabel}: {paper.articleLanguage === 'multilingual' ? 'MULTI' : paper.articleLanguage.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg md:text-xl font-serif text-white leading-tight group-hover:text-maestro-gold transition-colors duration-500">
                      {paper.title}
                    </h3>

                    {/* Read More Indicator */}
                    <div className="pt-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200">
                      <div className="h-px w-8 bg-maestro-gold" />
                      <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/70">
                        {paper.linkType === 'external' ? t.readExternal : t.readPdf}
                      </span>
                      {paper.linkType === 'external' ? (
                        <ExternalLink size={14} className="text-maestro-gold" />
                      ) : (
                        <Download size={14} className="text-maestro-gold" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Number Badge */}
                <div className="absolute top-4 right-4 text-2xl font-serif text-white/10 group-hover:text-maestro-gold/20 transition-colors">
                  0{idx + 1}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

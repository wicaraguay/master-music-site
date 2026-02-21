import React from 'react';
import { FadeIn } from './FadeIn';
import { Briefcase } from 'lucide-react';
import { ExperienceItem, Language } from '../types';
import { translations } from '../translations';

interface ExperienceProps {
  items: ExperienceItem[];
  lang: Language;
}

export const Experience: React.FC<ExperienceProps> = ({ items, lang }) => {
  const t = translations[lang].experience;

  return (
    <section className="relative py-24 px-6 bg-maestro-dark min-h-screen overflow-hidden">
      {/* Background Image with Cinematic Overlay (Fixed/Parallax) */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-65"
          style={{ backgroundImage: "url('/images/page-experience.webp')" }}
        />
        {/* Gradients to merge with edges and maintain readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-maestro-dark/95 via-transparent to-maestro-dark/90 z-1"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-maestro-dark/40 via-transparent to-maestro-dark/40 z-1"></div>
        <div className="absolute inset-0 bg-black/20 z-1" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-maestro-light mb-4 leading-tight">{t.title}</h2>
          <div className="w-24 h-1 bg-maestro-gold mx-auto rounded-full" />
        </div>

        <div className="space-y-12 relative">
          {items.map((exp, index) => (
            <FadeIn key={exp.id || index} delay={index * 150}>
              <div className="group relative pl-10 md:pl-12 border-l-2 border-maestro-gold/20 hover:border-maestro-gold transition-colors duration-500 pb-2">
                {/* Dot */}
                <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-maestro-dark border-4 border-maestro-gold/30 group-hover:border-maestro-gold group-hover:scale-125 transition-all duration-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]" />

                <div className="bg-maestro-dark/40 backdrop-blur-md border border-white/5 p-8 rounded-sm shadow-2xl group-hover:bg-maestro-dark/60 group-hover:border-maestro-gold/30 transition-all duration-500">
                  <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-4">
                    <h3 className="text-2xl font-serif text-maestro-light group-hover:text-maestro-gold transition-colors">
                      {(exp.role as any)[lang] || (exp.role as any).es || exp.role}
                    </h3>
                    <span className="text-maestro-gold font-mono text-sm tracking-widest font-bold mt-1 md:mt-0">{(exp.year as any)[lang] || (exp.year as any).es || exp.year}</span>
                  </div>

                  <h4 className="text-lg text-maestro-light/80 font-serif italic mb-4 flex items-center gap-3">
                    <Briefcase size={18} className="text-maestro-gold/60" /> {(exp.institution as any)[lang] || (exp.institution as any).es || exp.institution}
                  </h4>

                  <p
                    className="blog-content text-maestro-light/70 font-light leading-relaxed font-serif"
                    dangerouslySetInnerHTML={{ __html: (exp.description as any)[lang] || (exp.description as any).es || exp.description }}
                  />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
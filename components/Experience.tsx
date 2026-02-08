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
    <section className="py-24 px-6 bg-maestro-dark">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-maestro-light mb-4">{t.title}</h2>
          <div className="w-24 h-1 bg-maestro-gold mx-auto" />
        </div>

        <div className="space-y-12">
          {items.map((exp, index) => (
            <FadeIn key={exp.id || index} delay={index * 150}>
              <div className="group relative pl-8 border-l border-maestro-light/20 hover:border-maestro-gold transition-colors duration-300">
                {/* Dot */}
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-maestro-dark border-2 border-maestro-light/20 group-hover:border-maestro-gold transition-colors duration-300" />
                
                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                  <h3 className="text-2xl font-serif text-maestro-light group-hover:text-maestro-gold transition-colors">
                    {exp.role}
                  </h3>
                  <span className="text-maestro-gold font-mono text-sm">{exp.year}</span>
                </div>
                
                <h4 className="text-lg text-maestro-light/80 font-light mb-3 flex items-center gap-2">
                  <Briefcase size={16} /> {exp.institution}
                </h4>
                
                <p className="text-maestro-light/60 font-light leading-relaxed">
                  {exp.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
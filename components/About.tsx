import React from 'react';
import { FadeIn } from './FadeIn';
import { Language } from '../types';
import { translations } from '../translations';

interface AboutProps {
  lang: Language;
}

export const About: React.FC<AboutProps> = ({ lang }) => {
  const t = translations[lang].about;

  return (
    <section className="py-24 px-6 bg-maestro-dark relative">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

        {/* Image Side */}
        <FadeIn className="relative">
          <div className="aspect-[3/4] rounded-lg overflow-hidden border border-maestro-light/10 relative group">
            <img
              src="https://picsum.photos/800/1200"
              alt="Portrait of the Conductor"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale hover:grayscale-0"
            />
            <div className="absolute inset-0 border border-maestro-gold/30 m-4 rounded-sm pointer-events-none" />
          </div>
          {/* Decorative element behind */}
          <div className="absolute -z-10 top-10 -left-10 w-full h-full border border-maestro-light/5" />
        </FadeIn>

        {/* Text Side */}
        <FadeIn delay={200} className="space-y-8">
          <div>
            <span className="text-maestro-gold uppercase tracking-widest text-sm font-bold">{t.bioTitle}</span>
            <h2 className="text-4xl md:text-5xl font-serif text-maestro-light mt-4 mb-6">
              {t.bioHeading}
            </h2>
          </div>

          <div className="space-y-6 text-maestro-light/70 leading-relaxed font-light text-lg">
            <p>{t.p1}</p>
            <p>{t.p2}</p>
            <p>{t.p3}</p>
          </div>

        </FadeIn>

      </div>
    </section>
  );
};
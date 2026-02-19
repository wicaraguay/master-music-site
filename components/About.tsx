import React from 'react';
import { FadeIn } from './FadeIn';
import { Language, AboutData } from '../types';
import { translations } from '../translations';

interface AboutProps {
  lang: Language;
  aboutData: AboutData | null;
}

export const About: React.FC<AboutProps> = ({ lang, aboutData }) => {
  const t = translations[lang].about;

  // Use dynamic data if available, otherwise fallback to translations/defaults
  const bioTitle = aboutData?.bioTitle || t.bioTitle;
  const bioHeading = aboutData?.bioHeading || t.bioHeading;
  const profileImage = aboutData?.profileImage || "https://picsum.photos/800/1200";

  return (
    <section className="py-24 px-6 bg-maestro-dark relative">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

        {/* Image Side */}
        <FadeIn className="relative sticky top-24">
          <div className="aspect-[3/4] rounded-lg overflow-hidden border border-maestro-light/10 relative group">
            <img
              src={profileImage}
              alt={bioHeading}
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
            <span className="text-maestro-gold uppercase tracking-widest text-sm font-bold">{bioTitle}</span>
            <h2 className="text-4xl md:text-5xl font-serif text-maestro-light mt-4 mb-6">
              {bioHeading}
            </h2>
          </div>

          <div className="space-y-6 text-maestro-light/70 leading-relaxed font-light text-lg">
            {(aboutData?.sections && aboutData.sections.length > 0) ? (
              // Render Dynamic Sections
              <div className="space-y-8">
                {aboutData.sections.map((section) => {
                  if (section.type === 'text') {
                    return (
                      <div
                        key={section.id}
                        className="[&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:text-maestro-gold [&_h2]:font-serif [&_h2]:mt-8 [&_h2]:mb-4
                                   [&_h3]:text-xl [&_h3]:md:text-2xl [&_h3]:text-maestro-light [&_h3]:font-serif [&_h3]:mt-6 [&_h3]:mb-3
                                   [&_p]:mb-4 [&_strong]:text-maestro-gold/90 [&_strong]:font-bold"
                        dangerouslySetInnerHTML={{ __html: section.content as string }}
                      />
                    );
                  } else if (section.type === 'image') {
                    return (
                      <div key={section.id} className="my-8">
                        <img src={section.image} alt="Biography" className="w-full rounded-sm border border-white/10" />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ) : (
              // Render Default Static Content
              <>
                <p>{t.p1}</p>
                <p>{t.p2}</p>
                <p>{t.p3}</p>
              </>
            )}
          </div>

        </FadeIn>

      </div>
    </section>
  );
};
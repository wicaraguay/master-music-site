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
  const bioTitle = typeof aboutData?.bioTitle === 'object' ? (aboutData.bioTitle as any)[lang] || (aboutData.bioTitle as any).es : (aboutData?.bioTitle || t.bioTitle);
  const bioHeading = typeof aboutData?.bioHeading === 'object' ? (aboutData.bioHeading as any)[lang] || (aboutData.bioHeading as any).es : (aboutData?.bioHeading || t.bioHeading);
  const profileImage = aboutData?.profileImage || "https://picsum.photos/800/1200";

  return (
    <section className="pt-20 pb-16 md:py-24 px-6 bg-maestro-dark relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20 items-start">

        {/* Image Side - Smaller and Decorated */}
        <FadeIn className="relative md:sticky md:top-24 md:col-span-5 lg:col-span-4">
          <div className="relative group">
            {/* Minimalist Decoration: Gold Border Offset */}
            <div className="absolute top-4 -left-4 w-full h-full border border-maestro-gold/30 rounded-sm -z-10 transition-transform duration-500 group-hover:-translate-x-1 group-hover:-translate-y-1" />

            {/* Minimalist Decoration: Solid Block Accent */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-maestro-gold/5 rounded-full blur-2xl -z-20" />

            <div className="aspect-[3/4] rounded-sm overflow-hidden relative shadow-2xl shadow-black/50">
              <img
                src={profileImage}
                alt={bioHeading}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale hover:grayscale-0"
                loading="lazy"
              />
              {/* Inner fine border */}
              <div className="absolute inset-0 border border-white/10 m-3 rounded-sm pointer-events-none" />
            </div>
          </div>
        </FadeIn>

        {/* Text Side */}
        <FadeIn delay={200} className="space-y-8 md:col-span-7 lg:col-span-8">
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
                                   [&_p]:mb-4 [&_strong]:text-maestro-gold/90 [&_strong]:font-bold
                                   [&_ul]:list-none [&_ul]:pl-4 [&_ul]:mb-4
                                   [&_li]:relative [&_li]:pl-5 [&_li]:mb-2
                                   [&_li::before]:content-['•'] [&_li::before]:text-maestro-gold [&_li::before]:absolute [&_li::before]:left-0 [&_li::before]:font-bold"
                        dangerouslySetInnerHTML={{ __html: typeof section.content === 'object' ? (section.content as any)[lang] || (section.content as any).es : (section.content || '') }}
                      />
                    );
                  } else if (section.type === 'image') {
                    return (
                      <div key={section.id} className="my-8">
                        <img src={section.image} alt="Biography" className="w-full rounded-sm border border-white/10" loading="lazy" />
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
import React from 'react';
import { FadeIn } from './FadeIn';
import { Download, FileText, Music, FileType } from 'lucide-react';
import { Resource, Language } from '../types';
import { translations } from '../translations';

interface ResourcesProps {
  resources: Resource[];
  lang: Language;
}

export const Resources: React.FC<ResourcesProps> = ({ resources, lang }) => {
  const t = translations['es'].resources;

  const getIcon = (type: string) => {
    switch (type) {
      case 'score': return <Music size={24} />;
      case 'article': return <FileText size={24} />;
      case 'audio': return <FileType size={24} />;
      default: return <FileText size={24} />;
    }
  };

  return (
    <section className="py-24 px-6 bg-maestro-dark min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-maestro-gold uppercase tracking-widest text-sm font-bold">{t.badge}</span>
          <h2 className="text-4xl md:text-5xl font-serif text-maestro-light mt-4 mb-6">
            {t.titlePrefix} <span className="italic text-maestro-gold">{t.titleSuffix}</span>
          </h2>
          <p className="text-maestro-light/60 max-w-2xl mx-auto font-light">
            {t.subtitle}
          </p>
        </div>

        {/* Public Downloads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {resources.length === 0 && (
            <div className="col-span-full text-center text-maestro-light/40">
              {t.empty}
            </div>
          )}
          {resources.map((resource, idx) => (
            <FadeIn key={resource.id} delay={idx * 100}>
              <div className="group bg-white/5 border border-white/10 p-6 hover:border-maestro-gold/50 transition-all duration-300 relative overflow-hidden flex flex-col h-full">

                {/* Type Icon */}
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                  {getIcon(resource.type)}
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-full bg-maestro-dark border border-white/10 group-hover:text-maestro-gold group-hover:border-maestro-gold transition-colors`}>
                    {getIcon(resource.type)}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-maestro-light/40 border border-white/10 px-2 py-1 rounded">
                    {resource.format}
                  </span>
                </div>

                <h3 className="text-xl font-serif text-maestro-light mb-2 group-hover:text-maestro-gold transition-colors">
                  {resource.title}
                </h3>

                <p className="text-sm text-maestro-light/60 mb-6 font-light leading-relaxed flex-grow">
                  {resource.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                  <span className="text-xs text-maestro-light/40">{resource.size}</span>
                  <button className="flex items-center gap-2 text-xs uppercase tracking-widest text-maestro-gold font-bold hover:text-white transition-colors">
                    {t.download} <Download size={14} />
                  </button>
                </div>

              </div>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
};
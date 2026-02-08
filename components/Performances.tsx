import React, { useState } from 'react';
import { FadeIn } from './FadeIn';
import { Calendar, MapPin, ChevronDown, Music, ImageIcon } from 'lucide-react';
import { Performance, Language } from '../types';
import { translations } from '../translations';

interface PerformancesProps {
  items: Performance[];
  lang: Language;
}

export const Performances: React.FC<PerformancesProps> = ({ items, lang }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const t = translations[lang].performances;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="py-24 px-6 bg-maestro-dark">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-serif text-center text-maestro-light mb-16">
          {t.titlePrefix} <span className="text-maestro-gold italic">{t.titleSuffix}</span>
        </h2>

        <div className="space-y-6">
          {items.map((event, idx) => {
            const isExpanded = expandedId === event.id;
            
            return (
              <FadeIn key={event.id} delay={idx * 100}>
                <div 
                  onClick={() => toggleExpand(event.id)}
                  className={`
                    group relative overflow-hidden rounded-sm cursor-pointer transition-all duration-700
                    border ${isExpanded ? 'border-maestro-gold' : 'border-white/5'}
                  `}
                >
                  {/* Background Image Overlay */}
                  {event.image && (
                    <div className="absolute inset-0 z-0">
                       {/* Gradient Overlay */}
                       <div className="absolute inset-0 bg-gradient-to-r from-maestro-dark via-maestro-dark/95 to-maestro-dark/60 z-10 transition-colors duration-700" />
                       {/* The Image */}
                       <img 
                          src={event.image} 
                          alt={event.location}
                          className={`
                            w-full h-full object-cover transition-all duration-1000
                            ${isExpanded ? 'scale-105 opacity-50 grayscale-0' : 'scale-100 opacity-20 grayscale group-hover:opacity-30'}
                          `}
                       />
                    </div>
                  )}
                  
                  {/* No image fallback bg */}
                  {!event.image && (
                      <div className={`absolute inset-0 z-0 bg-maestro-dark transition-colors duration-500 ${isExpanded ? 'bg-white/5' : ''}`} />
                  )}

                  {/* Summary Header */}
                  <div className="flex flex-col md:flex-row items-center p-6 relative z-10">
                    
                    {/* Date */}
                    <div className="md:w-1/4 text-center md:text-left mb-4 md:mb-0 border-r border-white/10 pr-6 w-full">
                      <div className={`flex items-center gap-2 justify-center md:justify-start font-bold tracking-widest transition-colors ${isExpanded ? 'text-maestro-gold' : 'text-maestro-gold/80'}`}>
                        <Calendar size={18} />
                        <span>{event.date}</span>
                      </div>
                    </div>

                    {/* Main Info */}
                    <div className="md:w-2/4 text-center md:text-left md:pl-6 w-full">
                      <h3 className="text-2xl font-serif text-maestro-light mb-1 group-hover:text-white transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-maestro-light/60">
                        <MapPin size={14} />
                        {event.location}
                      </div>
                    </div>

                    {/* Role & Chevron */}
                    <div className="md:w-1/4 flex flex-col items-center md:items-end mt-4 md:mt-0 gap-3 w-full">
                       <span className={`text-xs uppercase tracking-widest px-3 py-1 border rounded transition-colors ${isExpanded ? 'border-maestro-gold text-maestro-gold' : 'border-white/10 text-maestro-light/40'}`}>
                        {event.role}
                      </span>
                      <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180 text-maestro-gold' : 'text-maestro-light/20'}`}>
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <div 
                    className={`
                      relative z-10 overflow-hidden transition-all duration-700 ease-in-out
                      ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                    `}
                  >
                    <div className="p-6 pt-0 md:pl-[25%] text-maestro-light/80 font-light leading-relaxed border-t border-white/5 mt-2 mx-6">
                      <div className="pt-6 flex gap-4">
                        <Music className="text-maestro-gold flex-shrink-0 mt-1" size={20} />
                        <div>
                          <p className="mb-4">{event.description}</p>
                          {event.status === 'upcoming' && (
                             <span className="text-xs uppercase tracking-widest text-maestro-gold/70 font-bold flex items-center gap-2">
                               {t.moreDetails}
                             </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Image credit indicator if image exists */}
                      {event.image && (
                          <div className="mt-4 flex items-center gap-2 text-xs text-maestro-light/30">
                              <ImageIcon size={12} />
                              <span>{t.imgCredit} {event.location}</span>
                          </div>
                      )}
                    </div>
                  </div>

                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};
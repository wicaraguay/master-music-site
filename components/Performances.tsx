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
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const t = translations[lang].performances;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDynamicStatus = (perf: Performance): 'upcoming' | 'past' => {
    // 1. Prefer dateISO if available (new items)
    if (perf.dateISO) {
      const eventDate = new Date(perf.dateISO);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today ? 'upcoming' : 'past';
    }

    // 2. Legacy fallback: Attempt to parse the date string (format "DD MMM YYYY")
    try {
      // Prioritize date_raw (always Spanish) if available from transformation, 
      // otherwise try localized versions or current string
      const dateStr = (perf as any).date_raw || (perf.date as any)?.es || (perf.date as any)?.en || (typeof perf.date === 'string' ? perf.date : '');

      if (dateStr && typeof dateStr === 'string') {
        const parts = dateStr.trim().split(' ');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const monthStr = parts[1].toLowerCase().replace('.', '');
          const year = parseInt(parts[2]);

          if (!isNaN(day) && !isNaN(year)) {
            const months: Record<string, number> = {
              // Spanish
              'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5, 'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11,
              // English
              'jan': 0, 'apr': 3, 'aug': 7, 'dec': 11,
              // Russian (Transliterated/Common)
              'янв': 0, 'фев': 1, 'апр': 3, 'май': 4, 'июн': 5, 'июл': 6, 'авг': 7, 'сен': 8, 'окт': 9, 'ноя': 10, 'дек': 11
            };

            const month = months[monthStr.substring(0, 3)];
            if (month !== undefined) {
              const eventDate = new Date(year, month, day);
              return eventDate >= today ? 'upcoming' : 'past';
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error parsing legacy date:', e);
    }

    // 3. Final fallback to manually set status
    return perf.status;
  };

  const getLatestCreatedId = () => {
    if (!items || items.length === 0) return null;
    return [...items].sort((a, b) => {
      const valA = (a as any).createdAt || a.dateISO || 0;
      const valB = (b as any).createdAt || b.dateISO || 0;
      if (valA < valB) return 1;
      if (valA > valB) return -1;
      return 0;
    })[0]?.id;
  };

  const latestCreatedId = getLatestCreatedId();

  const filteredItems = items
    .filter(item => {
      if (activeFilter === 'all') return true;
      return getDynamicStatus(item) === activeFilter;
    })
    .sort((a, b) => {
      // Strict Date Ascending Sort (Oldest to Newest)
      if (a.dateISO < b.dateISO) return -1;
      if (a.dateISO > b.dateISO) return 1;
      return 0;
    });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="relative py-24 px-6 bg-maestro-dark overflow-hidden min-h-screen">
      {/* Background Image with Cinematic Overlay (Fixed/Parallax) */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-65"
          style={{ backgroundImage: "url('/images/page-events.webp')" }}
        />
        {/* Gradients to merge with edges and maintain readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-maestro-dark/95 via-transparent to-maestro-dark/95 z-1"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-maestro-dark/40 via-transparent to-maestro-dark/40 z-1"></div>
        <div className="absolute inset-0 bg-black/20 z-1" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <h2 className="text-4xl font-serif text-center text-maestro-light mb-12">
          {t.titlePrefix} <span className="text-maestro-gold italic">{t.titleSuffix}</span>
        </h2>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          {[
            { id: 'all', label: t.filterAll },
            { id: 'upcoming', label: t.filterUpcoming },
            { id: 'past', label: t.filterPast }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`
                px-6 py-2 text-xs uppercase tracking-widest transition-all duration-300 border-b-2
                ${activeFilter === tab.id
                  ? 'text-maestro-gold border-maestro-gold font-bold'
                  : 'text-maestro-light/40 border-transparent hover:text-maestro-light/60 hover:border-white/10'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {filteredItems.map((event, idx) => {
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
                  {(event.images?.[0] || event.image) && (
                    <div className="absolute inset-0 z-0">
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-maestro-dark via-maestro-dark/95 to-maestro-dark/60 z-10 transition-colors duration-700" />
                      {/* The Image */}
                      <img
                        src={event.images?.[0] || event.image}
                        alt={event.location}
                        className={`
                            w-full h-full object-cover transition-all duration-1000
                            ${isExpanded
                            ? 'scale-105 opacity-50 grayscale-0'
                            : getDynamicStatus(event) === 'past'
                              ? 'scale-100 opacity-10 grayscale'
                              : 'scale-100 opacity-20 grayscale group-hover:opacity-30'}
                          `}
                      />
                    </div>
                  )}

                  {/* No image fallback bg */}
                  {(!event.images?.[0] && !event.image) && (
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

                    {/* Role, Status & Chevron */}
                    <div className="md:w-1/4 flex flex-col items-center md:items-end mt-4 md:mt-0 gap-3 w-full">
                      <div className="flex flex-col items-center md:items-end gap-2">
                        <span className={`text-[10px] items-center gap-1 uppercase tracking-widest font-bold ${getDynamicStatus(event) === 'upcoming' ? 'text-maestro-gold' : 'text-maestro-light/30'}`}>
                          {getDynamicStatus(event) === 'upcoming' ? t.statusUpcoming : t.statusPast}
                        </span>
                        {event.id === latestCreatedId && (
                          <span className="bg-maestro-gold text-maestro-dark text-[9px] font-bold px-3 py-1 uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)] border border-maestro-gold group-hover:bg-white group-hover:border-white transition-all duration-300">
                            {(t as any).latestPost}
                          </span>
                        )}
                        <span className={`text-xs uppercase tracking-widest px-3 py-1 border rounded transition-colors ${isExpanded ? 'border-maestro-gold text-maestro-gold' : 'border-white/10 text-maestro-light/40'}`}>
                          {event.role}
                        </span>
                      </div>
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
                          <p
                            className="blog-content mb-4"
                            dangerouslySetInnerHTML={{ __html: event.description }}
                          />

                          {/* Event Images Gallery */}
                          {event.images && event.images.length > 0 && (
                            <div className="mt-8 mb-6">
                              <span className="text-[10px] uppercase tracking-[0.2em] text-maestro-gold font-bold mb-4 block">
                                {lang === 'es' ? 'Galería del Sitio' : 'Venue Gallery'}
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {event.images.map((img, i) => (
                                  <div key={i} className="aspect-square rounded overflow-hidden border border-white/10 hover:border-maestro-gold/50 transition-all duration-500 group">
                                    <img
                                      src={img}
                                      alt={`${event.location} - ${i + 1}`}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(img, '_blank');
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {event.status === 'upcoming' && (
                            <span className="text-xs uppercase tracking-widest text-maestro-gold/70 font-bold flex items-center gap-2">
                              {t.moreDetails}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Image credit indicator if image exists */}
                      {(event.images?.[0] || event.image) && (
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
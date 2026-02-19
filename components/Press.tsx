import React, { useState } from 'react';
import { FadeIn } from './FadeIn';
import { ExternalLink, Newspaper, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Language, PressItem } from '../types';
import { translations } from '../translations';

interface PressProps {
    lang: Language;
    items: PressItem[];
}

const ITEMS_PER_PAGE = 8;

export const Press: React.FC<PressProps> = ({ lang, items }) => {
    const t = translations[lang].press;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Extract unique categories for the current language
    const categories = Array.from(new Set(items.map(item => {
        const cat = item.category as any;
        return (cat[lang] || cat.es || cat) as string;
    }))).filter(Boolean).sort() as string[];

    const getLatestCreatedId = () => {
        if (!items || items.length === 0) return null;
        return [...items].sort((a, b) => {
            const valA = (a as any).createdAt || a.dateISO || '';
            const valB = (b as any).createdAt || b.dateISO || '';
            return valB.localeCompare(valA);
        })[0]?.id;
    };

    const latestCreatedId = getLatestCreatedId();

    // Filter items by category
    const filteredItems = items.filter(item => {
        if (selectedCategory === 'all') return true;
        const cat = (item.category as any)[lang] || (item.category as any).es || item.category;
        return cat === selectedCategory;
    });

    // Sort items: Priority to latest created, then dateISO descending
    const sortedItems = [...filteredItems].sort((a, b) => {
        if (a.id === latestCreatedId) return -1;
        if (b.id === latestCreatedId) return 1;

        if (!a.dateISO || !b.dateISO) return 0;
        if (b.dateISO < a.dateISO) return -1;
        if (b.dateISO > a.dateISO) return 1;
        return 0;
    });

    const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
    const paginatedItems = sortedItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setCurrentPage(1);
    };

    return (
        <section className="relative py-24 px-6 bg-maestro-dark min-h-screen overflow-hidden">
            {/* Background Image with Cinematic Overlay (Fixed/Parallax) */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-fixed opacity-65"
                    style={{ backgroundImage: "url('/images/page-press.webp')" }}
                />
                {/* Gradients to merge with edges and maintain readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-maestro-dark/95 via-transparent to-maestro-dark/90 z-1"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-maestro-dark/40 via-transparent to-maestro-dark/40 z-1"></div>
                <div className="absolute inset-0 bg-black/20 z-1" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <FadeIn>
                        <span className="text-maestro-gold uppercase tracking-[0.3em] text-xs font-bold mb-4 block" style={{ textShadow: '0 0 20px rgba(212,175,55,0.3)' }}>
                            {t.badge}
                        </span>
                        <h2 className="text-4xl md:text-6xl font-serif text-maestro-light mb-6 leading-tight">
                            {t.titlePrefix} <span className="italic text-maestro-gold">{t.titleSuffix}</span>
                        </h2>
                        <div className="h-px w-24 bg-maestro-gold/30 mx-auto mb-8" />
                        <p className="text-maestro-light/60 max-w-2xl mx-auto font-light leading-relaxed font-serif">
                            {t.subtitle}
                        </p>
                    </FadeIn>
                </div>

                {/* Categories Filter */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    <FadeIn delay={100}>
                        <div className="flex flex-wrap justify-center gap-3">
                            <button
                                onClick={() => handleCategoryChange('all')}
                                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${selectedCategory === 'all'
                                    ? 'bg-maestro-gold text-maestro-dark border-maestro-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                                    : 'bg-white/5 text-maestro-light/60 border-white/10 hover:border-maestro-gold/50 hover:text-maestro-gold'
                                    }`}
                            >
                                {(t as any).filterAll}
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryChange(category)}
                                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${selectedCategory === category
                                        ? 'bg-maestro-gold text-maestro-dark border-maestro-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                                        : 'bg-white/5 text-maestro-light/60 border-white/10 hover:border-maestro-gold/50 hover:text-maestro-gold'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </FadeIn>
                </div>

                {/* Press Feed */}
                <div className="grid grid-cols-1 gap-12 max-w-5xl mx-auto">
                    {items.length === 0 ? (
                        <div className="text-center text-maestro-light/30 py-20 italic font-serif text-xl border border-dashed border-white/10 rounded-lg backdrop-blur-sm bg-black/20">
                            {t.empty}
                        </div>
                    ) : (
                        paginatedItems.map((item, index) => (
                            <FadeIn key={item.id} delay={index * 100}>
                                <div className="group relative bg-maestro-dark/40 backdrop-blur-md border border-white/5 hover:border-maestro-gold/50 transition-all duration-500 rounded-sm overflow-hidden flex flex-col md:flex-row shadow-2xl">
                                    {/* Image Container */}
                                    <div className="w-full md:w-72 h-64 md:h-auto overflow-hidden flex-shrink-0 relative">
                                        <img
                                            src={item.image}
                                            alt={((item.title as any)[lang] || (item.title as any).es || item.title) as string}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-0 md:grayscale md:group-hover:grayscale-0"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 md:p-10 flex flex-col justify-center flex-grow">
                                        <div className="flex flex-wrap items-center gap-4 mb-4">
                                            <span className="text-[10px] uppercase tracking-widest text-maestro-gold font-bold bg-maestro-gold/10 px-3 py-1 rounded-full border border-maestro-gold/20">
                                                {(item.category as any)[lang] || (item.category as any).es || item.category}
                                            </span>
                                            {item.id === latestCreatedId && (
                                                <span className="bg-maestro-gold text-maestro-dark text-[9px] font-bold px-3 py-1 uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)] border border-maestro-gold group-hover:bg-white group-hover:border-white transition-all duration-300">
                                                    {(t as any).latestPost}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-maestro-light/40">
                                                <Calendar size={12} /> {item.date}
                                            </span>
                                            <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-maestro-light/40">
                                                <Newspaper size={12} /> {item.source}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl md:text-3xl font-serif text-maestro-light mb-4 group-hover:text-maestro-gold transition-colors leading-tight">
                                            {(item.title as any)[lang] || (item.title as any).es || item.title}
                                        </h3>

                                        <div
                                            className="text-maestro-light/70 font-light leading-relaxed mb-8 italic font-serif blog-content"
                                            dangerouslySetInnerHTML={{ __html: (item.excerpt as any)[lang] || (item.excerpt as any).es || item.excerpt }}
                                        />

                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold text-maestro-gold hover:text-white transition-all group/link self-start"
                                        >
                                            <span>{lang === 'es' ? 'Leer Artículo' : lang === 'en' ? 'Read Article' : 'Читать статью'}</span>
                                            <div className="w-8 h-px bg-maestro-gold/30 group-hover/link:w-12 group-hover/link:bg-white transition-all" />
                                            <ExternalLink size={14} className="group-hover/link:translate-x-1 transition-transform" />
                                        </a>
                                    </div>
                                </div>
                            </FadeIn>
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-20 flex justify-center items-center gap-6">
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-4 bg-white/5 border border-white/10 text-maestro-gold hover:bg-maestro-gold hover:text-maestro-dark disabled:opacity-20 disabled:hover:bg-white/5 disabled:hover:text-maestro-gold transition-all duration-300 rounded-full"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-10 h-10 rounded-full font-serif transition-all duration-300 ${currentPage === page ? 'bg-maestro-gold text-maestro-dark shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'text-maestro-light/40 hover:text-maestro-gold hover:bg-white/5'}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="p-4 bg-white/5 border border-white/10 text-maestro-gold hover:bg-maestro-gold hover:text-maestro-dark disabled:opacity-20 disabled:hover:bg-white/5 disabled:hover:text-maestro-gold transition-all duration-300 rounded-full"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {/* Call to action footer */}
                <div className="mt-32 text-center">
                    <div className="h-px w-12 bg-maestro-gold/30 mx-auto mb-8" />
                    <p className="text-maestro-light/30 text-[10px] uppercase tracking-[0.4em] font-light">
                        Diego Carrión Granda — Archivo de Prensa
                    </p>
                </div>
            </div>
        </section>
    );
};

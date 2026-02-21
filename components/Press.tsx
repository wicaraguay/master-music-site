import React, { useState } from 'react';
import { FadeIn } from './FadeIn';
import { ExternalLink, Newspaper, Calendar, ChevronLeft, ChevronRight, X, ImageIcon } from 'lucide-react';
import { Language, PressItem } from '../types';
import { translations } from '../translations';
import '../src/styles/rich-text-editor.css';

interface PressProps {
    lang: Language;
    items: PressItem[];
}

const ITEMS_PER_PAGE = 8;

export const Press: React.FC<PressProps> = ({ lang, items }) => {
    const t = translations[lang].press;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedItem, setSelectedItem] = useState<PressItem | null>(null);

    const openItem = (item: PressItem) => {
        setSelectedItem(item);
        document.body.style.overflow = 'hidden';
    };

    const closeItem = () => {
        setSelectedItem(null);
        document.body.style.overflow = 'auto';
    };

    // Helper to parse dates for display if they are ISO
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        if (!dateStr.includes('T') && !dateStr.includes('-')) return dateStr;

        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        } catch (e) {
            return dateStr;
        }
    };

    // Extract unique categories for the current language
    const categories = Array.from(new Set(items.map(item => {
        const cat = item.category as any;
        return (cat[lang] || cat.es || cat) as string;
    }))).filter(Boolean).sort() as string[];



    // Filter items by category
    const filteredItems = items.filter(item => {
        if (selectedCategory === 'all') return true;
        const cat = (item.category as any)[lang] || (item.category as any).es || item.category;
        return cat === selectedCategory;
    });

    // Helper to parse date string (DD MMM YYYY) for sorting
    const getSortableDate = (item: PressItem): number => {
        // 1. PRIORITIZE: Parse the visible text string "DD MMM YYYY"
        // This ensures "What You See Is What You Get" sorting
        const dateStr = item.date;
        if (dateStr) {
            try {
                // Split by any whitespace to handle multiple spaces or tabs
                const parts = dateStr.trim().split(/\s+/);
                // Handle cases where separator might be '-' or '/' if user typed that
                // but the regex above only handles whitespace.
                // If parts length is 1, maybe they used '-'?
                const cleanParts = parts.length === 1 && parts[0].includes('-') ? parts[0].split('-') :
                    parts.length === 1 && parts[0].includes('/') ? parts[0].split('/') : parts;

                if (cleanParts.length >= 3) {
                    const day = parseInt(cleanParts[0]);
                    const monthStr = cleanParts[1].toLowerCase().replace('.', '');
                    const year = parseInt(cleanParts[2]);

                    if (!isNaN(day) && !isNaN(year)) {
                        const months: Record<string, number> = {
                            // Spanish
                            'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5, 'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11,
                            // English
                            'jan': 0, 'apr': 3, 'aug': 7, 'dec': 11,
                            // Common abbreviations
                            'sept': 8
                        };

                        const month = months[monthStr.substring(0, 3)];
                        // Only return if we found a valid month index
                        if (month !== undefined) {
                            return new Date(year, month, day).getTime();
                        }
                    }
                }
            } catch (e) {
                console.warn('Date parse error', e);
            }
        }

        // 2. Fallback to dateISO if parsing failed
        if (item.dateISO && !isNaN(new Date(item.dateISO).getTime())) {
            return new Date(item.dateISO).getTime();
        }

        // 3. Final fallback
        return (item.createdAt ? new Date(item.createdAt).getTime() : 0);
    };

    // Sort items: Strict Date Descending (Newest to Oldest) using robust parser
    const sortedItems = [...filteredItems].sort((a, b) => {
        const dateA = getSortableDate(a);
        const dateB = getSortableDate(b);
        return dateB - dateA;
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
                <div className="text-center mb-12">
                    <FadeIn>
                        <span className="text-maestro-gold uppercase tracking-[0.3em] text-xs font-bold mb-4 block" style={{ textShadow: '0 0 20px rgba(212,175,55,0.3)' }}>
                            {t.badge}
                        </span>
                        <h2 className="text-4xl md:text-6xl font-serif text-maestro-light mb-6 leading-tight">
                            {t.titlePrefix} <span className="italic text-maestro-gold">{t.titleSuffix}</span>
                        </h2>
                        <div className="h-px w-24 bg-maestro-gold/30 mx-auto mb-6" />
                        <p className="text-maestro-light/60 max-w-2xl mx-auto font-light leading-relaxed font-serif">
                            {t.subtitle}
                        </p>
                    </FadeIn>
                </div>

                {/* Categories Filter */}
                <div className="flex flex-wrap justify-center gap-4 mb-10">
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
                <div className="space-y-12 max-w-4xl mx-auto">
                    {items.length === 0 ? (
                        <div className="text-center text-maestro-light/40 py-10 border border-dashed border-white/5 rounded-sm">
                            {t.empty}
                        </div>
                    ) : (
                        paginatedItems.map((item, index) => (
                            <FadeIn key={item.id} delay={index * 100}>
                                <div
                                    onClick={() => openItem(item)}
                                    className="group border-b border-white/5 pb-12 hover:border-maestro-gold/30 transition-colors flex flex-col md:flex-row gap-8 items-start cursor-pointer"
                                >
                                    {/* Image Container */}
                                    <div className="md:w-64 w-full flex-shrink-0 space-y-4">
                                        <div className="aspect-[16/10] overflow-hidden border border-white/5 group-hover:border-maestro-gold/30 transition-all rounded-sm shadow-xl relative">
                                            <img
                                                src={item.image}
                                                alt={((item.title as any)[lang] || (item.title as any).es || item.title) as string}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />

                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow">
                                        <div className="flex flex-wrap items-center gap-4 mb-4">
                                            <span className="text-[10px] uppercase tracking-widest text-maestro-gold font-bold bg-maestro-gold/10 px-3 py-1 rounded-full border border-maestro-gold/20">
                                                {(item.category as any)[lang] || (item.category as any).es || item.category}
                                            </span>
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
                                            className="text-maestro-light/60 font-light leading-relaxed mb-6 italic font-serif line-clamp-3"
                                            dangerouslySetInnerHTML={{ __html: (item.excerpt as any)[lang] || (item.excerpt as any).es || item.excerpt }}
                                        />

                                        <button
                                            className="flex items-center gap-2 text-xs uppercase tracking-widest text-maestro-light/50 group-hover:text-maestro-gold transition-all"
                                        >
                                            <span>{(t as any).readMore || (lang === 'es' ? 'Leer Artículo' : 'Read Article')}</span>
                                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
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

            {/* Full Screen Article Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-black/95 backdrop-blur-xl transition-opacity animate-in fade-in duration-500"
                        onClick={closeItem}
                    />

                    <div className="relative bg-[#0a0a0a] border border-white/10 w-full h-full md:h-auto md:max-w-6xl md:max-h-[95vh] overflow-y-auto rounded-none md:rounded-lg shadow-[0_0_100px_rgba(0,0,0,1)] animate-in zoom-in-95 slide-in-from-bottom-5 duration-500 scroll-smooth">

                        <button
                            onClick={closeItem}
                            className="fixed top-8 right-8 text-maestro-light/30 hover:text-maestro-gold transition-all z-[110] bg-black/50 p-3 rounded-full border border-white/10 hover:border-maestro-gold/50 backdrop-blur-md group"
                        >
                            <X size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                        </button>

                        <div className="relative">
                            {/* Modal Hero Header */}
                            <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden">
                                {selectedItem.image ? (
                                    <img
                                        src={selectedItem.image}
                                        alt={((selectedItem.title as any)[lang] || (selectedItem.title as any).es || selectedItem.title) as string}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                        <ImageIcon className="text-white/5" size={100} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />

                                <div className="absolute bottom-0 left-0 w-full p-8 md:p-20 text-center md:text-left">
                                    <FadeIn>
                                        <div className="flex flex-wrap items-center gap-4 mb-8 justify-center md:justify-start">
                                            <span className="px-5 py-2 bg-maestro-gold/10 text-maestro-gold border border-maestro-gold/20 text-[10px] uppercase tracking-[0.3em] font-bold rounded-full shadow-2xl">
                                                {selectedItem.date}
                                            </span>
                                            <span className="px-5 py-2 bg-white/5 text-maestro-light/60 border border-white/10 text-[10px] uppercase tracking-[0.3em] font-bold rounded-full">
                                                {selectedItem.source}
                                            </span>
                                        </div>
                                        <h2 className="text-4xl md:text-7xl font-serif text-maestro-light leading-tight max-w-5xl shadow-black drop-shadow-2xl">
                                            {((selectedItem.title as any)[lang] || (selectedItem.title as any).es || selectedItem.title) as string}
                                        </h2>
                                    </FadeIn>
                                </div>
                            </div>

                            <div className="p-8 md:px-20 md:pb-32 -mt-10 relative z-10">
                                <div className="bg-[#0a0a0a] rounded-t-3xl md:rounded-t-none p-4 md:p-0">
                                    {/* Subtitle/Excerpt */}
                                    <div
                                        className="max-w-4xl mx-auto mb-16 italic font-serif text-xl border-l-2 border-maestro-gold pl-8 py-4 bg-maestro-gold/[0.02] text-maestro-light/70 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: ((selectedItem.excerpt as any)[lang] || (selectedItem.excerpt as any).es || selectedItem.excerpt) as string }}
                                    />

                                    {/* Main Content Body */}
                                    {selectedItem.content && (
                                        <div
                                            className="blog-content text-maestro-light/80 font-light leading-[2.2] text-xl max-w-4xl mx-auto mb-16"
                                            dangerouslySetInnerHTML={{ __html: ((selectedItem.content as any)[lang] || (selectedItem.content as any).es || selectedItem.content) as string }}
                                        />
                                    )}

                                    {/* External Link Section */}
                                    {selectedItem.url && (
                                        <div className="text-center py-10">
                                            <a
                                                href={selectedItem.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-3 px-10 py-5 bg-maestro-gold text-maestro-dark font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-white transition-all shadow-2xl rounded-sm"
                                            >
                                                {lang === 'es' ? 'Ir a la fuente original' : lang === 'ru' ? 'Перейти к первоисточнику' : 'Go to original source'}
                                                <ExternalLink size={16} />
                                            </a>
                                        </div>
                                    )}

                                    {/* Footer / Exit */}
                                    <div className="mt-10 text-center">
                                        <div className="w-12 h-px bg-maestro-gold mx-auto mb-6 opacity-30" />
                                        <div className="flex flex-col items-center gap-8">
                                            <button
                                                onClick={closeItem}
                                                className="text-white/40 hover:text-maestro-gold uppercase tracking-[0.4em] text-xs font-bold transition-all hover:tracking-[0.6em]"
                                            >
                                                {(t as any).closeArticle || 'Cerrar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

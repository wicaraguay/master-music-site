import React, { useState } from 'react';
import { FadeIn } from './FadeIn';
import { Calendar, ChevronRight, X, ImageIcon } from 'lucide-react';
import { BlogPost, Language } from '../types';
import { translations } from '../translations';
import '../src/styles/rich-text-editor.css';

interface BlogProps {
    posts: BlogPost[];
    lang: Language;
}

export const Blog: React.FC<BlogProps> = ({ posts, lang }) => {
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const t = translations[lang].blog;

    const openPost = (post: BlogPost) => {
        setSelectedPost(post);
        document.body.style.overflow = 'hidden';
    };

    const closePost = () => {
        setSelectedPost(null);
        document.body.style.overflow = 'auto';
    };

    // Helper to parse both ISO and D/M/YYYY dates reliably
    const parseDate = (dateStr: string) => {
        if (!dateStr) return 0;

        // Check if it's ISO format
        if (dateStr.includes('T')) {
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? 0 : date.getTime();
        }

        // Handle legacy D/M/YYYY format
        try {
            const [day, month, year] = dateStr.split('/').map(Number);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                return new Date(year, month - 1, day).getTime();
            }
        } catch (e) {
            console.warn('Invalid date format:', dateStr);
        }
        return 0;
    };

    // Elegant date formatter for display
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';

        // If it's legacy format, keep it as is (already uppercase in DB usually)
        if (!dateStr.includes('T')) return dateStr;

        // If it's ISO, format it elegantly
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;

        const day = date.getDate().toString();
        const month = (date.getMonth() + 1).toString();
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    // Sort posts: Newest first (using precise internal timestamps)
    const sortedPosts = [...posts].sort((a, b) => parseDate(b.date) - parseDate(a.date));
    const latestPostId = sortedPosts.length > 0 ? sortedPosts[0].id : null;

    return (
        <section className="relative py-24 px-6 bg-maestro-dark min-h-screen overflow-hidden">
            {/* Background Image - Adjusted for a subtle 'clarita' effect */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-fixed opacity-35"
                style={{ backgroundImage: 'url("/images/page-blog.webp")' }}
            />
            {/* Delicate gradient overlays to ensure readability and the 'clarita' look */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-maestro-dark/95 via-transparent to-maestro-dark/95" />
            <div className="absolute inset-0 z-0 bg-black/10" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-maestro-gold/5 blur-[100px] rounded-full" />
                    <span className="text-maestro-gold uppercase tracking-widest text-sm font-bold relative">{t.badge}</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-maestro-light mt-4 relative">
                        {t.titlePrefix} <span className="italic text-maestro-gold">{t.titleSuffix}</span>
                    </h2>
                    <p className="mt-6 text-maestro-light/60 max-w-xl mx-auto font-light relative">
                        {t.subtitle}
                    </p>
                </div>

                {/* Posts Feed */}
                <div className="space-y-12">
                    {sortedPosts.length === 0 && (
                        <div className="text-center text-maestro-light/40 py-10 border border-dashed border-white/5 rounded-sm">
                            {t.empty}
                        </div>
                    )}
                    {sortedPosts.map((post, idx) => (
                        <FadeIn key={post.id} delay={idx * 100}>
                            <article
                                onClick={() => openPost(post)}
                                className="group border-b border-white/5 pb-12 hover:border-maestro-gold/30 transition-colors cursor-pointer"
                            >
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    {/* Preview Image / Date Badge */}
                                    <div className="md:w-64 w-full flex-shrink-0 space-y-4">
                                        {post.previewImage ? (
                                            <div className="aspect-[16/10] overflow-hidden border border-white/5 group-hover:border-maestro-gold/30 transition-all rounded-sm shadow-xl relative">
                                                <img
                                                    src={post.previewImage}
                                                    alt={post.title as string}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                {post.id === latestPostId && (
                                                    <div className="absolute top-0 left-0 bg-maestro-gold text-black text-[9px] font-bold px-2 py-1 uppercase tracking-tighter">
                                                        {t.featuredLabel}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="aspect-[16/10] bg-white/5 border border-white/5 flex items-center justify-center rounded-sm relative">
                                                <ImageIcon className="text-white/10" size={32} />
                                                {post.id === latestPostId && (
                                                    <div className="absolute top-0 left-0 bg-maestro-gold text-black text-[9px] font-bold px-2 py-1 uppercase tracking-tighter">
                                                        {t.featuredLabel}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <span className="flex items-center gap-2 text-xs text-maestro-gold uppercase tracking-widest font-bold border border-white/10 px-3 py-2 inline-block">
                                            <Calendar size={12} /> {formatDate(post.date)}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow">
                                        <h3 className="text-3xl font-serif text-maestro-light mb-4 group-hover:text-maestro-gold transition-colors">
                                            {post.title}
                                        </h3>

                                        {post.images && post.images.length > 0 && (
                                            <div className="mb-4 flex items-center gap-2 text-maestro-light/40 text-xs uppercase tracking-widest">
                                                <ImageIcon size={14} />
                                                {post.images.length} {t.galleryCount}
                                            </div>
                                        )}

                                        <p className="text-maestro-light/60 font-light leading-relaxed mb-6 whitespace-pre-line line-clamp-3 italic">
                                            {post.preview}
                                        </p>
                                        <button className="flex items-center gap-2 text-xs uppercase tracking-widest text-maestro-light/50 group-hover:text-maestro-gold transition-all">
                                            {t.readMore} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        </FadeIn>
                    ))}
                </div>
            </div>

            {/* Full Screen Article Modal */}
            {selectedPost && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-black/95 backdrop-blur-xl transition-opacity animate-in fade-in duration-500"
                        onClick={closePost}
                    />

                    <div className="relative bg-[#0a0a0a] border border-white/10 w-full h-full md:h-auto md:max-w-6xl md:max-h-[95vh] overflow-y-auto rounded-none md:rounded-lg shadow-[0_0_100px_rgba(0,0,0,1)] animate-in zoom-in-95 slide-in-from-bottom-5 duration-500 scroll-smooth">

                        <button
                            onClick={closePost}
                            className="fixed top-8 right-8 text-maestro-light/30 hover:text-maestro-gold transition-all z-[110] bg-black/50 p-3 rounded-full border border-white/10 hover:border-maestro-gold/50 backdrop-blur-md group"
                        >
                            <X size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                        </button>

                        <div className="relative">
                            {/* Modal Hero Header */}
                            <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden">
                                {selectedPost.previewImage ? (
                                    <img
                                        src={selectedPost.previewImage}
                                        alt={selectedPost.title as string}
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
                                        <span className="px-5 py-2 bg-maestro-gold/10 text-maestro-gold border border-maestro-gold/20 text-[10px] uppercase tracking-[0.3em] font-bold rounded-full mb-8 inline-block shadow-2xl">
                                            {formatDate(selectedPost.date)}
                                        </span>
                                        <h2 className="text-4xl md:text-7xl font-serif text-maestro-light leading-tight max-w-5xl shadow-black drop-shadow-2xl">
                                            {selectedPost.title}
                                        </h2>
                                    </FadeIn>
                                </div>
                            </div>

                            <div className="p-8 md:px-20 md:pb-32 -mt-10 relative z-10">
                                <div className="bg-[#0a0a0a] rounded-t-3xl md:rounded-t-none p-4 md:p-0">
                                    {/* Subtitle/Excerpt */}
                                    <div className="max-w-4xl mx-auto mb-16 italic font-serif text-xl border-l-2 border-maestro-gold pl-8 py-4 bg-maestro-gold/[0.02] text-maestro-light/70 leading-relaxed">
                                        {selectedPost.preview}
                                    </div>

                                    {/* Main Content Body */}
                                    <div
                                        className="blog-content text-maestro-light/80 font-light leading-[2.2] text-xl max-w-4xl mx-auto"
                                        dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                                    />

                                    {/* Integrated Gallery */}
                                    {selectedPost.images && selectedPost.images.length > 0 && (
                                        <div className="mt-24 max-w-5xl mx-auto">
                                            <div className="flex items-center gap-6 mb-12">
                                                <div className="h-px bg-white/10 flex-grow" />
                                                <h4 className="text-3xl font-serif text-maestro-light italic">
                                                    {t.galleryTitle}
                                                </h4>
                                                <div className="h-px bg-white/10 flex-grow" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {selectedPost.images.map((img, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`relative overflow-hidden group rounded-sm border border-white/5 shadow-2xl ${selectedPost.images && selectedPost.images.length % 2 !== 0 && idx === 0 ? 'md:col-span-2 aspect-video' : 'aspect-[4/3]'
                                                            }`}
                                                    >
                                                        <img
                                                            src={img}
                                                            alt={`Gallery ${idx + 1}`}
                                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer / Exit */}
                                    <div className="mt-32 text-center">
                                        <div className="w-12 h-px bg-maestro-gold mx-auto mb-10 opacity-50" />
                                        <button
                                            onClick={closePost}
                                            className="text-white/40 hover:text-maestro-gold uppercase tracking-[0.4em] text-xs font-bold transition-all hover:tracking-[0.6em]"
                                        >
                                            {t.closeArticle}
                                        </button>
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
import React, { useState } from 'react';
import { FadeIn } from './FadeIn';
import { Calendar, ChevronRight, X, ImageIcon } from 'lucide-react';
import { BlogPost, Language } from '../types';
import { translations } from '../translations';

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

  return (
    <section className="py-24 px-6 bg-maestro-dark min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-maestro-gold uppercase tracking-widest text-sm font-bold">{t.badge}</span>
          <h2 className="text-4xl md:text-5xl font-serif text-maestro-light mt-4">
            {t.titlePrefix} <span className="italic text-maestro-gold">{t.titleSuffix}</span>
          </h2>
          <p className="mt-6 text-maestro-light/60 max-w-xl mx-auto font-light">
            {t.subtitle}
          </p>
        </div>

        {/* Posts Feed */}
        <div className="space-y-12">
            {posts.length === 0 && (
                <div className="text-center text-maestro-light/40 py-10">
                    {t.empty}
                </div>
            )}
            {posts.map((post, idx) => (
                <FadeIn key={post.id} delay={idx * 100}>
                    <article 
                        onClick={() => openPost(post)}
                        className="group border-b border-white/5 pb-12 hover:border-maestro-gold/30 transition-colors cursor-pointer"
                    >
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Date Badge */}
                            <div className="md:w-32 flex-shrink-0">
                                <span className="flex items-center gap-2 text-xs text-maestro-gold uppercase tracking-widest font-bold border border-white/10 px-3 py-2 inline-block">
                                    <Calendar size={12} /> {post.date}
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

                                <p className="text-maestro-light/60 font-light leading-relaxed mb-6 whitespace-pre-line line-clamp-3">
                                    {post.preview}
                                </p>
                                <button className="flex items-center gap-2 text-xs uppercase tracking-widest text-maestro-light/50 hover:text-maestro-gold transition-colors">
                                    {t.readMore} <ChevronRight size={14} />
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            
            {/* Backdrop with Blur */}
            <div 
                className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-500" 
                onClick={closePost}
            />

            {/* Modal Content */}
            <div className="relative bg-maestro-dark border border-white/10 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl animate-[fadeIn_0.5s_ease-out]">
                
                <button 
                    onClick={closePost}
                    className="fixed top-6 right-6 md:absolute md:top-8 md:right-8 text-maestro-light/50 hover:text-maestro-gold transition-colors z-50 bg-black/50 p-2 rounded-full md:bg-transparent"
                >
                    <X size={32} />
                </button>

                <div className="p-8 md:p-16">
                    {/* Header */}
                    <div className="border-b border-white/10 pb-8 mb-8">
                        <span className="flex items-center gap-2 text-xs text-maestro-gold uppercase tracking-widest font-bold mb-4">
                            <Calendar size={12} /> {selectedPost.date}
                        </span>
                        <h2 className="text-4xl md:text-6xl font-serif text-maestro-light leading-tight">
                            {selectedPost.title}
                        </h2>
                    </div>

                    {/* Main Text Content */}
                    <div className="text-maestro-light/80 font-light leading-loose text-lg whitespace-pre-line max-w-3xl">
                        {selectedPost.content}
                    </div>

                    {/* Image Gallery Grid */}
                    {selectedPost.images && selectedPost.images.length > 0 && (
                        <div className="mt-16 border-t border-white/10 pt-16">
                            <h4 className="text-2xl font-serif text-maestro-light mb-8 flex items-center gap-3">
                                <ImageIcon className="text-maestro-gold" /> {t.galleryTitle}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {selectedPost.images.map((img, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`relative overflow-hidden group ${
                                            // Make the first image span 2 columns if it's the only one or for layout variety
                                            selectedPost.images && selectedPost.images.length % 2 !== 0 && idx === 0 ? 'md:col-span-2 aspect-video' : 'aspect-[4/3]'
                                        }`}
                                    >
                                        <img 
                                            src={img} 
                                            alt={`Gallery ${idx + 1}`} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </section>
  );
};
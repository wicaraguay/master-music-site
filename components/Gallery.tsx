import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FadeIn } from './FadeIn';
import { GalleryItem, Language } from '../types';
import { translations } from '../translations';
import { X, ChevronLeft, ChevronRight, ZoomIn, PlayCircle, Image as ImageIcon, Video } from 'lucide-react';

import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '../src/utils/video';

interface GalleryProps {
  items: GalleryItem[];
  lang: Language;
}

export const Gallery: React.FC<GalleryProps> = ({ items, lang }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const t = translations[lang].gallery;

  // Filter items based on active tab
  const displayedItems = items.filter(item =>
    activeTab === 'photos' ? item.type === 'image' : item.type === 'video'
  );

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % displayedItems.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + displayedItems.length) % displayedItems.length);
    }
  };

  return (
    <section className="relative py-24 px-6 bg-maestro-dark min-h-screen overflow-hidden">
      {/* Background Image requested by user - Adjusted for more clarity */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed opacity-60"
        style={{ backgroundImage: 'url("/images/pagination-gallery.webp")' }}
      />
      {/* Delicate gradient overlays to ensure readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-maestro-dark/80 via-transparent to-maestro-dark/80" />
      <div className="absolute inset-0 z-0 bg-black/20" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-maestro-gold uppercase tracking-widest text-sm font-bold">{t.badge}</span>
          <h2 className="text-4xl md:text-5xl font-serif text-maestro-light mt-4 mb-6">
            {t.titlePrefix} <span className="italic text-maestro-gold">{t.titleSuffix}</span>
          </h2>
          <p className="text-maestro-light/60 max-w-2xl mx-auto font-light">
            {t.subtitle}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-16 gap-8">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 pb-2 text-sm uppercase tracking-widest transition-all ${activeTab === 'photos'
              ? 'text-maestro-gold border-b border-maestro-gold'
              : 'text-maestro-light/50 hover:text-maestro-gold'
              }`}
          >
            <ImageIcon size={16} /> {t.tabPhotos}
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 pb-2 text-sm uppercase tracking-widest transition-all ${activeTab === 'videos'
              ? 'text-maestro-gold border-b border-maestro-gold'
              : 'text-maestro-light/50 hover:text-maestro-gold'
              }`}
          >
            <Video size={16} /> {t.tabVideos}
          </button>
        </div>

        {/* Grid Layout (Garantiza 3 por fila en escritorio) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedItems.map((item, index) => (
            <FadeIn key={item.id} delay={index * 50}>
              <div
                className="group relative cursor-pointer overflow-hidden rounded-sm bg-maestro-gray aspect-video"
                onClick={() => openLightbox(index)}
              >
                {/* Media Preview */}
                <div className="relative">
                  <img
                    src={item.type === 'video' ? (item.thumbnail || getYouTubeThumbnailUrl(item.src)) : item.src}
                    alt={item.caption}
                    className="w-full h-auto object-cover transition-all duration-1000 transform group-hover:scale-110 grayscale hover:grayscale-0"
                    loading="lazy"
                  />

                  {/* Video Indicator */}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm">
                        <PlayCircle className="text-white" size={24} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-6 text-center">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-maestro-gold text-xs uppercase tracking-widest font-bold mb-2 block">
                      {item.category}
                    </span>
                    <p className="text-white font-serif text-xl italic mb-4">
                      "{item.caption}"
                    </p>
                    {item.type === 'video' ? <PlayCircle className="text-white/50 mx-auto" size={24} /> : <ZoomIn className="text-white/50 mx-auto" size={24} />}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Empty State */}
        {displayedItems.length === 0 && (
          <div className="text-center text-maestro-light/30 py-20 italic font-serif text-xl">
            {activeTab === 'photos' ? t.emptyPhotos : t.emptyVideos}
          </div>
        )}

        {/* Lightbox Modal - Using Portal to ensure it renders above the Navigation bar */}
        {selectedImageIndex !== null && createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/98 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out]"
            style={{ zIndex: 99999 }}
          >

            {/* Navigation Buttons */}
            {displayedItems.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 md:left-8 text-white/30 hover:text-white transition-colors p-4 z-50 hidden md:block"
                >
                  <ChevronLeft size={64} />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 md:right-8 text-white/30 hover:text-white transition-colors p-4 z-50 hidden md:block"
                >
                  <ChevronRight size={64} />
                </button>
              </>
            )}

            {/* Main Media Container */}
            <div className="relative max-w-5xl w-full max-h-[90vh] p-6 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>

              {displayedItems[selectedImageIndex].type === 'image' ? (
                <img
                  src={displayedItems[selectedImageIndex].src}
                  alt={displayedItems[selectedImageIndex].caption}
                  className="max-h-[80vh] w-auto object-contain shadow-2xl border border-white/5"
                />
              ) : (
                <div className="w-full aspect-video max-w-3xl bg-black border border-white/10 shadow-2xl overflow-hidden rounded-lg">
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYouTubeEmbedUrl(displayedItems[selectedImageIndex].src)}
                    title={displayedItems[selectedImageIndex].caption}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              )}

              <div className="mt-8 text-center max-w-2xl px-4">
                <span className="text-maestro-gold text-xs uppercase tracking-[0.3em] font-bold block mb-2">
                  {displayedItems[selectedImageIndex].category}
                </span>
                <h3 className="text-white/95 font-serif text-xl md:text-3xl leading-snug drop-shadow-md">
                  {displayedItems[selectedImageIndex].caption}
                </h3>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <div className="h-px w-8 bg-maestro-gold/30" />
                  <p className="text-white/40 text-xs tracking-widest font-bold">
                    {selectedImageIndex + 1} / {displayedItems.length}
                  </p>
                  <div className="h-px w-8 bg-maestro-gold/30" />
                </div>
              </div>
            </div>

            {/* Mobile Navigation Overlay (Click sides to navigate) */}
            <div className="absolute inset-y-0 left-0 w-1/4 z-[99998] md:hidden cursor-pointer" onClick={prevImage} />
            <div className="absolute inset-y-0 right-0 w-1/4 z-[99998] md:hidden cursor-pointer" onClick={nextImage} />

            {/* Close Button - Positioned absolutely inside the body-level portal for maximum clickability */}
            <button
              onClick={closeLightbox}
              className="fixed top-8 right-8 text-white/50 hover:text-maestro-gold hover:scale-110 transition-all duration-300 p-4 hover:bg-white/5 rounded-full cursor-pointer z-[99999]"
              style={{ zIndex: 100000, pointerEvents: 'auto' }}
              aria-label="Close gallery"
            >
              <X size={48} strokeWidth={1.5} />
            </button>
          </div>,
          document.body
        )}

      </div>
    </section>
  );
};
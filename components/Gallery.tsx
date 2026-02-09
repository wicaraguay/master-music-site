import React, { useState } from 'react';
import { FadeIn } from './FadeIn';
import { GalleryItem, Language } from '../types';
import { translations } from '../translations';
import { X, ChevronLeft, ChevronRight, ZoomIn, PlayCircle, Image as ImageIcon, Video } from 'lucide-react';

interface GalleryProps {
  items: GalleryItem[];
  lang: Language;
}

export const Gallery: React.FC<GalleryProps> = ({ items, lang }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const t = translations['es'].gallery;

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
    <section className="py-24 px-6 bg-maestro-dark min-h-screen">
      <div className="max-w-7xl mx-auto">

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

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {displayedItems.map((item, index) => (
            <FadeIn key={item.id} delay={index * 50}>
              <div
                className="group relative cursor-pointer break-inside-avoid overflow-hidden rounded-sm bg-maestro-gray"
                onClick={() => openLightbox(index)}
              >
                {/* Media Preview */}
                <div className="relative">
                  <img
                    src={item.type === 'video' ? (item.thumbnail || item.src) : item.src}
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
            {activeTab === 'photos' ? 'No hay fotos disponibles.' : 'No hay videos disponibles.'}
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedImageIndex !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">

            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/50 hover:text-maestro-gold transition-colors z-50"
            >
              <X size={40} />
            </button>

            {/* Navigation Buttons */}
            {displayedItems.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 md:left-8 text-white/30 hover:text-white transition-colors p-4 z-50 hidden md:block"
                >
                  <ChevronLeft size={48} />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 md:right-8 text-white/30 hover:text-white transition-colors p-4 z-50 hidden md:block"
                >
                  <ChevronRight size={48} />
                </button>
              </>
            )}

            {/* Main Media Container */}
            <div className="relative max-w-6xl w-full max-h-[90vh] p-4 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>

              {displayedItems[selectedImageIndex].type === 'image' ? (
                <img
                  src={displayedItems[selectedImageIndex].src}
                  alt={displayedItems[selectedImageIndex].caption}
                  className="max-h-[80vh] w-auto object-contain shadow-2xl border border-white/5"
                />
              ) : (
                <div className="w-full aspect-video max-w-4xl bg-black border border-white/10 shadow-2xl">
                  <iframe
                    width="100%"
                    height="100%"
                    src={displayedItems[selectedImageIndex].src}
                    title={displayedItems[selectedImageIndex].caption}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              <div className="mt-6 text-center">
                <span className="text-maestro-gold text-xs uppercase tracking-widest font-bold block mb-1">
                  {displayedItems[selectedImageIndex].category}
                </span>
                <p className="text-white/80 font-serif text-lg md:text-2xl">
                  {displayedItems[selectedImageIndex].caption}
                </p>
                <p className="text-white/30 text-xs mt-2">
                  {selectedImageIndex + 1} / {displayedItems.length}
                </p>
              </div>
            </div>

            {/* Mobile Navigation Overlay (Click sides to navigate) */}
            <div className="absolute inset-y-0 left-0 w-1/4 z-40 md:hidden" onClick={prevImage} />
            <div className="absolute inset-y-0 right-0 w-1/4 z-40 md:hidden" onClick={nextImage} />

          </div>
        )}

      </div>
    </section>
  );
};
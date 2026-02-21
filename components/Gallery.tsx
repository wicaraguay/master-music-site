import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FadeIn } from './FadeIn';
import { GalleryItem, Language } from '../types';
import { translations } from '../translations';
import { X, ChevronLeft, ChevronRight, ZoomIn, PlayCircle, Image as ImageIcon, Video, Music, ChevronDown, ArrowRight } from 'lucide-react';

import { getVideoEmbedUrl, getVideoThumbnailUrl } from '../src/utils/video';
import { getSoundCloudEmbedUrl, getSoundCloudOriginalUrl } from '../src/utils/audio';

interface GalleryProps {
  items: GalleryItem[];
  lang: Language;
}

const ITEMS_PER_PAGE = 9;

export const Gallery: React.FC<GalleryProps> = ({ items, lang }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'audio'>('photos');
  const [activeSubTab, setActiveSubTab] = useState<string>('all');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [visibleItemsCount, setVisibleItemsCount] = useState(ITEMS_PER_PAGE);
  const t = translations[lang].gallery;

  // Filter items based on active tab and dynamic sub-categories
  const displayedItems = items.filter(item => {
    const mainTypeMatch = (activeTab === 'photos' && item.type === 'image') ||
      (activeTab === 'videos' && item.type === 'video') ||
      (activeTab === 'audio' && item.type === 'audio');

    if (!mainTypeMatch) return false;
    if (activeSubTab === 'all') return true;
    return item.subCategory === activeSubTab;
  });

  // Items actually sliced for display
  const paginatedItems = displayedItems.slice(0, visibleItemsCount);

  // Calculate dynamic sub-categories for the active tab
  const dynamicSubTabs = Array.from(new Set(items
    .filter(item => {
      if (activeTab === 'photos') return item.type === 'image';
      if (activeTab === 'videos') return item.type === 'video';
      if (activeTab === 'audio') return item.type === 'audio';
      return false;
    })
    .map(item => (item.subCategory as any)) // transformDataForLang ya lo traduce
    .filter(Boolean)
  )) as string[];

  // Reset sub-tab and visible count when main tab changes
  useEffect(() => {
    setActiveSubTab('all');
    setVisibleItemsCount(ITEMS_PER_PAGE);
  }, [activeTab]);

  // Reset visible count when sub-tab changes
  useEffect(() => {
    setVisibleItemsCount(ITEMS_PER_PAGE);
  }, [activeSubTab]);

  const openLightbox = (index: number) => {
    // In the lightbox, we should pass the index relative to displayedItems 
    // to allow navigation through all filtered items, or relative to paginatedItems?
    // Usually lightbox should allow navigating all FILTERED items even if not "loaded" yet in grid?
    // Let's use displayedItems for the lightbox to avoid confusing the user.
    setSelectedImageIndex(index);
    setIsDescriptionExpanded(false);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
    setIsDescriptionExpanded(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDescriptionExpanded(false);
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % displayedItems.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDescriptionExpanded(false);
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
        <div className="flex flex-wrap justify-center mb-16 gap-4 md:gap-8">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 pb-2 text-xs md:text-sm uppercase tracking-widest transition-all ${activeTab === 'photos'
              ? 'text-maestro-gold border-b border-maestro-gold'
              : 'text-maestro-light/50 hover:text-maestro-gold'
              }`}
          >
            <ImageIcon size={16} /> {t.tabPhotos}
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 pb-2 text-xs md:text-sm uppercase tracking-widest transition-all ${activeTab === 'videos'
              ? 'text-maestro-gold border-b border-maestro-gold'
              : 'text-maestro-light/50 hover:text-maestro-gold'
              }`}
          >
            <Video size={16} /> {t.tabVideos}
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 pb-2 text-xs md:text-sm uppercase tracking-widest transition-all ${activeTab === 'audio'
              ? 'text-maestro-gold border-b border-maestro-gold'
              : 'text-maestro-light/50 hover:text-maestro-gold'
              }`}
          >
            <Music size={16} /> {(t as any).tabAudio}
          </button>
        </div>

        {/* Dynamic Sub-filters - Shown for any tab that has sub-categories */}
        {dynamicSubTabs.length > 0 && (
          <FadeIn>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button
                onClick={() => setActiveSubTab('all')}
                className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all border ${activeSubTab === 'all'
                  ? 'bg-maestro-gold text-maestro-dark border-maestro-gold shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                  : 'text-maestro-light/40 border-white/10 hover:border-maestro-gold/50 hover:text-maestro-gold'
                  }`}
              >
                {(t as any).filterAll || "Todos"}
              </button>
              {dynamicSubTabs.map((subTab) => (
                <button
                  key={subTab}
                  onClick={() => setActiveSubTab(subTab)}
                  className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all border ${activeSubTab === subTab
                    ? 'bg-maestro-gold text-maestro-dark border-maestro-gold shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                    : 'text-maestro-light/40 border-white/10 hover:border-maestro-gold/50 hover:text-maestro-gold'
                    }`}
                >
                  {subTab}
                </button>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Grid Layout (Garantiza 3 por fila en escritorio) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedItems.map((item, index) => (
            <FadeIn key={item.id} delay={index * 50}>
              <div
                className="group relative cursor-pointer overflow-hidden rounded-sm bg-maestro-gray aspect-video"
                onClick={() => openLightbox(index)}
              >
                {/* Media Preview */}
                <div className="relative h-full">
                  <img
                    src={
                      item.type === 'audio'
                        ? (item.thumbnail || '/images/audio-section.webp')
                        : (item.type === 'video' ? (item.thumbnail || getVideoThumbnailUrl(item.src)) : item.src)
                    }
                    alt={(typeof item.category === 'object' ? (item.category as any)[lang] || (item.category as any).es : item.category) || ''}
                    className="w-full h-full object-cover transition-all duration-1000 transform group-hover:scale-110 grayscale hover:grayscale-0"
                    loading="lazy"
                  />

                  {/* Icon Indicator */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm">
                      {item.type === 'video' ? (
                        <PlayCircle className="text-white" size={24} />
                      ) : item.type === 'audio' ? (
                        <Music className="text-white" size={24} />
                      ) : (
                        <ZoomIn className="text-white" size={24} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Overlay on Hover - Rediseñado para evitar sobrecarga de texto */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-6 text-center">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 w-full">
                    <span className="text-maestro-gold text-[10px] uppercase tracking-[0.3em] font-bold mb-2 block">
                      {(typeof item.category === 'object' ? (item.category as any)[lang] || (item.category as any).es : item.category) || ''}
                    </span>
                    {item.author && (
                      <p className="text-white/60 text-xs uppercase tracking-widest mb-2 font-medium">
                        {(typeof item.author === 'object' ? (item.author as any)[lang] || (item.author as any).es : item.author) || ''}
                      </p>
                    )}
                    <div className="h-px w-12 bg-maestro-gold/30 mx-auto mb-4" />

                    {/* El botón indica acción según el tipo */}
                    <div className="flex items-center justify-center gap-2 text-white/90 font-serif italic text-lg decoration-maestro-gold/30 underline-offset-4 hover:underline">
                      {item.type === 'audio' ? <Music size={18} /> : item.type === 'video' ? <PlayCircle size={18} /> : <ImageIcon size={18} />}
                      <span>{item.type === 'audio' ? 'Escuchar Grabación' : 'Ver Detalles'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Load More Button */}
        {visibleItemsCount < displayedItems.length && (
          <div className="mt-16 text-center">
            <button
              onClick={() => setVisibleItemsCount(prev => prev + ITEMS_PER_PAGE)}
              className="group relative px-10 py-4 bg-transparent border border-maestro-gold/30 hover:border-maestro-gold text-maestro-gold uppercase tracking-[0.3em] text-xs font-bold transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Explorar Más</span>
              <div className="absolute inset-0 bg-maestro-gold/10 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </div>
        )}

        {/* Empty State */}
        {displayedItems.length === 0 && (
          <div className="text-center text-maestro-light/30 py-20 italic font-serif text-xl">
            {activeTab === 'photos' ? t.emptyPhotos : activeTab === 'videos' ? t.emptyVideos : (t as any).emptyAudio}
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedImageIndex !== null && createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/98 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out] overflow-y-auto pt-20 pb-10"
            style={{ zIndex: 99999 }}
            onClick={closeLightbox}
          >

            {/* Navigation Buttons */}
            {displayedItems.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-4 z-50 hidden md:block"
                >
                  <ChevronLeft size={64} />
                </button>

                <button
                  onClick={nextImage}
                  className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-4 z-50 hidden md:block"
                >
                  <ChevronRight size={64} />
                </button>
              </>
            )}

            {/* Main Media Container */}
            <div className="relative max-w-4xl w-full px-6 flex flex-col items-center my-auto" onClick={(e) => e.stopPropagation()}>

              {displayedItems[selectedImageIndex].type === 'image' ? (
                <img
                  src={displayedItems[selectedImageIndex].src}
                  alt={(typeof displayedItems[selectedImageIndex].category === 'object' ? (displayedItems[selectedImageIndex].category as any)[lang] || (displayedItems[selectedImageIndex].category as any).es : displayedItems[selectedImageIndex].category) || ''}
                  className="max-h-[70vh] w-auto object-contain shadow-2xl border border-white/5"
                />
              ) : displayedItems[selectedImageIndex].type === 'video' ? (
                <div className="w-full aspect-video bg-black border border-white/10 shadow-2xl overflow-hidden rounded-lg">
                  <iframe
                    width="100%"
                    height="100%"
                    src={getVideoEmbedUrl(displayedItems[selectedImageIndex].src)}
                    title={(typeof displayedItems[selectedImageIndex].category === 'object' ? (displayedItems[selectedImageIndex].category as any)[lang] || (displayedItems[selectedImageIndex].category as any).es : displayedItems[selectedImageIndex].category) || ''}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              ) : (
                <div className="w-full h-[166px] md:h-[200px] bg-black/40 border border-white/10 shadow-2xl overflow-hidden rounded-lg flex items-center justify-center">
                  <iframe
                    width="100%"
                    height="100%"
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay"
                    src={getSoundCloudEmbedUrl(displayedItems[selectedImageIndex].src)}
                    className="w-full h-full"
                  ></iframe>
                </div>
              )}

              {/* Information Section */}
              <div className="mt-8 text-center w-full max-w-2xl bg-white/5 p-8 rounded-lg border border-white/10 backdrop-blur-sm">
                <span className="text-maestro-gold text-xs uppercase tracking-[0.4em] font-bold block mb-3">
                  {(typeof displayedItems[selectedImageIndex].category === 'object' ? (displayedItems[selectedImageIndex].category as any)[lang] || (displayedItems[selectedImageIndex].category as any).es : displayedItems[selectedImageIndex].category) || ''}
                </span>

                {displayedItems[selectedImageIndex].author && (
                  <h4 className="text-white/60 text-sm uppercase tracking-[0.2em] font-medium mb-4">
                    {(typeof displayedItems[selectedImageIndex].author === 'object' ? (displayedItems[selectedImageIndex].author as any)[lang] || (displayedItems[selectedImageIndex].author as any).es : displayedItems[selectedImageIndex].author) || ''}
                  </h4>
                )}

                <div className="h-px w-24 bg-maestro-gold/20 mx-auto mb-6" />

                {/* Description - Collapsible if long */}
                <div className="relative">
                  <p className={`text-white/80 font-serif italic text-lg md:text-xl leading-relaxed transition-all duration-500 overflow-hidden ${isDescriptionExpanded ? 'max-h-[1000px]' : 'max-h-[80px]'}`}>
                    "{(typeof displayedItems[selectedImageIndex].caption === 'object' ? (displayedItems[selectedImageIndex].caption as any)[lang] || (displayedItems[selectedImageIndex].caption as any).es : displayedItems[selectedImageIndex].caption) || ''}"
                  </p>

                  {((typeof displayedItems[selectedImageIndex].caption === 'object' ? (displayedItems[selectedImageIndex].caption as any)[lang] || (displayedItems[selectedImageIndex].caption as any).es : displayedItems[selectedImageIndex].caption) || '').length > 100 && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-4 text-maestro-gold text-[10px] uppercase tracking-widest font-bold hover:text-white transition-colors flex items-center gap-2 mx-auto border border-maestro-gold/30 px-4 py-2 rounded-full hover:bg-maestro-gold/10"
                    >
                      {isDescriptionExpanded ? 'Mostrar menos' : 'Leer descripción completa'}
                      <ChevronDown size={12} className={`transition-transform duration-300 ${isDescriptionExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {/* External Link Section */}
                <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-maestro-gold/30" />
                    <p className="text-white/30 text-[10px] tracking-widest font-bold uppercase">
                      {selectedImageIndex + 1} / {displayedItems.length}
                    </p>
                    <div className="h-px w-8 bg-maestro-gold/30" />
                  </div>

                  {displayedItems[selectedImageIndex].type === 'audio' && (
                    <a
                      href={getSoundCloudOriginalUrl(displayedItems[selectedImageIndex].src)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-maestro-gold hover:text-white transition-colors text-[10px] uppercase tracking-[0.2em] font-bold group"
                    >
                      <span>Ir a SoundCloud</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="fixed top-8 right-8 text-white/50 hover:text-maestro-gold hover:scale-110 transition-all duration-300 p-4 hover:bg-white/5 rounded-full cursor-pointer z-[99999]"
              style={{ zIndex: 100000 }}
              aria-label="Close"
            >
              <X size={32} />
            </button>
          </div>,
          document.body
        )}

      </div>
    </section>
  );
};

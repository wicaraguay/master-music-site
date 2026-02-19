import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Home } from './components/Home';
import { About } from './components/About';
import { Experience } from './components/Experience';
import { Research } from './components/Research';
import { Performances } from './components/Performances';
import { Gallery } from './components/Gallery';
import { Press } from './components/Press';
import { Blog } from './components/Blog';
import { Contact } from './components/Contact';
import { Resources } from './components/Resources';

import { Admin } from './components/Admin';
import { translations, getInitialExperience, getInitialPerformances, getInitialPosts, getInitialResearch, getInitialResources, getInitialGallery } from './translations';
import { Section, BlogPost, Resource, ExperienceItem, ResearchPaper, Performance, GalleryItem, Language, ContactMessage, PressItem } from './types';
// Note: importing Section from translations might be wrong if it's in types.ts.
// Step 144 showed: import { Section, ... } from './types';
// I need to be careful with imports.

import { subscribeToCollection, transformDataForLang } from './src/services/db';
import { subscribeToAuthChanges } from './src/services/auth';
import type { User } from 'firebase/auth';
import { Terminal, Menu, X, Globe, ArrowUp, Instagram, Linkedin, Youtube, Facebook, Send, MessageCircle } from 'lucide-react';



function App() {
  const [currentSection, setCurrentSection] = useState<Section>(Section.HOME);
  const [lang, setLang] = useState<Language>('es');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll to top logic
  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling past the hero section (1 viewport height)
      if (window.scrollY > window.innerHeight) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Raw data from Firestore (contains all languages)
  const [rawPosts, setRawPosts] = useState<any[]>([]);
  const [rawResources, setRawResources] = useState<any[]>([]);
  const [rawExperience, setRawExperience] = useState<any[]>([]);
  const [rawResearch, setRawResearch] = useState<any[]>([]);
  const [rawPerformances, setRawPerformances] = useState<any[]>([]);
  const [rawGallery, setRawGallery] = useState<any[]>([]);
  const [rawPress, setRawPress] = useState<any[]>([]);
  const [rawMessages, setRawMessages] = useState<any[]>([]);
  const [rawAbout, setRawAbout] = useState<any[]>([]);

  // Transformed data for display (current language)
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [research, setResearch] = useState<ResearchPaper[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [press, setPress] = useState<PressItem[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [aboutData, setAboutData] = useState<any>(null);

  // Auto-detect Language
  useEffect(() => {
    const userLang = navigator.language.slice(0, 2);
    if (userLang === 'ru') setLang('ru');
    else if (userLang === 'en') setLang('en');
    else setLang('es');
  }, []);

  // Auth Subscription
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Data Subscriptions
  useEffect(() => {
    const unsubs = [
      subscribeToCollection('posts', setRawPosts),
      subscribeToCollection('resources', setRawResources),
      subscribeToCollection('experience', setRawExperience),
      subscribeToCollection('research', setRawResearch),
      subscribeToCollection('performances', setRawPerformances),
      subscribeToCollection('gallery', setRawGallery),
      subscribeToCollection('press', setRawPress),
      subscribeToCollection('messages', setRawMessages),
      subscribeToCollection('about', setRawAbout)
    ];

    return () => unsubs.forEach(unsub => unsub());
  }, []);

  // Transform data based on current language
  useEffect(() => {
    setPosts(transformDataForLang(rawPosts, lang));
    setResources(transformDataForLang(rawResources, lang));
    setExperience(transformDataForLang(rawExperience, lang));
    setResearch(transformDataForLang(rawResearch, lang));
    setPerformances(transformDataForLang(rawPerformances, lang));
    setGallery(transformDataForLang(rawGallery, lang));
    setPress(transformDataForLang(rawPress, lang));
    setMessages(rawMessages); // Messages don't need transformation

    // About data is a single object, but stored as a collection item
    if (rawAbout.length > 0) {
      const transformedAbout = transformDataForLang(rawAbout, lang)[0];
      // Sections also need to be transformed if they contain LocalizedString
      if (transformedAbout && transformedAbout.sections) {
        transformedAbout.sections = transformedAbout.sections.map((section: any) => {
          if (section.type === 'text' && section.content) {
            // transformDataForLang does shallow transformation, but sections are nested
            // The transformDataForLang logic might need to handle this or we do it here
            const content = section.content;
            return {
              ...section,
              content: content[lang] || content['es'] || content['en'] || ''
            };
          }
          return section;
        });
      }
      setAboutData(transformedAbout);
    }
  }, [rawPosts, rawResources, rawExperience, rawResearch, rawPerformances, rawGallery, rawPress, rawMessages, rawAbout, lang]);

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentSection]);

  const renderSection = () => {
    switch (currentSection) {
      case Section.HOME:
        return <Home onNavigate={setCurrentSection} lang={lang} experienceItems={experience} performanceItems={performances} />;
      case Section.ABOUT:
        return <About lang={lang} aboutData={aboutData} />;
      case Section.EXPERIENCE:
        return <Experience items={experience} lang={lang} />;
      case Section.RESEARCH:
        return <Research items={research} lang={lang} />;
      case Section.PERFORMANCES:
        return <Performances items={performances} lang={lang} />;
      case Section.BLOG:
        return <Blog posts={posts} lang={lang} />;
      case Section.GALLERY:
        return <Gallery items={gallery} lang={lang} />;
      case Section.PRESS:
        return <Press lang={lang} items={press} />;
      // case Section.RESOURCES:
      //   return <Resources resources={resources} lang={lang} />;
      case Section.CONTACT:
        return <Contact lang={lang} />;
      case Section.ADMIN:
        return (
          <Admin
            isAuthenticated={isAuthenticated}
            onLogin={setIsAuthenticated}
            userEmail={user?.email}
            lang={lang}
            posts={rawPosts} setPosts={setRawPosts}
            resources={rawResources} setResources={setRawResources}
            experience={rawExperience} setExperience={setRawExperience}
            research={rawResearch} setResearch={setRawResearch}
            performances={rawPerformances} setPerformances={setRawPerformances}
            gallery={rawGallery} setGallery={setRawGallery}
            press={rawPress} setPress={setRawPress}
            messages={rawMessages} setMessages={setRawMessages}
            aboutData={rawAbout.length > 0 ? rawAbout[0] : null}
          />
        );
      default:
        return <Home onNavigate={setCurrentSection} lang={lang} />;
    }
  };

  return (
    <div className="min-h-screen bg-maestro-dark text-maestro-light selection:bg-maestro-gold selection:text-maestro-dark font-sans flex flex-col">

      {currentSection !== Section.ADMIN && (
        <Navigation
          currentSection={currentSection}
          onNavigate={setCurrentSection}
          lang={lang}
          setLang={setLang}
        />
      )}

      {currentSection === Section.ADMIN && (
        <nav className="fixed top-0 left-0 w-full z-50 bg-maestro-dark/90 backdrop-blur-xl border-b border-white/5 py-4 px-6 flex justify-between items-center">
          <div
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => setCurrentSection(Section.HOME)}
          >
            <div className="w-11 h-11 flex items-center justify-center bg-white/10 border border-white/20 rounded-full p-0 shadow-sm overflow-hidden">
              <img
                src="/images/logo-portada.png"
                alt="Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(212,175,55,0.4)] scale-125"
              />
            </div>
            <span className="text-xl font-serif font-bold tracking-wide text-maestro-light">
              DIEGO <span className="text-maestro-gold">CARRIÓN G.</span>
            </span>
          </div>
          <button onClick={() => setCurrentSection(Section.HOME)} className="text-xs uppercase tracking-widest text-maestro-light hover:text-maestro-gold transition-colors">
            {translations['es'].nav.back}
          </button>
        </nav>
      )}

      <main className="w-full flex-grow">
        {renderSection()}
      </main>

      {/* 5. FOOTER SECTION */}
      {currentSection !== Section.ADMIN && (
        <footer id="main-footer" className="relative py-48 bg-black overflow-hidden border-t border-white/5">
          {/* Background Image with Cinematic Overlays */}
          <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20 grayscale mix-blend-soft-light transition-transform duration-[20000ms] hover:scale-110"
              style={{ backgroundImage: "url('/images/section-footer.webp')" }}
            />
            {/* Gradient Mask for a "Final Fade" */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black/80" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            {/* Elegant Divider */}
            <div className="mb-8 flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-maestro-gold/40" />
              <span className="text-maestro-gold text-2xl tracking-[0.4em] uppercase font-serif italic">Diego Carrión Granda</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-maestro-gold/40" />
            </div>

            {/* Social Media Links */}
            <div className="flex justify-center flex-wrap gap-8 mb-12">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-maestro-gold/50 hover:text-maestro-gold hover:scale-125 transition-all duration-300" aria-label="Instagram">
                <Instagram size={24} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-maestro-gold/50 hover:text-maestro-gold hover:scale-125 transition-all duration-300" aria-label="LinkedIn">
                <Linkedin size={24} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-maestro-gold/50 hover:text-maestro-gold hover:scale-125 transition-all duration-300" aria-label="YouTube">
                <Youtube size={24} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-maestro-gold/50 hover:text-maestro-gold hover:scale-125 transition-all duration-300" aria-label="Facebook">
                <Facebook size={24} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-maestro-gold/50 hover:text-maestro-gold hover:scale-125 transition-all duration-300" aria-label="Telegram">
                <Send size={24} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-maestro-gold/50 hover:text-maestro-gold hover:scale-125 transition-all duration-300" aria-label="IMO">
                <MessageCircle size={24} />
              </a>
            </div>

            {/* Copyright & Info */}
            <div className="space-y-3">
              <p className="text-maestro-light/50 text-[11px] uppercase tracking-[0.4em] font-light">
                © {new Date().getFullYear()} — <span className="text-maestro-gold/80 italic font-serif">Director & Musicólogo</span>
              </p>
              <p className="text-maestro-light/30 text-[9px] uppercase tracking-[0.3em] font-serif">
                {lang === 'es' ? 'Todos los derechos reservados' : 'All rights reserved'}
              </p>
            </div>

            {/* Developer Identity Icon & Credit */}
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="text-maestro-gold/80 filter drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
                <Terminal size={14} />
              </div>

              <p className="text-[8px] uppercase tracking-[0.4em] text-maestro-light/40 font-sans">
                Diseño y Desarrollo por <span className="text-maestro-light/70">Willan Caraguay</span> <span className="mx-2 text-maestro-gold/40">•</span> <span className="text-maestro-gold/70 italic">Willy Tech</span>
              </p>
            </div>
          </div>
        </footer>
      )}

      {/* Floating Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 z-50 p-3 rounded-full bg-maestro-gold text-maestro-dark shadow-lg transition-all duration-300 transform ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'} hover:bg-white hover:scale-110`}
        aria-label="Scroll to top"
      >
        <ArrowUp size={24} />
      </button>
    </div>
  );
}

export default App;
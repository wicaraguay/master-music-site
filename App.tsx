import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
import { Admin } from './components/Admin';
import { translations, getInitialExperience, getInitialPerformances, getInitialPosts, getInitialResearch, getInitialResources, getInitialGallery } from './translations';
import { Section, BlogPost, Resource, ExperienceItem, ResearchPaper, Performance, GalleryItem, Language, ContactMessage, PressItem } from './types';

import { subscribeToCollection, transformDataForLang } from './src/services/db';
import { subscribeToAuthChanges } from './src/services/auth';
import type { User } from 'firebase/auth';
import { Terminal, Globe, ArrowUp, Instagram, Youtube, Facebook } from 'lucide-react';

// Custom SVG icons for footer
const FooterVkIcon = () => <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.9 2H11C4.3 2 2 4.3 2 11V13C2 19.7 4.3 22 11 22H13C19.7 22 22 19.7 22 13V11C22 4.3 19.7 2 13 2H12.9Z" /><path d="M16 8C16 8 15.5 8 15.2 8.3C14.9 8.6 14.8 9 14.8 9V10.2C14.8 10.2 14.8 10.5 15 10.7C15.2 10.9 15.5 11 15.5 11L16.2 11C16.8 11 17 11.2 17 11.8V12.2C17 12.8 16.8 13 16.2 13H15.5C14.5 13 13.5 12.5 13 11.5L12 9.5C11.5 8.5 10.5 8 9.5 8H8V16H9.5V13.5C9.5 13.5 9.7 13 10 13C10.3 13 10.5 13.5 10.5 13.5L11.5 15.5C12 16.5 13 17 14 17H16.2C17.5 17 18.5 16 18.5 14.7V10.3C18.5 9 17.5 8 16.2 8H16Z" /></svg>;
const FooterWhatsAppIcon = () => <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.605 6.039L0 24l6.117-1.605a11.803 11.803 0 005.925 1.597h.005c6.635 0 12.032-5.396 12.035-12.031a11.774 11.774 0 00-3.517-8.293" /></svg>;
const FooterTelegramIcon = () => <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>;
const FooterMaxIcon = () => <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>;
const FooterRutubeIcon = () => <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.996C6.478 21.996 2 17.518 2 11.998C2 6.477 6.478 2 12.002 2C17.522 2 22 6.477 22 11.998C22 17.518 17.522 21.996 12.002 21.996ZM12.002 4.1C7.643 4.1 4.103 7.639 4.103 11.998C4.103 16.356 7.643 19.896 12.002 19.896C16.36 19.896 19.9 16.356 19.9 11.998C19.9 7.639 16.36 4.1 12.002 4.1ZM13.842 12.723H10.5V14.887H8.816V8.92H13.842C14.888 8.92 15.738 9.77 15.738 10.816C15.738 11.861 14.888 12.711 13.842 12.711V12.723ZM10.5 10.511V11.132H13.842C14.014 11.132 14.152 10.993 14.152 10.822C14.152 10.65 14.014 10.511 13.842 10.511H10.5Z" /></svg>;
const FooterSoundCloudIcon = () => <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19c.5 0 1-.1 1.5-.3.5-.2 1-.5 1.4-.9.4-.4.7-.8.9-1.4.2-.5.3-1 .3-1.5 0-1.1-.4-2.1-1.2-2.8-.8-.8-1.8-1.2-2.9-1.2H17v-.1c0-1.2-.4-2.2-1.2-3-.8-.8-1.8-1.2-3-1.2-1.1 0-2.1.4-2.9 1.1-.8.8-1.2 1.8-1.2 2.9V11h-.1c-.9 0-1.7.3-2.3.9-.6.6-.9 1.4-.9 2.3 0 .9.3 1.7.9 2.3.6.6 1.4.9 2.3.9h11z" /><path d="M9 19v-5" /><path d="M6 18v-3" /><path d="M12 19v-8" /></svg>;

import './src/styles/rich-text-editor.css';

// Map Section enum values to URL paths
const sectionToPath: Record<Section, string> = {
  [Section.HOME]: '/',
  [Section.ABOUT]: '/about',
  [Section.EXPERIENCE]: '/experience',
  [Section.RESEARCH]: '/research',
  [Section.PERFORMANCES]: '/performances',
  [Section.GALLERY]: '/gallery',
  [Section.PRESS]: '/press',
  [Section.BLOG]: '/blog',
  [Section.CONTACT]: '/contact',
  [Section.ADMIN]: '/admin',
  [Section.RESOURCES]: '/resources',
};

// Map URL paths to Section enum values
const pathToSection = (pathname: string): Section => {
  const base = pathname.split('/')[1];
  const map: Record<string, Section> = {
    '': Section.HOME,
    'about': Section.ABOUT,
    'experience': Section.EXPERIENCE,
    'research': Section.RESEARCH,
    'performances': Section.PERFORMANCES,
    'gallery': Section.GALLERY,
    'press': Section.PRESS,
    'blog': Section.BLOG,
    'contact': Section.CONTACT,
    'admin': Section.ADMIN,
    'resources': Section.RESOURCES,
  };
  return map[base] ?? Section.HOME;
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [lang, setLang] = useState<Language>('es');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Derive currentSection from URL for Navigation active state
  const currentSection = pathToSection(location.pathname);

  // Navigate via Section enum (used by Navigation component)
  const handleNavigate = (section: Section) => {
    navigate(sectionToPath[section]);
  };

  // Scroll to top logic
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
    setMessages(rawMessages);

    if (rawAbout.length > 0) {
      const transformedAbout = transformDataForLang(rawAbout, lang)[0];
      if (transformedAbout && transformedAbout.sections) {
        transformedAbout.sections = transformedAbout.sections.map((section: any) => {
          if (section.type === 'text' && section.content) {
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

  const isAdmin = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-maestro-dark text-maestro-light selection:bg-maestro-gold selection:text-maestro-dark font-sans flex flex-col">

      {!isAdmin && (
        <Navigation
          currentSection={currentSection}
          onNavigate={handleNavigate}
          lang={lang}
          setLang={setLang}
        />
      )}

      {isAdmin && (
        <nav className="fixed top-0 left-0 w-full z-50 bg-maestro-dark/90 backdrop-blur-xl border-b border-white/5 py-4 px-6 flex justify-between items-center">
          <div
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => navigate('/')}
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
          <button onClick={() => navigate('/')} className="text-xs uppercase tracking-widest text-maestro-light hover:text-maestro-gold transition-colors">
            {translations['es'].nav.back}
          </button>
        </nav>
      )}

      <main className="w-full flex-grow">
        <Routes>
          <Route path="/" element={<Home onNavigate={handleNavigate} lang={lang} experienceItems={experience} performanceItems={performances} />} />
          <Route path="/about" element={<About lang={lang} aboutData={aboutData} />} />
          <Route path="/experience" element={<Experience items={experience} lang={lang} />} />
          <Route path="/research" element={<Research items={research} lang={lang} />} />
          <Route path="/performances" element={<Performances items={performances} lang={lang} />} />
          <Route path="/gallery" element={<Gallery items={gallery} lang={lang} />} />
          <Route path="/press" element={<Press lang={lang} items={press} />} />
          <Route path="/press/:id" element={<Press lang={lang} items={press} />} />
          <Route path="/blog" element={<Blog posts={posts} lang={lang} />} />
          <Route path="/blog/:id" element={<Blog posts={posts} lang={lang} />} />
          <Route path="/contact" element={<Contact lang={lang} />} />
          <Route path="/admin" element={
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
          } />
          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* FOOTER SECTION */}
      {!isAdmin && (
        <footer id="main-footer" className="relative py-48 bg-black overflow-hidden border-t border-white/5">
          {/* Background Image with Cinematic Overlays */}
          <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20 grayscale mix-blend-soft-light transition-transform duration-[20000ms] hover:scale-110"
              style={{ backgroundImage: "url('/images/section-footer.webp')" }}
            />
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
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-maestro-gold/50 hover:text-maestro-gold hover:scale-125 transition-all duration-300" aria-label="Facebook">
                <Facebook size={24} />
              </a>
              <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className="text-maestro-gold/50 hover:text-maestro-gold hover:scale-125 transition-all duration-300" aria-label="VK">
                <FooterVkIcon />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-maestro-gold/50 hover:text-maestro-gold hover:scale-125 transition-all duration-300" aria-label="Instagram">
                <Instagram size={24} />
              </a>
              <a href="https://wa.me/79179013345" target="_blank" rel="noopener noreferrer" className="text-maestro-gold/50 hover:text-maestro-gold hover:scale-125 transition-all duration-300" aria-label="WhatsApp">
                <FooterWhatsAppIcon />
              </a>
              <a href="https://t.me/+79179013345" target="_blank" rel="noopener noreferrer" className="text-maestro-gold/50 hover:text-maestro-gold hover:scale-125 transition-all duration-300" aria-label="Telegram">
                <FooterTelegramIcon />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-maestro-gold/50 hover:text-maestro-gold hover:scale-125 transition-all duration-300" aria-label="Max">
                <FooterMaxIcon />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-maestro-gold/50 hover:text-maestro-gold hover:scale-125 transition-all duration-300" aria-label="YouTube">
                <Youtube size={24} />
              </a>
              <a href="https://rutube.ru" target="_blank" rel="noopener noreferrer" className="text-maestro-gold/50 hover:text-maestro-gold hover:scale-125 transition-all duration-300" aria-label="Rutube">
                <FooterRutubeIcon />
              </a>
              <a href="https://soundcloud.com/yoiorchestra?utm_source=mobi&utm_campaign=social_sharing" target="_blank" rel="noopener noreferrer" className="text-maestro-gold/50 hover:text-maestro-gold hover:scale-125 transition-all duration-300" aria-label="SoundCloud">
                <FooterSoundCloudIcon />
              </a>
            </div>

            {/* Copyright & Info */}
            <div className="space-y-3">
              <p className="text-maestro-light/50 text-[11px] uppercase tracking-[0.4em] font-light">
                © {new Date().getFullYear()} — <span className="text-maestro-gold/80 italic font-serif">{(translations[lang] as any).footerRole}</span>
              </p>
              <p className="text-maestro-light/30 text-[9px] uppercase tracking-[0.3em] font-serif">
                {(translations[lang] as any).copyright}
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

function App() {
  return <AppContent />;
}

export default App;
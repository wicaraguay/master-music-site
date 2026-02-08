import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Home } from './components/Home';
import { About } from './components/About';
import { Experience } from './components/Experience';
import { Research } from './components/Research';
import { Performances } from './components/Performances';
import { Gallery } from './components/Gallery';
import { Blog } from './components/Blog';
import { Contact } from './components/Contact';
import { Resources } from './components/Resources';

import { Admin } from './components/Admin';
import { translations, getInitialExperience, getInitialPerformances, getInitialPosts, getInitialResearch, getInitialResources, getInitialGallery } from './translations';
import { Section, BlogPost, Resource, ExperienceItem, ResearchPaper, Performance, GalleryItem, Language } from './types';
// Note: importing Section from translations might be wrong if it's in types.ts.
// Step 144 showed: import { Section, ... } from './types';
// I need to be careful with imports.

import { subscribeToCollection, transformDataForLang } from './src/services/db';
import { subscribeToAuthChanges } from './src/services/auth';
import type { User } from 'firebase/auth';
import { Lock } from 'lucide-react';

function App() {
  const [currentSection, setCurrentSection] = useState<Section>(Section.HOME);
  const [lang, setLang] = useState<Language>('es');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Raw data from Firestore (contains all languages)
  const [rawPosts, setRawPosts] = useState<any[]>([]);
  const [rawResources, setRawResources] = useState<any[]>([]);
  const [rawExperience, setRawExperience] = useState<any[]>([]);
  const [rawResearch, setRawResearch] = useState<any[]>([]);
  const [rawPerformances, setRawPerformances] = useState<any[]>([]);
  const [rawGallery, setRawGallery] = useState<any[]>([]);

  // Transformed data for display (current language)
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [research, setResearch] = useState<ResearchPaper[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

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
      subscribeToCollection('gallery', setRawGallery)
    ];

    return () => unsubs.forEach(unsub => unsub());
  }, []);

  // Transform data when language or raw data changes
  useEffect(() => {
    setPosts(transformDataForLang(rawPosts, lang));
    setResources(transformDataForLang(rawResources, lang));
    setExperience(transformDataForLang(rawExperience, lang));
    setResearch(transformDataForLang(rawResearch, lang));
    setPerformances(transformDataForLang(rawPerformances, lang));
    setGallery(transformDataForLang(rawGallery, lang));
  }, [lang, rawPosts, rawResources, rawExperience, rawResearch, rawPerformances, rawGallery]);

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentSection]);

  const renderSection = () => {
    switch (currentSection) {
      case Section.HOME:
        return <Home onNavigate={setCurrentSection} lang={lang} />;
      case Section.ABOUT:
        return <About lang={lang} />;
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
      case Section.RESOURCES:
        return <Resources resources={resources} lang={lang} />;
      case Section.CONTACT:
        return <Contact lang={lang} />;
      case Section.ADMIN:
        return (
          <Admin
            isAuthenticated={isAuthenticated}
            onLogin={setIsAuthenticated}
            userEmail={user?.email}
            lang={lang}
            posts={posts} setPosts={setPosts}
            resources={resources} setResources={setResources}
            experience={experience} setExperience={setExperience}
            research={research} setResearch={setResearch}
            performances={performances} setPerformances={setPerformances}
            gallery={gallery} setGallery={setGallery}
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
            <div className="w-10 h-10 rounded-full border border-maestro-gold flex items-center justify-center bg-maestro-gold/10">
              <span className="font-serif font-bold text-maestro-gold text-lg">DC</span>
            </div>
            <span className="text-xl font-serif font-bold tracking-wide text-maestro-light">
              DIEGO <span className="text-maestro-gold">CARRIÓN</span>
            </span>
          </div>
          <button onClick={() => setCurrentSection(Section.HOME)} className="text-xs uppercase tracking-widest text-maestro-light hover:text-maestro-gold transition-colors">
            {translations[lang].nav.back}
          </button>
        </nav>
      )}

      <main className="w-full flex-grow">
        {renderSection()}
      </main>

      {currentSection !== Section.ADMIN && (
        <footer className="py-12 bg-black text-center border-t border-white/5 relative z-10">
          <div className="mb-4 flex items-center justify-center gap-2 opacity-50">
            <div className="h-px w-8 bg-maestro-gold"></div>
            <span className="text-maestro-gold text-xs tracking-widest uppercase">Diego Carrión</span>
            <div className="h-px w-8 bg-maestro-gold"></div>
          </div>
          <p className="text-maestro-light/30 text-[10px] uppercase tracking-widest mb-6">
            © {new Date().getFullYear()} {lang === 'es' ? 'Todos los derechos reservados' : lang === 'ru' ? 'Все права защищены' : 'All rights reserved'}.
          </p>

          <button
            onClick={() => setCurrentSection(Section.ADMIN)}
            className="text-maestro-light/10 hover:text-maestro-gold transition-colors pb-4"
            title={translations[lang].nav.admin}
          >
            <Lock size={12} />
          </button>
        </footer>
      )}
    </div>
  );
}

export default App;
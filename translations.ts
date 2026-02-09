import { ExperienceItem, ResearchPaper, Performance, BlogPost, Resource, GalleryItem } from './types';

/**
 * FUENTE DE VERDAD ÚNICA (ESPAÑOL) 🌍🚀
 * Este archivo ahora solo contiene las etiquetas en Español.
 * El motor de traducción dinámico (Google Translate) se encarga de
 * traducir estas etiquetas y el contenido de la base de datos en tiempo real.
 */
export const translations = {
  es: {
    nav: {
      home: 'Inicio',
      about: 'Sobre Mí',
      career: 'Trayectoria',
      experience: 'Experiencia',
      research: 'Investigación',
      performances: 'Eventos',
      gallery: 'Galería',
      resources: 'Recursos',
      blog: 'Blog',
      contact: 'Contacto',
      admin: 'Ingresar',
      back: 'Volver al Sitio'
    },
    home: {
      role: 'Violinista | Director de Orquesta | Investigador',
      intro: '"Candidato a PhD en Musicología, explorando la intersección entre la música barroca y las técnicas de dirección contemporáneas."',
      ctaWork: 'Conoce mi trabajo',
      ctaContact: 'Contacto',
      aboutTitle: 'Sobre Mí',
      aboutHeading: 'Donde la tradición se encuentra con la innovación.',
      aboutText1: 'Mi carrera se define por una dualidad: el rigor del archivo y la vitalidad del escenario. Como director, no solo busco la precisión técnica, sino la autenticidad histórica informada.',
      aboutText2: 'Mi investigación doctoral profundiza en las partituras olvidadas, trayendo a la luz obras maestras que merecen ser escuchadas nuevamente, interpretadas con una sensibilidad moderna.',
      readBio: 'Leer Biografía Completa',
      focusTitle: 'Panorama Profesional',
      focusHeading: 'Trayectoria',
      expTitle: 'Experiencia',
      expDesc: 'Un recorrido profesional desde la docencia en conservatorios hasta la dirección titular.',
      resTitle: 'Investigación',
      resDesc: 'PhD en curso. Recuperación de patrimonio musical y nuevas perspectivas sobre la orquestación.',
      perfTitle: 'Eventos',
      perfDesc: 'La culminación del trabajo en el escenario. Próximos conciertos y repertorio sinfónico.',
      viewTimeline: 'Ver Cronología',
      readPapers: 'Leer Publicaciones',
      viewAgenda: 'Ver Agenda',
      quote: '"La música no está en las notas, sino en el silencio entre ellas."',
      collabTitle: '¿Interesado en una colaboración?',
      collabText: 'Estoy disponible para conciertos invitados, conferencias académicas y consultoría musicológica.',
      letsTalk: 'Hablemos'
    },
    about: {
      bioTitle: 'Biografía',
      bioHeading: 'Pasión por la Excelencia Académica y Artística',
      p1: 'Actualmente cursando un Doctorado (PhD) en Musicología, mi trabajo se centra en revivir obras olvidadas del siglo XIX y reinterpretarlas con una sensibilidad moderna.',
      p2: 'Mi viaje comenzó en el conservatorio a la edad de 6 años, evolucionando desde el piano solista hasta el podio de director. Creo firmemente que el director no es solo un metrónomo humano, sino un canalizador de la energía colectiva de la orquesta y un narrador de historias sin palabras.',
      p3: 'Cuando no estoy investigando en los archivos o ensayando, me dedico a la docencia, buscando inspirar a la próxima generación de músicos a encontrar su propia voz en un mundo ruidoso.',
      statsYears: 'Años de Estudio',
      statsConcerts: 'Conciertos Dirigidos'
    },
    experience: {
      title: 'Experiencia',
      subtitle: 'Experiencia Profesional',
      items: [
        {
          id: '1',
          year: '2023 - Presente',
          role: 'Director Principal Invitado',
          institution: 'Orquesta Filarmónica Nacional',
          description: 'Dirección de temporadas regulares y conciertos especiales, con un enfoque en repertorio barroco y contemporáneo.',
        },
        {
          id: '2',
          year: '2021 - 2023',
          role: 'Primera Violín',
          institution: 'Ensemble Barroco Europeo',
          description: 'Interpretación de música de cámara barroca con instrumentos de época.',
        }
      ],
      viewDetails: 'Ver Experiencia',
      viewAll: 'Ver toda la trayectoria'
    },
    research: {
      badge: 'Academia',
      title: 'Investigación',
      quote: '"La investigación es la brújula que guía la interpretación."',
      read: 'Leer Publicación'
    },
    performances: {
      titlePrefix: 'Agenda de',
      titleSuffix: 'Eventos',
      moreDetails: '* Más detalles próximamente',
      imgCredit: 'Imagen del recinto:'
    },
    blog: {
      badge: 'Pensamiento Musical',
      titlePrefix: 'Bitácora del',
      titleSuffix: 'Director',
      subtitle: 'Reflexiones sobre interpretación, musicología y la vida en el podio.',
      empty: 'No hay publicaciones disponibles por el momento.',
      galleryCount: 'Imágenes en galería',
      readMore: 'Leer Artículo Completo',
      galleryTitle: 'Galería Visual'
    },
    resources: {
      badge: 'Biblioteca Digital',
      titlePrefix: 'Recursos &',
      titleSuffix: 'Partituras',
      subtitle: 'Acceda a ediciones críticas, investigaciones publicadas y material pedagógico exclusivo.',
      empty: 'La biblioteca se está actualizando.',
      download: 'Descargar'
    },
    gallery: {
      badge: 'Archivo Visual',
      titlePrefix: 'Momentos en el',
      titleSuffix: 'Podio',
      subtitle: 'Una colección de instantes capturados en ensayos, conciertos y viajes de investigación.',
      tabPhotos: 'Fotos',
      tabVideos: 'Videos'
    },
    contact: {
      title: 'Contacto',
      subtitle: 'Para contrataciones, colaboraciones académicas o consultas generales.',
      name: 'Nombre',
      email: 'Email',
      message: 'Mensaje',
      send: 'Enviar Mensaje',
      follow: 'Sígueme en redes'
    },
    admin: {
      title: 'Panel de Administración',
      login: 'Iniciar Sesión',
      logout: 'Cerrar Sesión',
      save: 'Guardar',
      edit: 'Editar',
      delete: 'Eliminar',
      cancel: 'Cancelar'
    }
  }
} as const;

// Types for better developer experience
export type TranslationKeys = typeof translations;

// Helper functions for initial data (Always in Spanish)
export const getInitialExperience = (): ExperienceItem[] => translations.es.experience.items as unknown as ExperienceItem[];
export const getInitialPerformances = (): Performance[] => [];
export const getInitialPosts = (): BlogPost[] => [];
export const getInitialResearch = (): ResearchPaper[] => [];
export const getInitialResources = (): Resource[] => [];
export const getInitialGallery = (): GalleryItem[] => [];
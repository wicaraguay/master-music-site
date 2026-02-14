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
      intro: '"Director de Ópera y Orquesta Sinfónica."',
      conductorTag: 'Director',
      ctaWork: 'Conoce mi trabajo',
      ctaContact: 'Contacto',
      aboutTitle: 'Sobre Mí',
      aboutHeading: 'No soy perfecto, pero sí perfectible.',
      aboutText1: 'Mi carrera se define por una dualidad: cuando dirijo una ópera o un concierto sinfónico, cada ensayo es una pequeña conversación. Una obra de Bach, Haydn, Bethoveen, Liszt, Salgado la hemos escuchado mil veces, pero cada orquesta es distinta, cada función tiene su propia energía.',
      aboutText2: 'Mi investigación doctoral profundiza en las partituras olvidadas, trayendo a la luz obras maestras que merecen ser escuchadas nuevamente, interpretadas con una sensibilidad moderna.',
      readBio: 'Leer Biografía Completa',
      focusTitle: 'Panorama Profesional',
      focusHeading: 'Trayectoria',
      expTitle: 'Experiencia',
      expDesc: 'Un recorrido profesional desde la docencia en conservatorios hasta la dirección titular.',
      resTitle: 'Investigación',
      resDesc: 'PhD en curso. Recuperación de patrimonio musical y nuevas perspectivas sobre la orquestación.',
      perfTitle: 'Eventos',
      perfHeading1: 'La Magia en',
      perfHeading2: 'el Escenario',
      perfDesc: 'Próximos conciertos y repertorio sinfónico.',
      viewTimeline: 'Ver Cronología',
      readPapers: 'Leer Publicaciones',
      viewAgenda: 'Ver Agenda',
      quote: '"En una ópera, la poesía por fuerza ha de ser hija obediente de la música."',
      collabTitle: '¿Interesado en una colaboración?',
      collabText: 'Estoy disponible para una invitación para dirigir conciertos, conferencias, masterclass, consultoría.',
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
      tabVideos: 'Videos',
      tabAudio: 'Audio',
      emptyPhotos: 'No hay fotos disponibles.',
      emptyVideos: 'No hay videos disponibles.',
      emptyAudio: 'No hay grabaciones de audio disponibles.'
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
    },
    calendar: {
      months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      viewDetails: 'Ver Detalles'
    }
  },
  en: {
    nav: {
      home: 'Home',
      about: 'About Me',
      career: 'Career',
      experience: 'Experience',
      research: 'Research',
      performances: 'Agenda',
      gallery: 'Gallery',
      resources: 'Resources',
      blog: 'Blog',
      contact: 'Contact',
      admin: 'Login',
      back: 'Back to Site'
    },
    home: {
      role: 'Violinist | Conductor | Researcher',
      intro: '"Opera and Symphony Orchestra Conductor."',
      conductorTag: 'Conductor',
      ctaWork: 'See My Work',
      ctaContact: 'Contact',
      aboutTitle: 'About Me',
      aboutHeading: 'I am not perfect, but I am perfectible.',
      aboutText1: 'My career is defined by a duality: when I conduct an opera or a symphonic concert, every rehearsal is a small conversation. We have heard a work by Bach, Haydn, Beethoven, Liszt, or Salgado a thousand times, but every orchestra is different, and every performance has its own energy.',
      aboutText2: 'My doctoral research delves into forgotten scores, bringing to light masterpieces that deserve to be heard again, performed with modern sensitivity.',
      readBio: 'Read Full Biography',
      focusTitle: 'Professional Outlook',
      focusHeading: 'Career Path',
      expTitle: 'Experience',
      expDesc: 'A professional journey from conservatory teaching to principal conducting.',
      resTitle: 'Research',
      resDesc: 'PhD in progress. Recovering musical heritage and new perspectives on orchestration.',
      perfTitle: 'Events',
      perfHeading1: 'The Magic on',
      perfHeading2: 'Stage',
      perfDesc: 'Upcoming concerts and symphonic repertoire.',
      viewTimeline: 'View Timeline',
      readPapers: 'Read Publications',
      viewAgenda: 'View Agenda',
      quote: '"In an opera, it is absolutely imperative that poetry be the obedient daughter of music."',
      collabTitle: 'Interested in a collaboration?',
      collabText: 'I am available for guest conducting, lectures, masterclasses, and consultancy.',
      letsTalk: 'Let\'s Talk'
    },
    about: {
      bioTitle: 'Biography',
      bioHeading: 'Passion for Academic and Artistic Excellence',
      p1: 'Currently pursuing a PhD in Musicology, my work focuses on reviving forgotten 19th-century works and reinterpreting them with modern sensitivity.',
      p2: 'My journey began at the conservatory at age 6, evolving from solo piano to the conductor\'s podium. I firmly believe a conductor is not just a human metronome, but a channeler of collective orchestral energy and a wordless storyteller.',
      p3: 'When not researching archives or rehearsing, I dedicate myself to teaching, seeking to inspire the next generation of musicians to find their own voice in a noisy world.',
      statsYears: 'Years of Study',
      statsConcerts: 'Concerts Conducted'
    },
    experience: {
      title: 'Experience',
      subtitle: 'Professional experience',
      items: [],
      viewDetails: 'View Experience',
      viewAll: 'View Full Timeline'
    },
    research: {
      badge: 'Academia',
      title: 'Research',
      quote: '"Research is the compass that guides interpretation."',
      read: 'Read Publication'
    },
    performances: {
      titlePrefix: 'Agenda of',
      titleSuffix: 'Events',
      moreDetails: '* More details coming soon',
      imgCredit: 'Venue image:'
    },
    blog: {
      badge: 'Musical Thought',
      titlePrefix: 'The Conductor\'s',
      titleSuffix: 'Journal',
      subtitle: 'Reflections on interpretation, musicology, and life on the podium.',
      empty: 'No posts available at the moment.',
      galleryCount: 'Images in gallery',
      readMore: 'Read Full Article',
      galleryTitle: 'Visual Gallery'
    },
    resources: {
      badge: 'Digital Library',
      titlePrefix: 'Resources &',
      titleSuffix: 'Scores',
      subtitle: 'Access critical editions, published research, and exclusive pedagogical material.',
      empty: 'The library is being updated.',
      download: 'Download'
    },
    gallery: {
      badge: 'Visual Archive',
      titlePrefix: 'Moments at the',
      titleSuffix: 'Podium',
      subtitle: 'A collection of moments captured in rehearsals, concerts, and research trips.',
      tabPhotos: 'Photos',
      tabVideos: 'Videos',
      tabAudio: 'Audio',
      emptyPhotos: 'No photos available.',
      emptyVideos: 'No videos available.',
      emptyAudio: 'No audio recordings available.'
    },
    contact: {
      title: 'Contact',
      subtitle: 'For bookings, academic collaborations, or general inquiries.',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send Message',
      follow: 'Follow me'
    },
    admin: {
      title: 'Admin Panel',
      login: 'Login',
      logout: 'Logout',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel'
    },
    calendar: {
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      viewDetails: 'View Details'
    }
  },
  ru: {
    nav: {
      home: 'Главная',
      about: 'Обо мне',
      career: 'Карьера',
      experience: 'Опыт',
      research: 'Исследования',
      performances: 'События',
      gallery: 'Галерея',
      resources: 'Ресурсы',
      blog: 'Блог',
      contact: 'Контакты',
      admin: 'Войти',
      back: 'Вернуться на сайт'
    },
    home: {
      role: 'Скрипач | Дирижер | Исследователь',
      intro: '"Оперный и симфонический дирижер."',
      conductorTag: 'Дирижер',
      ctaWork: 'Мои работы',
      ctaContact: 'Контакты',
      aboutTitle: 'Обо мне',
      aboutHeading: 'Я не совершенен, но я совершенствуем.',
      aboutText1: 'Моя карьера определяется двойственностью: когда я дирижирую оперой или симфоническим концертом, каждая репетиция — это небольшой разговор. Мы тысячу раз слышали произведения Баха, Гайдна, Бетховена, Листа, Сальгадо, но каждый оркестр индивидуален, у каждого выступления своя энергия.',
      aboutText2: 'Мое докторское исследование посвящено забытым партитурам, возвращая к жизни шедевры, которые заслуживают того, чтобы быть услышанными снова, исполненные с современной чуткостью.',
      readBio: 'Читать полную биографию',
      focusTitle: 'Профессиональный обзор',
      focusHeading: 'Путь в карьере',
      expTitle: 'Опыт',
      expDesc: 'Профессиональный путь от преподавания в консерватории до главного дирижера.',
      resTitle: 'Исследования',
      resDesc: 'Докторантура в процессе. Восстановление музыкального наследия и новые перспективы оркестровки.',
      perfTitle: 'События',
      perfHeading1: 'Магия на',
      perfHeading2: 'сцене',
      perfDesc: 'Предстоящие концерты и симфонический репертуар.',
      viewTimeline: 'Смотреть хронологию',
      readPapers: 'Читать публикации',
      viewAgenda: 'Смотреть афишу',
      quote: '"В опере поэзия непременно должна быть послушной дочерью музыки."',
      collabTitle: 'Заинтересованы в сотрудничестве?',
      collabText: 'Я доступен для предложений по дирижированию, лекций, мастер-классов и консультаций.',
      letsTalk: 'Связаться'
    },
    about: {
      bioTitle: 'Биография',
      bioHeading: 'Страсть к академическому и художественному совершенству',
      p1: 'В настоящее время я работаю над докторской диссертацией по музыковедению, возрождая забытые произведения XIX века и переосмысливая их с позиции современной чувствительности.',
      p2: 'Мой путь начался в консерватории в возрасте 6 лет, пройдя путь от сольного фортепиано до дирижерского подиума. Я твердо верю, что дирижер — это не просто человеческий метроном, а проводник коллективной энергии оркестра и рассказчик историй без слов.',
      p3: 'Когда я не занимаюсь исследованиями в архивах или репетициями, я посвящаю себя преподаванию, стремясь вдохновить новое поколение музыкантов найти свой собственный голос в шумном мире.',
      statsYears: 'Лет обучения',
      statsConcerts: 'Дирижируемых концертов'
    },
    experience: {
      title: 'Опыт',
      subtitle: 'Профессиональный опыт',
      items: [],
      viewDetails: 'Подробнее',
      viewAll: 'Посмотреть весь путь'
    },
    research: {
      badge: 'Академия',
      title: 'Исследования',
      quote: '"Исследование — это компас, который направляет интерпретацию."',
      read: 'Читать публикацию'
    },
    performances: {
      titlePrefix: 'Афиша',
      titleSuffix: 'событий',
      moreDetails: '* Подробности скоро',
      imgCredit: 'Изображение площадки:'
    },
    blog: {
      badge: 'Музыкальная мысль',
      titlePrefix: 'Дневник',
      titleSuffix: 'дирижера',
      subtitle: 'Размышления об интерпретации, музыковедении и жизни на подиуме.',
      empty: 'На данный момент публикаций нет.',
      galleryCount: 'Изображений в галерее',
      readMore: 'Читать статью полностью',
      galleryTitle: 'Визуальная галерея'
    },
    resources: {
      badge: 'Цифровая библиотека',
      titlePrefix: 'Ресурсы и',
      titleSuffix: 'партитуры',
      subtitle: 'Доступ к критическим изданиям, опубликованным исследованиям и эксклюзивным педагогическим материалам.',
      empty: 'Библиотека обновляется.',
      download: 'Скачать'
    },
    gallery: {
      badge: 'Визуальный архив',
      titlePrefix: 'Моменты на',
      titleSuffix: 'подиуме',
      subtitle: 'Коллекция моментов, запечатленных на репетициях, концертах и в исследовательских поездках.',
      tabPhotos: 'Фото',
      tabVideos: 'Видео',
      tabAudio: 'Аудио',
      emptyPhotos: 'Нет доступных фотографий.',
      emptyVideos: 'Нет доступных видео.',
      emptyAudio: 'Нет доступных аудиозаписей.'
    },
    contact: {
      title: 'Контакты',
      subtitle: 'Для бронирования, академического сотрудничества или общих вопросов.',
      name: 'Имя',
      email: 'Email',
      message: 'Сообщение',
      send: 'Отправить сообщение',
      follow: 'Следите за мной'
    },
    admin: {
      title: 'Панель администратора',
      login: 'Войти',
      logout: 'Выйти',
      save: 'Сохранить',
      edit: 'Редактировать',
      delete: 'Удалить',
      cancel: 'Отмена'
    },
    calendar: {
      months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
      days: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      viewDetails: 'Подробнее'
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
export enum Section {
  HOME = 'inicio',
  ABOUT = 'acerca',
  EXPERIENCE = 'experiencia',
  RESEARCH = 'investigacion',
  PERFORMANCES = 'actuaciones',
  BLOG = 'blog',
  GALLERY = 'galeria',
  RESOURCES = 'recursos',
  CONTACT = 'contacto',
  ADMIN = 'admin',
}

export type Language = 'es' | 'en' | 'ru';

export interface ExperienceItem {
  id: string;
  year: string;
  role: string;
  institution: string;
  description: string;
}

export interface Performance {
  id: string;
  date: string;
  title: string;
  location: string;
  role: string;
  description: string;
  status: 'upcoming' | 'past';
  image?: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  journal: string;
  year: string;
  abstract: string;
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  preview: string;
  content: string;
  images?: string[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'score' | 'article' | 'audio';
  format: string;
  size: string;
  description: string;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  src: string; // Image URL or Video Embed URL
  thumbnail?: string; // Only for videos
  category: string;
  caption: string;
}
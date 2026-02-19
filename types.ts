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
  PRESS = 'prensa',
}

export type Language = 'es' | 'en' | 'ru';

export interface LocalizedString {
  es: string;
  en: string;
  ru: string;
}

export interface ExperienceItem {
  id: string;
  year: LocalizedString;
  dateISO?: string; // YYYY-MM-DD for calendar selection and sorting
  role: LocalizedString;
  institution: LocalizedString;
  description: LocalizedString;
  tags?: string[];
}

export interface Performance {
  id: string;
  date: LocalizedString;
  dateISO: string; // YYYY-MM-DD for automatic status calculation
  title: LocalizedString;
  location: LocalizedString;
  role: LocalizedString;
  description: LocalizedString;
  status: 'upcoming' | 'past';
  image?: string;
  images?: string[];
}

export interface ResearchPaper {
  id: string;
  title: LocalizedString;
  journal: string; // Journals usually don't translates their names
  year: string;
  abstract: LocalizedString;
}

export interface BlogPost {
  id: string;
  title: LocalizedString;
  date: string;
  preview: LocalizedString;
  content: LocalizedString;
  previewImage?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AboutSection {
  id: string;
  type: 'text' | 'image';
  content?: LocalizedString; // For text sections
  image?: string; // For image sections
  order: number;
}

export interface AboutData {
  id: string;
  profileImage: string;
  bioTitle: LocalizedString;
  bioHeading: LocalizedString;
  sections: AboutSection[];
  updatedAt?: string;
}

export interface Resource {
  id: string;
  title: LocalizedString;
  type: 'score' | 'article' | 'audio';
  format: string;
  size: string;
  description: LocalizedString;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  src: string;
  thumbnail?: string;
  category: LocalizedString;
  subCategory?: LocalizedString;
  author?: LocalizedString;
  caption: LocalizedString;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  read: boolean;
}

export interface PressItem {
  id: string;
  title: LocalizedString;
  source: string;
  date: string;
  dateISO?: string; // YYYY-MM-DD for calendar selection
  excerpt: LocalizedString;
  content: LocalizedString;
  url: string;
  image?: string;
  category: LocalizedString;
  createdAt?: string;
  updatedAt?: string;
}
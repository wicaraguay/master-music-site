import React, { useState } from 'react';
import { FadeIn } from './FadeIn';
import {
    Lock, LogOut, FileText, Music, UploadCloud, Trash2, PlusCircle,
    LayoutDashboard, Image as ImageIcon, X, Briefcase, BookOpen, Calendar, MapPin, Video, PlayCircle, Edit, Save, RotateCcw, Database,
    ChevronDown, ArrowRight, Mail, ExternalLink
} from 'lucide-react';
import { BlogPost, Resource, ExperienceItem, ResearchPaper, Performance, GalleryItem, Language, ContactMessage, PressItem, AboutData, AboutSection, LocalizedString } from '../types';
import { translations } from '../translations';
import { addItem, updateItem, deleteItem as deleteDbItem, setItem } from '../src/services/db';
import { signIn, logout } from '../src/services/auth';
import { uploadToStorage } from '../src/services/storage';
import { translateFields, generateSmartSummary } from '../src/services/translationService';
import { RichTextEditor } from './RichTextEditor';
import { getVideoEmbedUrl, getVideoThumbnailUrl } from '../src/utils/video';
import { getSoundCloudEmbedUrl, getSoundCloudOriginalUrl } from '../src/utils/audio';
import { compressImage } from '../src/utils/image';

interface AdminProps {
    isAuthenticated: boolean;
    onLogin: (status: boolean) => void;
    userEmail?: string | null;
    lang: Language;
    // Props for all sections (Read-only for display now, updates happen via DB)
    posts: BlogPost[]; setPosts: (posts: BlogPost[]) => void;
    resources: Resource[]; setResources: (resources: Resource[]) => void;
    experience: ExperienceItem[]; setExperience: (items: ExperienceItem[]) => void;
    research: ResearchPaper[]; setResearch: (items: ResearchPaper[]) => void;
    performances: Performance[]; setPerformances: (items: Performance[]) => void;
    gallery: GalleryItem[]; setGallery: (items: GalleryItem[]) => void;
    press: PressItem[]; setPress: (items: PressItem[]) => void;
    messages: ContactMessage[]; setMessages: (messages: ContactMessage[]) => void;
    aboutData: AboutData | null;
}

interface AdminCalendarProps {
    lang: Language;
    performances: Performance[];
    setNewPerfDate: (date: string) => void;
    setNewPerfDateISO: (date: string) => void;
}

const AdminCalendar: React.FC<AdminCalendarProps> = ({
    lang, performances, setNewPerfDate, setNewPerfDateISO
}) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const monthNames = lang === 'es' ?
        ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] :
        ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

    const days = [];
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const getEventsForDay = (day: number) => {
        return performances.filter(perf => {
            const perfDate = new Date((typeof perf.date === 'object' ? perf.date?.es : perf.date) || '');
            return perfDate.getDate() === day && perfDate.getMonth() === currentMonth && perfDate.getFullYear() === currentYear;
        });
    };

    const onDateSelect = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        const dayStr = date.getDate().toString().padStart(2, '0');
        const monthStr = date.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'short' }).replace('.', '');
        const yearStr = date.getFullYear();
        setNewPerfDate(`${dayStr} ${monthStr} ${yearStr}`);
        setNewPerfDateISO(`${yearStr}-${(currentMonth + 1).toString().padStart(2, '0')}-${dayStr}`);
    };

    return (
        <div className="bg-maestro-dark border border-white/10 p-6 rounded-xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                    <h4 className="text-maestro-gold font-serif tracking-wide">{monthNames[currentMonth]}</h4>
                    <select
                        value={currentYear}
                        onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                        className="bg-transparent text-maestro-gold/60 text-xs outline-none cursor-pointer hover:text-maestro-gold"
                    >
                        {[...Array(75)].map((_, i) => {
                            const y = 1960 + i;
                            return <option key={y} value={y} style={{ backgroundColor: '#0a0a0a' }}>{y}</option>;
                        })}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => {
                        if (currentMonth === 0) {
                            setCurrentMonth(11);
                            setCurrentYear(prev => prev - 1);
                        } else {
                            setCurrentMonth(prev => prev - 1);
                        }
                    }} className="p-1 hover:text-maestro-gold transition-colors">
                        <ChevronDown size={18} className="rotate-90" />
                    </button>
                    <button onClick={() => {
                        if (currentMonth === 11) {
                            setCurrentMonth(0);
                            setCurrentYear(prev => prev + 1);
                        } else {
                            setCurrentMonth(prev => prev + 1);
                        }
                    }} className="p-1 hover:text-maestro-gold transition-colors">
                        <ChevronDown size={18} className="-rotate-90" />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase text-white/40 mb-2 font-bold">
                {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                    const dayEvents = day ? getEventsForDay(day) : [];
                    const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

                    return (
                        <div
                            key={idx}
                            onClick={() => day && onDateSelect(day)}
                            className={`
                                h-8 flex flex-col items-center justify-center text-xs rounded-md transition-all
                                ${day ? 'hover:bg-maestro-gold/20 cursor-pointer' : ''}
                                ${isToday ? 'bg-white/10 text-maestro-gold font-bold border border-maestro-gold/30' : 'text-white/70'}
                            `}
                        >
                            {day}
                            {dayEvents.length > 0 && (
                                <div className="flex gap-0.5 mt-0.5">
                                    {dayEvents.slice(0, 3).map((_, eIdx) => (
                                        <div key={eIdx} className="w-1 h-1 bg-maestro-gold rounded-full shadow-[0_0_5px_rgba(234,179,8,0.8)]" />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <p className="text-[9px] text-white/30 mt-4 italic text-center">Tip: Haz clic en un día para seleccionar la fecha</p>
        </div>
    );
};

interface PressCalendarProps {
    lang: Language;
    press: PressItem[];
    setNewPressDate: (date: string) => void;
    setNewPressDateISO: (date: string) => void;
}

const PressCalendar: React.FC<PressCalendarProps> = ({
    lang, press, setNewPressDate, setNewPressDateISO
}) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const monthNames = lang === 'es' ?
        ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] :
        ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

    const days = [];
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const getArticlesForDay = (day: number) => {
        return press.filter(item => {
            const articleDate = new Date(item.dateISO || (item.date as any)?.es || item.date);
            return articleDate.getDate() === day && articleDate.getMonth() === currentMonth && articleDate.getFullYear() === currentYear;
        });
    };

    const onDateSelect = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        const dayStr = date.getDate().toString().padStart(2, '0');
        const monthStr = date.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'short' }).replace('.', '');
        const yearStr = date.getFullYear();
        setNewPressDate(`${dayStr} ${monthStr} ${yearStr}`);
        setNewPressDateISO(`${yearStr}-${(currentMonth + 1).toString().padStart(2, '0')}-${dayStr}`);
    };

    return (
        <div className="bg-maestro-dark border border-white/10 p-6 rounded-xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                    <h4 className="text-maestro-gold font-serif tracking-wide">{monthNames[currentMonth]}</h4>
                    <select
                        value={currentYear}
                        onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                        className="bg-transparent text-maestro-gold/60 text-xs outline-none cursor-pointer hover:text-maestro-gold"
                    >
                        {[...Array(75)].map((_, i) => {
                            const y = 1960 + i;
                            return <option key={y} value={y} style={{ backgroundColor: '#0a0a0a' }}>{y}</option>;
                        })}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => {
                        if (currentMonth === 0) {
                            setCurrentMonth(11);
                            setCurrentYear(prev => prev - 1);
                        } else {
                            setCurrentMonth(prev => prev - 1);
                        }
                    }} className="p-1 hover:text-maestro-gold transition-colors">
                        <ChevronDown size={18} className="rotate-90" />
                    </button>
                    <button onClick={() => {
                        if (currentMonth === 11) {
                            setCurrentMonth(0);
                            setCurrentYear(prev => prev + 1);
                        } else {
                            setCurrentMonth(prev => prev + 1);
                        }
                    }} className="p-1 hover:text-maestro-gold transition-colors">
                        <ChevronDown size={18} className="-rotate-90" />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase text-white/40 mb-2 font-bold">
                {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                    const dayArticles = day ? getArticlesForDay(day) : [];
                    const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

                    return (
                        <div
                            key={idx}
                            onClick={() => day && onDateSelect(day)}
                            className={`
                                h-8 flex flex-col items-center justify-center text-xs rounded-md transition-all
                                ${day ? 'hover:bg-maestro-gold/20 cursor-pointer' : ''}
                                ${isToday ? 'bg-white/10 text-maestro-gold font-bold border border-maestro-gold/30' : 'text-white/70'}
                            `}
                        >
                            {day}
                            {dayArticles.length > 0 && (
                                <div className="flex gap-0.5 mt-0.5">
                                    {dayArticles.slice(0, 3).map((_, eIdx) => (
                                        <div key={eIdx} className="w-1 h-1 bg-maestro-gold rounded-full shadow-[0_0_5px_rgba(234,179,8,0.8)]" />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <p className="text-[9px] text-white/30 mt-4 italic text-center">Tip: Haz clic en un día para seleccionar la fecha</p>
        </div>
    );
};

interface ExperienceCalendarProps {
    lang: Language;
    experience: ExperienceItem[];
    setNewExpYear: (year: string) => void;
    setNewExpDateISO: (date: string) => void;
}

const ExperienceCalendar: React.FC<ExperienceCalendarProps> = ({
    lang, experience, setNewExpYear, setNewExpDateISO
}) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [rangeStart, setRangeStart] = useState<Date | null>(null);

    const monthNames = lang === 'es' ?
        ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] :
        ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

    const days = [];
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const getExperienceForDay = (day: number) => {
        return experience.filter(item => {
            const itemDate = new Date(item.dateISO || (item.year as any)?.es || item.year);
            return itemDate.getDate() === day && itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        });
    };

    const formatDate = (d: Date) => {
        const dStr = d.getDate().toString().padStart(2, '0');
        const mStr = d.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'short' }).replace('.', '');
        const yStr = d.getFullYear();
        return `${dStr} ${mStr} ${yStr}`;
    };

    const onDateSelect = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);

        if (!rangeStart) {
            setRangeStart(date);
            setNewExpYear(`${lang === 'es' ? 'Desde' : 'From'} ${formatDate(date)}...`);
            setNewExpDateISO(`${date.getFullYear()}-${(currentMonth + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`);
        } else {
            const start = rangeStart < date ? rangeStart : date;
            const end = rangeStart < date ? date : rangeStart;

            setNewExpYear(`${formatDate(start)} - ${formatDate(end)}`);
            setNewExpDateISO(`${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')}`);
            setRangeStart(null);
        }
    };

    return (
        <div className="bg-maestro-dark border border-white/10 p-6 rounded-xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                    <h4 className="text-maestro-gold font-serif tracking-wide">{monthNames[currentMonth]}</h4>
                    <select
                        value={currentYear}
                        onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                        className="bg-transparent text-maestro-gold/60 text-xs outline-none cursor-pointer hover:text-maestro-gold"
                    >
                        {[...Array(75)].map((_, i) => {
                            const y = 1960 + i;
                            return <option key={y} value={y} style={{ backgroundColor: '#0a0a0a' }}>{y}</option>;
                        })}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => {
                        if (currentMonth === 0) {
                            setCurrentMonth(11);
                            setCurrentYear(prev => prev - 1);
                        } else {
                            setCurrentMonth(prev => prev - 1);
                        }
                    }} className="p-1 hover:text-maestro-gold transition-colors">
                        <ChevronDown size={18} className="rotate-90" />
                    </button>
                    <button onClick={() => {
                        if (currentMonth === 11) {
                            setCurrentMonth(0);
                            setCurrentYear(prev => prev + 1);
                        } else {
                            setCurrentMonth(prev => prev + 1);
                        }
                    }} className="p-1 hover:text-maestro-gold transition-colors">
                        <ChevronDown size={18} className="-rotate-90" />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase text-white/40 mb-2 font-bold">
                {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                    const dayItems = day ? getExperienceForDay(day) : [];
                    const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                    const isSelected = rangeStart && day === rangeStart.getDate() && currentMonth === rangeStart.getMonth() && currentYear === rangeStart.getFullYear();

                    return (
                        <div
                            key={idx}
                            onClick={() => day && onDateSelect(day)}
                            className={`
                                h-8 flex flex-col items-center justify-center text-xs rounded-md transition-all
                                ${day ? 'hover:bg-maestro-gold/20 cursor-pointer' : ''}
                                ${isSelected ? 'bg-maestro-gold text-maestro-dark font-bold' : (isToday ? 'bg-white/10 text-maestro-gold font-bold border border-maestro-gold/30' : 'text-white/70')}
                            `}
                        >
                            {day}
                            {dayItems.length > 0 && (
                                <div className="flex gap-0.5 mt-0.5">
                                    {dayItems.slice(0, 3).map((_, eIdx) => (
                                        <div key={eIdx} className="w-1 h-1 bg-maestro-gold rounded-full shadow-[0_0_5px_rgba(234,179,8,0.8)]" />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <p className="text-[9px] text-white/30 mt-4 italic text-center">
                {rangeStart ? (lang === 'es' ? 'Selecciona la fecha final' : 'Select end date') : (lang === 'es' ? 'Tip: Selecciona inicio y fin para el rango' : 'Tip: Select start and end for range')}
            </p>
        </div>
    );
};

export const Admin: React.FC<AdminProps> = ({
    isAuthenticated, onLogin, userEmail, lang,
    posts, resources, experience, research, performances, gallery, press, messages, aboutData
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [compressing, setCompressing] = useState(false);

    type Tab = 'blog' | 'resources' | 'experience' | 'research' | 'performances' | 'gallery' | 'press' | 'messages' | 'about';
    const [activeTab, setActiveTab] = useState<Tab>('blog');

    // Track which item ID is being edited. Null means "Creating New".
    const [editingId, setEditingId] = useState<string | null>(null);

    // --- STATE FOR FORMS ---
    // Blog
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImages, setNewPostImages] = useState<string[]>([]);
    const [newPostPreviewImage, setNewPostPreviewImage] = useState('');

    // Resources
    const [newResTitle, setNewResTitle] = useState('');
    const [newResDesc, setNewResDesc] = useState('');
    const [newResType, setNewResType] = useState<'score' | 'article' | 'audio'>('article');

    // Experience
    const [newExpYear, setNewExpYear] = useState('');
    const [newExpDateISO, setNewExpDateISO] = useState(''); // YYYY-MM-DD
    const [newExpRole, setNewExpRole] = useState('');
    const [newExpInst, setNewExpInst] = useState('');
    const [newExpDesc, setNewExpDesc] = useState('');

    // Research
    const [newResPaperTitle, setNewResPaperTitle] = useState('');
    const [newResJournal, setNewResJournal] = useState('');
    const [newResYear, setNewResYear] = useState('');
    const [newResAbstract, setNewResAbstract] = useState('');
    const [newResPaperPdfUrl, setNewResPaperPdfUrl] = useState('');
    const [newResPaperPreviewImage, setNewResPaperPreviewImage] = useState('');
    const [newResPaperLang, setNewResPaperLang] = useState('es');
    const [newResPaperLinkType, setNewResPaperLinkType] = useState<'pdf' | 'external'>('pdf');

    const [newPerfDate, setNewPerfDate] = useState('');
    const [newPerfDateISO, setNewPerfDateISO] = useState(''); // YYYY-MM-DD
    const [newPerfTitle, setNewPerfTitle] = useState('');
    const [newPerfLoc, setNewPerfLoc] = useState('');
    const [newPerfRole, setNewPerfRole] = useState('');
    const [newPerfDesc, setNewPerfDesc] = useState('');
    const [newPerfImages, setNewPerfImages] = useState<string[]>([]);

    // Gallery
    const [newGalType, setNewGalType] = useState<'image' | 'video' | 'audio'>('image');
    const [adminGalleryTab, setAdminGalleryTab] = useState<'image' | 'video' | 'audio'>('image');
    const [newGalSrc, setNewGalSrc] = useState('');
    const [newGalThumbnail, setNewGalThumbnail] = useState('');
    const [newGalCat, setNewGalCat] = useState('');
    const [newGalSubCat, setNewGalSubCat] = useState('');
    const [newGalAuthor, setNewGalAuthor] = useState('');
    const [newGalCap, setNewGalCap] = useState('');

    // Press
    const [newPressTitle, setNewPressTitle] = useState('');
    const [newPressSource, setNewPressSource] = useState('');
    const [newPressDate, setNewPressDate] = useState('');
    const [newPressExcerpt, setNewPressExcerpt] = useState('');
    const [newPressUrl, setNewPressUrl] = useState('');
    const [newPressImage, setNewPressImage] = useState('');
    const [newPressCategory, setNewPressCategory] = useState('');
    const [newPressContent, setNewPressContent] = useState('');
    const [newPressDateISO, setNewPressDateISO] = useState(''); // YYYY-MM-DD

    // About
    const [aboutProfileImage, setAboutProfileImage] = useState('');
    const [aboutBioTitle, setAboutBioTitle] = useState('');
    const [aboutBioHeading, setAboutBioHeading] = useState('');
    const [aboutSections, setAboutSections] = useState<AboutSection[]>([]);

    // Pagination & Search for Gallery Management
    const [adminGalleryPage, setAdminGalleryPage] = useState(1);
    const [adminBlogPage, setAdminBlogPage] = useState(1);
    const [adminPressPage, setAdminPressPage] = useState(1);
    const [adminGallerySearch, setAdminGallerySearch] = useState('');
    const ITEMS_PER_PAGE_ADMIN = 12;

    // --- VALIDATION STATE ---
    const [errorsPost, setErrorsPost] = useState<Record<string, string>>({});
    const [errorsExp, setErrorsExp] = useState<Record<string, string>>({});
    const [errorsResearch, setErrorsResearch] = useState<Record<string, string>>({});
    const [errorsPerf, setErrorsPerf] = useState<Record<string, string>>({});
    const [errorsGal, setErrorsGal] = useState<Record<string, string>>({});
    const [errorsPress, setErrorsPressForm] = useState<Record<string, string>>({});
    const [errorsAbout, setErrorsAbout] = useState<Record<string, string>>({});

    // --- HANDLERS ---
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Use the auth service
        const result = await signIn(email, password);

        if (!result.success) {
            setError('Error: Credenciales inválidas o problema de red.');
            // If failed, make sure we don't accidentally set authenticated true locally
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await logout();
        onLogin(false); // Update local state immediately for better UX
    };

    // Clear all forms and editing state
    const resetForms = () => {
        setEditingId(null);
        // Blog
        setNewPostTitle(''); setNewPostContent(''); setNewPostImages([]); setNewPostPreviewImage('');
        // Res
        setNewResTitle(''); setNewResDesc(''); setNewResType('article');
        // Exp
        setNewExpYear('');
        setNewExpDateISO('');
        setNewExpRole('');
        setNewExpInst(''); setNewExpDesc('');
        // Research
        setNewResPaperTitle(''); setNewResJournal(''); setNewResYear(''); setNewResAbstract('');
        setNewResPaperPdfUrl(''); setNewResPaperPreviewImage(''); setNewResPaperLang('es'); setNewResPaperLinkType('pdf');
        // Perf
        setNewPerfDate(''); setNewPerfDateISO(''); setNewPerfTitle(''); setNewPerfLoc(''); setNewPerfRole(''); setNewPerfDesc(''); setNewPerfImages([]);
        // Gal
        setNewGalCat('');
        setNewGalSubCat('');
        setNewGalAuthor('');
        setNewGalCap('');
        // Press
        setNewPressTitle('');
        setNewPressSource('');
        setNewPressDate('');
        setNewPressDateISO('');
        setNewPressDateISO('');
        setNewPressExcerpt('');
        setNewPressUrl('');
        setNewPressImage('');
        setNewPressCategory('');
        setNewPressContent('');

        // Reset About form to current data or empty
        if (aboutData) {
            setAboutProfileImage(aboutData.profileImage || '');
            setAboutBioTitle((typeof aboutData.bioTitle === 'object' ? aboutData.bioTitle?.es : aboutData.bioTitle) || '');
            setAboutBioHeading((typeof aboutData.bioHeading === 'object' ? aboutData.bioHeading?.es : aboutData.bioHeading) || '');
            setAboutSections(aboutData.sections || []);
        } else {
            setAboutProfileImage('');
            setAboutBioTitle('');
            setAboutBioHeading('');
            setAboutSections([]);
        }

        // Clear all validation errors
        setErrorsPost({});
        setErrorsExp({});
        setErrorsResearch({});
        setErrorsPerf({});
        setErrorsGal({});
        setErrorsPressForm({});
        setErrorsAbout({});

        setAdminGalleryPage(1);
        setAdminBlogPage(1);
        setAdminPressPage(1);
    };

    const changeTab = (tab: Tab) => {
        resetForms();
        // Special case for About: Load data when switching to tab
        if (tab === 'about' && aboutData) {
            setAboutProfileImage(aboutData.profileImage || '');
            setAboutBioTitle((typeof aboutData.bioTitle === 'object' ? aboutData.bioTitle?.es : aboutData.bioTitle) || '');
            setAboutBioHeading((typeof aboutData.bioHeading === 'object' ? aboutData.bioHeading?.es : aboutData.bioHeading) || '');
            setAboutSections(aboutData.sections || []);
        }
        setActiveTab(tab);
    };

    // Helper for File Upload to Storage - Single Setter
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void, storagePath: string) => {
        let file = e.target.files?.[0];
        if (file) {
            try {
                setLoading(true);

                // Compress if image
                if (file.type.startsWith('image/')) {
                    setCompressing(true);
                    const compressed = await compressImage(file);
                    file = compressed as File;
                    setCompressing(false);
                }

                const downloadURL = await uploadToStorage(file, storagePath);
                setter(downloadURL);
            } catch (error) {
                console.error('Error uploading file:', error);
                alert('Error al subir archivo. Intenta de nuevo.');
                setCompressing(false);
            } finally {
                setLoading(false);
            }
        }
    };

    // Specific Handler for Blog Image Upload (Appends to array)
    const handleBlogImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let file = e.target.files?.[0];
        if (file) {
            try {
                setLoading(true);

                // Compress if image
                if (file.type.startsWith('image/')) {
                    setCompressing(true);
                    const compressed = await compressImage(file);
                    file = compressed as File;
                    setCompressing(false);
                }

                const downloadURL = await uploadToStorage(file, 'images/blog/');
                setNewPostImages(prev => [...prev, downloadURL]);
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Error al subir imagen. Intenta de nuevo.');
                setCompressing(false);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEditorImageUpload = async (file: File): Promise<string> => {
        try {
            setLoading(true);
            let uploadFile = file;

            if (file.type.startsWith('image/')) {
                setCompressing(true);
                const compressed = await compressImage(file);
                uploadFile = compressed as File;
                setCompressing(false);
            }

            const url = await uploadToStorage(uploadFile, 'images/blog/content/');
            return url || '';
        } catch (error) {
            console.error('Error uploading editor image:', error);
            setCompressing(false);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handlePressEditorImageUpload = async (file: File): Promise<string> => {
        try {
            setLoading(true);
            let uploadFile = file;

            if (file.type.startsWith('image/')) {
                setCompressing(true);
                const compressed = await compressImage(file);
                uploadFile = compressed as File;
                setCompressing(false);
            }

            const url = await uploadToStorage(uploadFile, 'images/press/content/');
            return url || '';
        } catch (error) {
            console.error('Error uploading press editor image:', error);
            setCompressing(false);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleAboutEditorImageUpload = async (file: File): Promise<string> => {
        try {
            setLoading(true);
            let uploadFile = file;

            if (file.type.startsWith('image/')) {
                setCompressing(true);
                const compressed = await compressImage(file);
                uploadFile = compressed as File;
                setCompressing(false);
            }

            const url = await uploadToStorage(uploadFile, 'images/about/content/');
            return url || '';
        } catch (error) {
            console.error('Error uploading about editor image:', error);
            setCompressing(false);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // --- DB HELPERS ---
    // Simplificado para el modelo de traducción dinámica.
    // Guarda los datos de forma plana (Source of Truth en Español).
    const saveToDb = async (colName: any, id: string | null, data: any, commonData: any = {}) => {
        try {
            setLoading(true);
            const payload = {
                ...commonData,
                ...data,
                updatedAt: new Date().toISOString()
            };

            if (colName === 'about') {
                await setItem(colName, id || 'main', payload);
            } else if (id) {
                await updateItem(colName, id, payload);
            } else {
                await addItem(colName, payload);
            }
            resetForms();
        } catch (err) {
            console.error("Error saving:", err);
            alert("Error al guardar. Revisa la consola.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (colName: any, id: string) => {
        if (window.confirm('¿Eliminar elemento permanentemente?')) {
            await deleteDbItem(colName, id);
        }
    };

    // --- BLOG HANDLERS ---
    const removeImage = (index: number) => { setNewPostImages(newPostImages.filter((_, i) => i !== index)); };

    /**
     * Returns true if a stored field is a proper LocalizedString with a real English translation.
     * Catches cases where Gemini failed silently and stored the Spanish text in all languages.
     */
    const isProperlyTranslated = (stored: any): boolean => {
        if (!stored || typeof stored !== 'object') return false;
        const hasAllKeys = stored.es !== undefined && stored.en !== undefined && stored.ru !== undefined;
        if (!hasAllKeys) return false;
        // If en equals es, the translation failed silently
        const enDiffersFromEs = stored.en.trim() !== stored.es.trim();
        const ruDiffersFromEs = stored.ru.trim() !== stored.es.trim();
        return enDiffersFromEs && ruDiffersFromEs;
    };


    // --- VALIDATORS ---
    const validatePost = (): boolean => {
        const e: Record<string, string> = {};
        if (!newPostTitle.trim()) e.title = 'El título es obligatorio.';
        if (!newPostContent.trim()) e.content = 'El contenido es obligatorio.';
        setErrorsPost(e);
        return Object.keys(e).length === 0;
    };

    const validateExperience = (): boolean => {
        const e: Record<string, string> = {};
        if (!newExpRole.trim()) e.role = 'El rol es obligatorio.';
        if (!newExpInst.trim()) e.institution = 'La institución es obligatoria.';
        if (!newExpYear.trim()) e.year = 'El año es obligatorio.';
        setErrorsExp(e);
        return Object.keys(e).length === 0;
    };

    const validateResearch = (): boolean => {
        const e: Record<string, string> = {};
        if (!newResPaperTitle.trim()) e.title = 'El título es obligatorio.';
        if (!newResJournal.trim()) e.journal = 'La revista/journal es obligatoria.';
        if (!newResYear.trim()) e.year = 'El año es obligatorio.';
        if (!newResPaperPdfUrl.trim()) e.pdfUrl = newResPaperLinkType === 'pdf' ? 'Debes subir el archivo PDF.' : 'El enlace externo es obligatorio.';
        setErrorsResearch(e);
        return Object.keys(e).length === 0;
    };

    const validatePerformance = (): boolean => {
        const e: Record<string, string> = {};
        if (!newPerfTitle.trim()) e.title = 'El título es obligatorio.';
        if (!newPerfDate.trim()) e.date = 'La fecha es obligatoria.';
        if (!newPerfDateISO.trim()) e.dateISO = 'Selecciona una fecha en el calendario.';
        if (!newPerfLoc.trim()) e.location = 'La ubicación es obligatoria.';
        if (!newPerfRole.trim()) e.role = 'El rol es obligatorio.';
        setErrorsPerf(e);
        return Object.keys(e).length === 0;
    };

    const validateGallery = (): boolean => {
        const e: Record<string, string> = {};
        if (!newGalSrc.trim()) e.src = 'La fuente (imagen/URL) es obligatoria.';
        if (!newGalCat.trim()) e.category = 'El título es obligatorio.';
        setErrorsGal(e);
        return Object.keys(e).length === 0;
    };

    const validatePress = (): boolean => {
        const e: Record<string, string> = {};
        if (!newPressTitle.trim()) e.title = 'El título es obligatorio.';
        if (!newPressSource.trim()) e.source = 'La fuente es obligatoria.';
        if (!newPressDate.trim()) e.date = 'La fecha es obligatoria.';
        if (!newPressDateISO.trim()) e.dateISO = 'Selecciona una fecha en el calendario.';
        setErrorsPressForm(e);
        return Object.keys(e).length === 0;
    };

    const validateAbout = (): boolean => {
        const e: Record<string, string> = {};
        if (!aboutBioTitle.trim()) e.bioTitle = 'El título bio es obligatorio.';
        if (!aboutBioHeading.trim()) e.bioHeading = 'El encabezado bio es obligatorio.';
        setErrorsAbout(e);
        return Object.keys(e).length === 0;
    };

    const handleSavePost = async () => {
        if (!validatePost()) return;
        try {
            setTranslating(true);
            const originalPost = editingId ? posts.find(p => p.id === editingId) : null;

            // --- Smart Translation Cache ---
            // Compare current editor text (always Spanish) with what's stored in Firestore.
            const storedTitle = originalPost?.title;
            const storedContent = originalPost?.content;
            const storedTitleEs = typeof storedTitle === 'object' ? (storedTitle as any)?.es : storedTitle;
            const storedContentEs = typeof storedContent === 'object' ? (storedContent as any)?.es : storedContent;

            // A field needs translation if:
            // (a) new post, (b) never translated (plain string), (c) text changed, OR (d) bad translation (en===es)
            const titleNeedsTranslation = !originalPost || !isProperlyTranslated(storedTitle) || storedTitleEs !== newPostTitle;
            const contentNeedsTranslation = !originalPost || !isProperlyTranslated(storedContent) || storedContentEs !== newPostContent;

            let finalTitle: LocalizedString;
            let finalContent: LocalizedString;
            let smartSummary;

            const fieldsToTranslate: Record<string, string> = {};
            if (titleNeedsTranslation) fieldsToTranslate.title = newPostTitle;
            if (contentNeedsTranslation) fieldsToTranslate.content = newPostContent;

            if (Object.keys(fieldsToTranslate).length > 0) {
                console.log(`[Admin/Blog] Translating changed fields: ${Object.keys(fieldsToTranslate).join(', ')}`);
                const translated = await translateFields(fieldsToTranslate, Object.keys(fieldsToTranslate) as any);
                finalTitle = titleNeedsTranslation ? translated.title : (storedTitle as LocalizedString);
                finalContent = contentNeedsTranslation ? translated.content : (storedContent as LocalizedString);
                smartSummary = contentNeedsTranslation
                    ? await generateSmartSummary(newPostContent)
                    : (originalPost as any)?.preview || await generateSmartSummary(newPostContent);
            } else {
                console.log('[Admin/Blog] No text changes detected. Reusing existing translations. 0 tokens spent.');
                finalTitle = storedTitle as LocalizedString;
                finalContent = storedContent as LocalizedString;
                smartSummary = (originalPost as any)?.preview;
            }
            // --- End Smart Cache ---

            const postDate = originalPost?.date || new Date().toISOString();
            const postCreatedAt = (originalPost as any)?.createdAt || postDate;

            await saveToDb('posts', editingId,
                {
                    title: finalTitle,
                    content: finalContent,
                    preview: smartSummary
                },
                {
                    date: postDate,
                    images: newPostImages,
                    previewImage: newPostPreviewImage,
                    createdAt: postCreatedAt
                }
            );
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Error al guardar el artículo.");
        } finally {
            setTranslating(false);
        }
    };

    const startEditPost = (post: any) => {
        setEditingId(post.id);
        setNewPostTitle(post.title?.es || post.title || '');
        setNewPostContent(post.content?.es || post.content || '');
        setNewPostImages(post.images || []);
        setNewPostPreviewImage(post.previewImage || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- RESOURCE HANDLERS ---
    const handleSaveResource = async () => {
        if (!newResTitle) return;
        try {
            setTranslating(true);
            const translations = await translateFields(
                { title: newResTitle, description: newResDesc },
                ['title', 'description']
            );

            await saveToDb('resources', editingId,
                { title: translations.title, description: translations.description },
                { type: newResType, format: 'PDF', size: '1.2 MB' }
            );
        } catch (error) {
            console.error("Error saving resource:", error);
            alert("Error al guardar el recurso.");
        } finally {
            setTranslating(false);
        }
    };

    const startEditResource = (res: any) => {
        setEditingId(res.id);
        setNewResTitle((res.title as any)?.es || (typeof res.title === 'string' ? res.title : ''));
        setNewResDesc((res.description as any)?.es || (typeof res.description === 'string' ? res.description : ''));
        setNewResType(res.type);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- EXPERIENCE HANDLERS ---
    const handleSaveExperience = async () => {
        if (!validateExperience()) return;
        if (newExpRole.includes('[object Object]') || newExpInst.includes('[object Object]') || newExpYear.includes('[object Object]')) {
            alert("Error: El contenido contiene texto inválido ([object Object]). Por favor corrígelo.");
            return;
        }
        try {
            setTranslating(true);
            const translations = await translateFields(
                { role: newExpRole, institution: newExpInst, description: newExpDesc, year: newExpYear },
                ['role', 'institution', 'description', 'year']
            );

            await saveToDb('experience', editingId,
                {
                    role: translations.role,
                    institution: translations.institution,
                    description: translations.description,
                    year: translations.year
                },
                { yearRaw: newExpYear, dateISO: newExpDateISO } // Keep raw year for sorting if needed
            );
        } catch (error) {
            console.error("Error saving experience:", error);
            alert("Error al guardar la experiencia.");
        } finally {
            setTranslating(false);
        }
    };

    const startEditExperience = (exp: any) => {
        setEditingId(exp.id);
        setNewExpYear((exp.year as any)?.es || (typeof exp.year === 'string' ? exp.year : ''));
        setNewExpDateISO(exp.dateISO || '');
        setNewExpRole((exp.role as any)?.es || (typeof exp.role === 'string' ? exp.role : ''));
        setNewExpInst((exp.institution as any)?.es || (typeof exp.institution === 'string' ? exp.institution : ''));
        setNewExpDesc((exp.description as any)?.es || (typeof exp.description === 'string' ? exp.description : ''));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- RESEARCH HANDLERS ---
    const handleSaveResearch = async () => {
        if (!validateResearch()) return;
        if (newResPaperTitle.includes('[object Object]')) {
            alert("Error: El contenido contiene texto inválido ([object Object]).");
            return;
        }
        try {
            setTranslating(true);
            const translations = await translateFields(
                { title: newResPaperTitle },
                ['title']
            );

            await saveToDb('research', editingId,
                { title: translations.title },
                { journal: newResJournal, year: newResYear, pdfUrl: newResPaperPdfUrl, previewImage: newResPaperPreviewImage, articleLanguage: newResPaperLang, linkType: newResPaperLinkType }
            );
        } catch (error) {
            console.error("Error saving research:", error);
            alert("Error al guardar la investigación.");
        } finally {
            setTranslating(false);
        }
    };

    const startEditResearch = (res: any) => {
        setEditingId(res.id);
        setNewResPaperTitle((res.title as any)?.es || (typeof res.title === 'string' ? res.title : ''));
        setNewResJournal(res.journal);
        setNewResYear(res.year);
        setNewResAbstract((res.abstract as any)?.es || (typeof res.abstract === 'string' ? res.abstract : ''));
        setNewResPaperPdfUrl(res.pdfUrl || '');
        setNewResPaperPreviewImage(res.previewImage || '');
        setNewResPaperLang(res.articleLanguage || 'es');
        setNewResPaperLinkType(res.linkType || 'pdf');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- PERFORMANCE HANDLERS ---
    const handlePerfImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let file = e.target.files?.[0];
        if (!file) return;
        try {
            setLoading(true);

            // Compress if image
            if (file.type.startsWith('image/')) {
                setCompressing(true);
                const compressed = await compressImage(file);
                file = compressed as File;
                setCompressing(false);
            }

            const url = await uploadToStorage(file, `images/performances/${Date.now()}_${file.name}`);
            if (url) {
                setNewPerfImages(prev => [...prev, url]);
            }
        } catch (error) {
            console.error('Error uploading performance image:', error);
            alert('Error al subir imagen.');
            setCompressing(false);
        } finally {
            setLoading(false);
        }
    };
    const removePerfImage = (index: number) => {
        setNewPerfImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSavePerformance = async () => {
        if (!validatePerformance()) return;
        if (newPerfTitle.includes('[object Object]') || newPerfLoc.includes('[object Object]') || newPerfRole.includes('[object Object]')) {
            alert("Error: El contenido contiene texto inválido ([object Object]).");
            return;
        }
        try {
            setTranslating(true);
            const translations = await translateFields(
                { title: newPerfTitle, description: newPerfDesc, location: newPerfLoc, role: newPerfRole, date: newPerfDate },
                ['title', 'description', 'location', 'role', 'date']
            );

            // Automatic status calculation: if date is today or in the future -> upcoming, else past
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const eventDate = new Date(newPerfDateISO);
            const calculatedStatus: 'upcoming' | 'past' = eventDate >= today ? 'upcoming' : 'past';

            await saveToDb('performances', editingId,
                {
                    title: translations.title,
                    description: translations.description,
                    location: translations.location,
                    role: translations.role,
                    date: translations.date
                },
                { status: calculatedStatus, dateISO: newPerfDateISO, images: newPerfImages, createdAt: new Date().toISOString() }
            );
        } catch (error) {
            console.error("Error saving performance:", error);
            alert("Error al guardar el evento.");
        } finally {
            setTranslating(false);
        }
    };

    const startEditPerformance = (perf: any) => {
        setEditingId(perf.id);
        setNewPerfDate((perf.date as any)?.es || (typeof perf.date === 'string' ? perf.date : ''));
        setNewPerfDateISO(perf.dateISO || '');
        setNewPerfTitle((perf.title as any)?.es || (typeof perf.title === 'string' ? perf.title : ''));
        setNewPerfLoc((perf.location as any)?.es || (typeof perf.location === 'string' ? perf.location : ''));
        setNewPerfRole((perf.role as any)?.es || (typeof perf.role === 'string' ? perf.role : ''));
        setNewPerfDesc((perf.description as any)?.es || (typeof perf.description === 'string' ? perf.description : ''));
        setNewPerfImages(perf.images || []);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };



    // --- GALLERY HANDLERS ---
    const handleSaveGallery = async () => {
        if (!validateGallery()) return;
        if ((newGalCap && newGalCap.includes('[object Object]')) || (newGalCat && newGalCat.includes('[object Object]'))) {
            alert("Error: El contenido contiene texto inválido ([object Object]).");
            return;
        }
        try {
            setTranslating(true);
            const translations_data = await translateFields(
                { caption: newGalCap, category: newGalCat, author: newGalAuthor, subCategory: newGalSubCat },
                ['caption', 'category', 'author', 'subCategory']
            );

            await saveToDb('gallery', editingId,
                {
                    caption: translations_data.caption,
                    category: translations_data.category,
                    author: translations_data.author,
                    subCategory: translations_data.subCategory
                },
                {
                    type: newGalType,
                    src: newGalType === 'video' ? getVideoEmbedUrl(newGalSrc) : (newGalType === 'audio' ? getSoundCloudOriginalUrl(newGalSrc) : newGalSrc),
                    thumbnail: newGalType === 'video' ? (newGalThumbnail || getVideoThumbnailUrl(newGalSrc)) : newGalThumbnail
                }
            );
        } catch (error) {
            console.error("Error saving gallery item:", error);
            alert("Error al guardar el elemento de galería.");
        } finally {
            setTranslating(false);
        }
    };

    const startEditGallery = (item: any) => {
        setEditingId(item.id);
        setNewGalType(item.type);
        setAdminGalleryTab(item.type);
        setNewGalSrc(item.src);
        setNewGalThumbnail(item.thumbnail || '');
        setNewGalCat((item.category as any)?.es || (typeof item.category === 'string' ? item.category : ''));
        setNewGalSubCat((item.subCategory as any)?.es || (typeof item.subCategory === 'string' ? item.subCategory : ''));
        setNewGalAuthor((item.author as any)?.es || (typeof item.author === 'string' ? item.author : ''));
        setNewGalCap((item.caption as any)?.es || (typeof item.caption === 'string' ? item.caption : ''));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- PRESS HANDLERS ---
    const handleSavePress = async () => {
        if (!validatePress()) return;
        if (newPressTitle.includes('[object Object]') || newPressCategory.includes('[object Object]')) {
            alert("Error: El contenido contiene texto inválido ([object Object]).");
            return;
        }
        try {
            setTranslating(true);
            const originalPress = editingId ? press.find(p => p.id === editingId) : null;

            // --- Smart Translation Cache ---
            const pressFields: Record<string, { current: string; stored: any }> = {
                title: { current: newPressTitle, stored: originalPress?.title },
                excerpt: { current: newPressExcerpt, stored: (originalPress as any)?.excerpt },
                category: { current: newPressCategory, stored: (originalPress as any)?.category },
                content: { current: newPressContent, stored: (originalPress as any)?.content },
            };

            const fieldsToTranslate: Record<string, string> = {};
            const reuseTranslations: Record<string, LocalizedString> = {};

            for (const [key, { current, stored }] of Object.entries(pressFields)) {
                const storedEs = typeof stored === 'object' ? stored?.es : stored;
                // Needs translation if: not translated, text changed, OR bad translation (en===es)
                const needsTranslation = !originalPress || !isProperlyTranslated(stored) || storedEs !== current;
                if (needsTranslation) {
                    fieldsToTranslate[key] = current;
                } else {
                    reuseTranslations[key] = stored as LocalizedString;
                }
            }

            let finalTranslations: Record<string, LocalizedString> = { ...reuseTranslations };
            if (Object.keys(fieldsToTranslate).length > 0) {
                console.log(`[Admin/Press] Translating changed fields: ${Object.keys(fieldsToTranslate).join(', ')}`);
                const newTrans = await translateFields(fieldsToTranslate, Object.keys(fieldsToTranslate) as any);
                finalTranslations = { ...finalTranslations, ...newTrans };
            } else {
                console.log('[Admin/Press] No text changes detected. Reusing existing translations. 0 tokens spent.');
            }
            // --- End Smart Cache ---

            const pressCreatedAt = (originalPress as any)?.createdAt || originalPress?.dateISO || new Date().toISOString();

            await saveToDb('press', editingId,
                {
                    title: finalTranslations.title,
                    excerpt: finalTranslations.excerpt,
                    category: finalTranslations.category,
                    content: finalTranslations.content
                },
                {
                    source: newPressSource,
                    date: newPressDate,
                    dateISO: newPressDateISO,
                    url: newPressUrl,
                    image: newPressImage,
                    createdAt: pressCreatedAt
                }
            );
        } catch (error) {
            console.error("Error saving press item:", error);
            alert("Error al guardar el artículo de prensa.");
        } finally {
            setTranslating(false);
        }
    };

    const startEditPress = (item: PressItem) => {
        setEditingId(item.id);
        setNewPressTitle((item.title as any)?.es || (typeof item.title === 'string' ? item.title : ''));
        setNewPressSource(item.source);
        setNewPressDate(item.date);
        setNewPressDateISO(item.dateISO || '');
        setNewPressExcerpt((item.excerpt as any)?.es || (typeof item.excerpt === 'string' ? item.excerpt : ''));
        setNewPressUrl(item.url);
        setNewPressImage(item.image || '');
        setNewPressCategory((item.category as any)?.es || (typeof item.category === 'string' ? item.category : ''));
        setNewPressContent((item.content as any)?.es || (typeof item.content === 'string' ? item.content : ''));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };




    // --- ABOUT HANDLERS ---
    const handleSaveAbout = async () => {
        if (!validateAbout()) return;
        if (aboutBioTitle.includes('[object Object]') || aboutBioHeading.includes('[object Object]')) {
            alert("Error: El contenido contiene texto inválido ([object Object]).");
            return;
        }
        try {
            setLoading(true);
            setTranslating(true);

            // Translate main fields
            let mainTranslations;
            try {
                mainTranslations = await translateFields(
                    { bioTitle: aboutBioTitle, bioHeading: aboutBioHeading },
                    ['bioTitle', 'bioHeading']
                );
            } catch (e) {
                console.error("Translation failed for main fields", e);
                mainTranslations = {
                    bioTitle: { es: aboutBioTitle, en: aboutBioTitle, ru: aboutBioTitle },
                    bioHeading: { es: aboutBioHeading, en: aboutBioHeading, ru: aboutBioHeading }
                };
            }

            // Ensure we have values even if translation returned empty/undefined
            const finalBioTitle = mainTranslations.bioTitle || { es: aboutBioTitle, en: aboutBioTitle, ru: aboutBioTitle };
            const finalBioHeading = mainTranslations.bioHeading || { es: aboutBioHeading, en: aboutBioHeading, ru: aboutBioHeading };

            // Process sections
            const processedSections = await Promise.all(aboutSections.map(async (section) => {
                if (section.type === 'text' && section.content) {
                    // Extract spanish text from current state
                    const text = typeof section.content === 'string' ? section.content : (section.content as any).es || section.content;

                    // Translate content
                    let contentTrans;
                    try {
                        contentTrans = await translateFields({ content: text }, ['content']);
                    } catch (e) {
                        console.error("Translation failed for section", e);
                        contentTrans = { content: { es: text, en: text, ru: text } };
                    }

                    const finalContent = contentTrans.content || { es: text, en: text, ru: text };

                    return {
                        ...section,
                        content: finalContent
                    };
                }
                return section;
            }));

            // Sanitize payload to remove undefined values (Firestore rejects them)
            const cleanSections = processedSections.map(s => {
                const clean = { ...s };
                if (clean.type === 'text') delete clean.image;
                if (clean.type === 'image') delete clean.content;
                return clean;
            });

            const payload: AboutData = {
                id: 'main', // Single document for About page
                profileImage: aboutProfileImage,
                bioTitle: finalBioTitle,
                bioHeading: finalBioHeading,
                sections: cleanSections,
                updatedAt: new Date().toISOString()
            };

            await saveToDb('about', 'main', payload);
            alert('Sección Sobre Mí actualizada correctamente');

        } catch (error) {
            console.error("Error saving about data:", error);
            alert("Error al guardar la configuración de Sobre Mí.");
        } finally {
            setLoading(false);
            setTranslating(false);
        }
    };

    const addAboutSection = (type: 'text' | 'image') => {
        setAboutSections([...aboutSections, {
            id: Date.now().toString(),
            type,
            content: type === 'text' ? { es: '', en: '', ru: '' } : undefined,
            image: type === 'image' ? '' : undefined,
            order: aboutSections.length
        }]);
    };

    const updateAboutSection = (id: string, field: string, value: any) => {
        setAboutSections(aboutSections.map(s => {
            if (s.id === id) {
                return { ...s, [field]: value };
            }
            return s;
        }));
    };

    const removeAboutSection = (index: number) => {
        setAboutSections(aboutSections.filter((_, i) => i !== index));
    };

    const moveAboutSection = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === aboutSections.length - 1)) return;
        const newSections = [...aboutSections];
        const temp = newSections[index];
        newSections[index] = newSections[index + (direction === 'up' ? -1 : 1)];
        newSections[index + (direction === 'up' ? -1 : 1)] = temp;
        setAboutSections(newSections);
    };

    // --- LOGIN VIEW ---
    if (!isAuthenticated) {
        return (
            <section className="min-h-screen flex items-center justify-center bg-maestro-dark px-6">
                <FadeIn>
                    <div className="bg-white/5 border border-white/10 p-10 max-w-md w-full rounded-sm text-center">
                        <div className="w-16 h-16 bg-maestro-dark border border-maestro-gold rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="text-maestro-gold" size={24} />
                        </div>
                        <h2 className="text-2xl font-serif text-maestro-light mb-2">Panel de Control</h2>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email..." className="w-full bg-maestro-dark border border-white/10 p-3 text-white text-center" />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña..." className="w-full bg-maestro-dark border border-white/10 p-3 text-white text-center" />
                            {error && <p className="text-red-400 text-xs">{error}</p>}
                            <button disabled={loading} className="w-full bg-maestro-gold text-maestro-dark font-bold py-3 uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50">
                                {loading ? 'Entrando...' : 'Ingresar'}
                            </button>
                        </form>
                    </div>
                </FadeIn>
            </section>
        );
    }

    // --- DASHBOARD VIEW ---

    return (
        <section className="min-h-screen bg-maestro-dark pt-28 px-6 pb-24">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-white/10 pb-8">
                    <div>
                        <h2 className="text-3xl font-serif text-maestro-light">Panel Maestro</h2>
                        <p className="text-maestro-light/40 text-sm mt-1">Gestión integral del portafolio ({lang.toUpperCase()})</p>
                        {userEmail && <p className="text-maestro-gold text-xs mt-1">Conectado como: {userEmail}</p>}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleLogout} className="mt-4 md:mt-0 flex items-center gap-2 text-xs uppercase tracking-widest text-maestro-light/50 hover:text-red-400 transition-colors">
                            <LogOut size={14} /> Cerrar Sesión
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1 space-y-2">
                        {[
                            { id: 'blog', label: 'Blog', icon: FileText },
                            // { id: 'resources', label: 'Recursos', icon: Music },
                            { id: 'experience', label: 'Experiencia', icon: Briefcase },
                            { id: 'research', label: 'Investigación', icon: BookOpen },
                            { id: 'performances', label: 'Eventos', icon: Calendar },
                            { id: 'gallery', label: 'Galería', icon: ImageIcon },
                            { id: 'press', label: 'Prensa', icon: FileText },
                            { id: 'messages', label: 'Mensajes', icon: Mail },
                            { id: 'about', label: 'Sobre Mí', icon: Briefcase }, // Reusing Briefcase icon for now
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => changeTab(tab.id as Tab)}
                                className={`w-full text-left p-4 flex items-center gap-3 transition-all ${activeTab === tab.id ? 'bg-maestro-gold text-maestro-dark font-bold' : 'bg-white/5 text-maestro-light/60 hover:text-maestro-gold'}`}
                            >
                                <tab.icon size={18} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 bg-white/5 border border-white/10 p-8 min-h-[500px]">

                        {/* 1. BLOG MANAGEMENT */}
                        {activeTab === 'blog' && (
                            <FadeIn>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-serif text-maestro-light flex items-center gap-2">
                                        {editingId ? <Edit className="text-maestro-gold" size={20} /> : <PlusCircle className="text-maestro-gold" size={20} />}
                                        {editingId ? 'Editar Artículo' : 'Nuevo Artículo'}
                                    </h3>
                                    {editingId && <button onClick={resetForms} className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300"><RotateCcw size={12} /> Cancelar Edición</button>}
                                </div>

                                <div className="space-y-4 mb-12 border-b border-white/10 pb-12">
                                    <div>
                                        <input type="text" value={newPostTitle} onChange={(e) => { setNewPostTitle(e.target.value); if (e.target.value.trim()) setErrorsPost(prev => ({ ...prev, title: '' })); }} placeholder="Título..." className={`w-full bg-maestro-dark border p-3 text-white focus:border-maestro-gold outline-none ${errorsPost.title ? 'border-red-500' : 'border-white/10'}`} />
                                        {errorsPost.title && <p className="text-red-400 text-xs mt-1">{errorsPost.title}</p>}
                                    </div>

                                    {/* Preview Image Field */}
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-maestro-gold uppercase tracking-[0.2em]">Imagen de Portada (Preview)</label>
                                        <div className="flex gap-4 items-start">
                                            <label className="flex-grow bg-white/5 border border-dashed border-white/20 p-6 text-maestro-light hover:text-maestro-gold hover:border-maestro-gold/50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all group rounded-sm min-h-[120px]">
                                                <UploadCloud size={24} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-xs uppercase tracking-widest font-bold">Subir Imagen desde Dispositivo</span>
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleFileUpload(e, setNewPostPreviewImage, 'images/blog/previews/')}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                            </label>

                                            {newPostPreviewImage && (
                                                <div className="relative w-48 aspect-video border border-maestro-gold/50 bg-black/20 overflow-hidden rounded-sm group shadow-2xl">
                                                    <img src={newPostPreviewImage} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            onClick={() => setNewPostPreviewImage('')}
                                                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-400 transition-colors shadow-lg"
                                                            title="Eliminar imagen"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {translating && (
                                        <div className="flex items-center gap-3 text-maestro-gold text-sm animate-pulse bg-maestro-gold/10 p-3 border border-maestro-gold/20">
                                            <Database size={16} className="animate-spin" />
                                            <span>Gemini está traduciendo tu contenido al Inglés y Ruso...</span>
                                        </div>
                                    )}
                                    {compressing && (
                                        <div className="flex items-center gap-3 text-maestro-gold text-sm animate-pulse bg-maestro-gold/10 p-3 border border-maestro-gold/20">
                                            <ImageIcon size={16} className="animate-pulse" />
                                            <span>Optimizando imagen para la web...</span>
                                        </div>
                                    )}
                                    <div>
                                        <RichTextEditor
                                            value={newPostContent}
                                            onChange={(v) => { setNewPostContent(v); if (v.trim()) setErrorsPost(prev => ({ ...prev, content: '' })); }}
                                            onImageUpload={handleEditorImageUpload}
                                            placeholder="Contenido del artículo..."
                                            minHeight="300px"
                                        />
                                        {errorsPost.content && <p className="text-red-400 text-xs mt-1">{errorsPost.content}</p>}
                                    </div>

                                    {/* Article Gallery Section */}
                                    <div className="space-y-4 bg-maestro-dark border border-white/10 p-4 rounded-sm">
                                        <label className="block text-[10px] font-bold text-maestro-gold uppercase tracking-[0.2em]">Galería de Imágenes del Artículo</label>

                                        <div className="flex flex-wrap gap-4">
                                            <label className="w-40 aspect-square bg-white/5 border border-dashed border-white/20 text-maestro-light/40 hover:text-maestro-gold hover:border-maestro-gold/50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all group rounded-sm">
                                                <PlusCircle size={24} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-[10px] uppercase font-bold text-center px-2">Añadir Foto</span>
                                                <input
                                                    type="file"
                                                    onChange={handleBlogImageUpload}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                            </label>

                                            {newPostImages.map((img, idx) => (
                                                <div key={idx} className="relative w-40 aspect-square border border-white/10 overflow-hidden rounded-sm group shadow-xl">
                                                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            onClick={() => removeImage(idx)}
                                                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-400 transition-colors shadow-lg"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <button disabled={translating || loading} onClick={handleSavePost} className={`w-full md:w-auto px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors ${(translating || loading) ? 'bg-gray-600 cursor-not-allowed' : (editingId ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-maestro-gold hover:bg-white text-maestro-dark')}`}>
                                        {translating ? 'Traduciendo...' : (loading ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Publicar'))}
                                    </button>
                                    {Object.values(errorsPost).some(Boolean) && (
                                        <p className="text-red-400 text-xs flex items-center gap-1">⚠ Completa los campos obligatorios antes de guardar.</p>
                                    )}
                                </div>
                                {/* List with Sorting and Pagination */}
                                <div className="space-y-4">
                                    {(() => {
                                        // Helper to parse dates for sorting
                                        const parseDate = (d: string) => {
                                            if (!d) return 0;
                                            if (d.includes('T')) return new Date(d).getTime();
                                            const [day, month, year] = d.split('/').map(Number);
                                            return new Date(year, month - 1, day).getTime();
                                        };

                                        // Helper to format date for display
                                        const formatDate = (d: string) => {
                                            if (!d) return '--/--/----';
                                            if (!d.includes('T')) return d;
                                            const date = new Date(d);
                                            return isNaN(date.getTime()) ? d : `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                                        };

                                        const sortedPosts = [...posts].sort((a, b) => parseDate(b.date) - parseDate(a.date));
                                        const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE_ADMIN);
                                        const paginatedPosts = sortedPosts.slice((adminBlogPage - 1) * ITEMS_PER_PAGE_ADMIN, adminBlogPage * ITEMS_PER_PAGE_ADMIN);

                                        return (
                                            <>
                                                {paginatedPosts.map(post => (
                                                    <div key={post.id} className={`flex justify-between items-center p-4 border transition-all ${editingId === post.id ? 'bg-maestro-gold/10 border-maestro-gold' : 'bg-maestro-dark border-white/5 hover:border-maestro-gold/30'}`}>
                                                        <div>
                                                            <h4 className="text-maestro-light font-bold">{(typeof post.title === 'object' ? post.title?.es : post.title) || ''}</h4>
                                                            <span className="text-xs text-maestro-gold/60 font-mono">{formatDate(post.date)}</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => startEditPost(post)} className="text-maestro-light/30 hover:text-blue-400 p-2" title="Editar"><Edit size={18} /></button>
                                                            <button onClick={() => handleDelete('posts', post.id)} className="text-maestro-light/30 hover:text-red-500 p-2" title="Eliminar"><Trash2 size={18} /></button>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Pagination Controls */}
                                                {totalPages > 1 && (
                                                    <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-white/5">
                                                        <button
                                                            disabled={adminBlogPage === 1}
                                                            onClick={() => setAdminBlogPage(prev => prev - 1)}
                                                            className="p-2 text-maestro-light/40 hover:text-maestro-gold disabled:opacity-20 transition-colors"
                                                        >
                                                            <ChevronDown size={20} className="rotate-90" />
                                                        </button>
                                                        <span className="text-[10px] uppercase tracking-widest font-bold text-maestro-gold/80">
                                                            Página {adminBlogPage} de {totalPages}
                                                        </span>
                                                        <button
                                                            disabled={adminBlogPage === totalPages}
                                                            onClick={() => setAdminBlogPage(prev => prev + 1)}
                                                            className="p-2 text-maestro-light/40 hover:text-maestro-gold disabled:opacity-20 transition-colors"
                                                        >
                                                            <ChevronDown size={20} className="-rotate-90" />
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </FadeIn>
                        )}

                        {/* 2. RESOURCES MANAGEMENT */}
                        {/* {activeTab === 'resources' && (
                            <FadeIn>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-serif text-maestro-light flex items-center gap-2">
                                        {editingId ? <Edit className="text-maestro-gold" size={20} /> : <PlusCircle className="text-maestro-gold" size={20} />}
                                        {editingId ? 'Editar Recurso' : 'Nuevo Recurso'}
                                    </h3>
                                    {editingId && <button onClick={resetForms} className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300"><RotateCcw size={12} /> Cancelar Edición</button>}
                                </div>
                                <div className="space-y-4 mb-12 border-b border-white/10 pb-12">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" value={newResTitle} onChange={(e) => setNewResTitle(e.target.value)} placeholder="Título..." className="w-full bg-maestro-dark border border-white/10 p-3 text-white" />
                                        <select value={newResType} onChange={(e) => setNewResType(e.target.value as any)} className="w-full bg-maestro-dark border border-white/10 p-3 text-white">
                                            <option value="score">Partitura</option><option value="article">Artículo</option><option value="audio">Audio</option>
                                        </select>
                                    </div>
                                    <RichTextEditor
                                        value={newResDesc}
                                        onChange={setNewResDesc}
                                        placeholder="Descripción del recurso..."
                                        minHeight="200px"
                                    />
                                    {translating && (
                                        <div className="flex items-center gap-3 text-maestro-gold text-sm animate-pulse mb-4">
                                            <Database size={16} className="animate-spin" />
                                            <span>Traduciendo recurso...</span>
                                        </div>
                                    )}
                                    <button disabled={translating || loading} onClick={handleSaveResource} className={`w-full md:w-auto px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors ${(translating || loading) ? 'bg-gray-600 cursor-not-allowed' : (editingId ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-maestro-gold hover:bg-white text-maestro-dark')}`}>
                                        {translating ? 'Traduciendo...' : (loading ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Añadir'))}
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {resources.map(res => (
                                        <div key={res.id} className={`flex justify-between items-center p-4 border transition-all ${editingId === res.id ? 'bg-maestro-gold/10 border-maestro-gold' : 'bg-maestro-dark border-white/5 hover:border-maestro-gold/30'}`}>
                                            <div><h4 className="text-maestro-light font-bold">{(typeof res.title === 'object' ? res.title?.es : res.title) || ''}</h4><span className="text-xs text-maestro-light/40">{res.type}</span></div>
                                            <div className="flex gap-2">
                                                <button onClick={() => startEditResource(res)} className="text-maestro-light/30 hover:text-blue-400 p-2"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete('resources', res.id)} className="text-maestro-light/30 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>
                        )} */}

                        {/* 3. EXPERIENCE MANAGEMENT */}
                        {activeTab === 'experience' && (
                            <FadeIn>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-serif text-maestro-light flex items-center gap-2">
                                        {editingId ? <Edit className="text-maestro-gold" size={20} /> : <PlusCircle className="text-maestro-gold" size={20} />}
                                        {editingId ? 'Editar Experiencia' : 'Nueva Experiencia'}
                                    </h3>
                                    {editingId && <button onClick={resetForms} className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300"><RotateCcw size={12} /> Cancelar Edición</button>}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 border-b border-white/10 pb-12">
                                    {/* Left: Interactive Calendar */}
                                    <div className="lg:col-span-1">
                                        <ExperienceCalendar
                                            lang={lang}
                                            experience={experience}
                                            setNewExpYear={setNewExpYear}
                                            setNewExpDateISO={setNewExpDateISO}
                                        />
                                    </div>

                                    {/* Right: The Form */}
                                    <div className="lg:col-span-2 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <input type="text" value={newExpYear} onChange={(e) => { setNewExpYear(e.target.value); if (e.target.value.trim()) setErrorsExp(prev => ({ ...prev, year: '' })); }} placeholder="Año (ej: 2023 - Presente o Selecciona en Calendario)" className={`w-full bg-maestro-dark border p-3 text-white focus:border-maestro-gold outline-none ${errorsExp.year ? 'border-red-500' : 'border-white/10'}`} />
                                                {errorsExp.year && <p className="text-red-400 text-xs mt-1">{errorsExp.year}</p>}
                                            </div>
                                            <div>
                                                <input type="text" value={newExpRole} onChange={(e) => { setNewExpRole(e.target.value); if (e.target.value.trim()) setErrorsExp(prev => ({ ...prev, role: '' })); }} placeholder="Rol (ej: Director)" className={`w-full bg-maestro-dark border p-3 text-white focus:border-maestro-gold outline-none ${errorsExp.role ? 'border-red-500' : 'border-white/10'}`} />
                                                {errorsExp.role && <p className="text-red-400 text-xs mt-1">{errorsExp.role}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <input type="text" value={newExpInst} onChange={(e) => { setNewExpInst(e.target.value); if (e.target.value.trim()) setErrorsExp(prev => ({ ...prev, institution: '' })); }} placeholder="Institución" className={`w-full bg-maestro-dark border p-3 text-white focus:border-maestro-gold outline-none ${errorsExp.institution ? 'border-red-500' : 'border-white/10'}`} />
                                            {errorsExp.institution && <p className="text-red-400 text-xs mt-1">{errorsExp.institution}</p>}
                                        </div>
                                        <RichTextEditor
                                            value={newExpDesc}
                                            onChange={setNewExpDesc}
                                            placeholder="Descripción de la experiencia..."
                                            minHeight="200px"
                                        />
                                        {translating && (
                                            <div className="flex items-center gap-3 text-maestro-gold text-sm animate-pulse mb-4">
                                                <Database size={16} className="animate-spin" />
                                                <span>Traduciendo experiencia...</span>
                                            </div>
                                        )}
                                        <button disabled={translating || loading} onClick={handleSaveExperience} className={`w-full md:w-auto px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors ${(translating || loading) ? 'bg-gray-600 cursor-not-allowed' : (editingId ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-maestro-gold hover:bg-white text-maestro-dark')}`}>
                                            {translating ? 'Traduciendo...' : (loading ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Añadir'))}
                                        </button>
                                        {Object.values(errorsExp).some(Boolean) && (
                                            <p className="text-red-400 text-xs flex items-center gap-1">⚠ Completa los campos obligatorios antes de guardar.</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {experience.map(exp => (
                                        <div key={exp.id} className={`flex justify-between items-center p-4 border transition-all ${editingId === exp.id ? 'bg-maestro-gold/10 border-maestro-gold' : 'bg-maestro-dark border-white/5 hover:border-maestro-gold/30'}`}>
                                            <div><h4 className="text-maestro-light font-bold">{(typeof exp.role === 'object' ? exp.role?.es : exp.role) || ''}</h4><span className="text-xs text-maestro-light/40">{(typeof exp.year === 'object' ? exp.year?.es : exp.year) || ''}</span></div>
                                            <div className="flex gap-2">
                                                <button onClick={() => startEditExperience(exp)} className="text-maestro-light/30 hover:text-blue-400 p-2"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete('experience', exp.id)} className="text-maestro-light/30 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>
                        )}

                        {/* 4. RESEARCH MANAGEMENT */}
                        {activeTab === 'research' && (
                            <FadeIn>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-serif text-maestro-light flex items-center gap-2">
                                        {editingId ? <Edit className="text-maestro-gold" size={20} /> : <PlusCircle className="text-maestro-gold" size={20} />}
                                        {editingId ? 'Editar Investigación' : 'Nueva Investigación'}
                                    </h3>
                                    {editingId && <button onClick={resetForms} className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300"><RotateCcw size={12} /> Cancelar Edición</button>}
                                </div>
                                <div className="space-y-4 mb-12 border-b border-white/10 pb-12">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <input type="text" value={newResPaperTitle} onChange={(e) => { setNewResPaperTitle(e.target.value); if (e.target.value.trim()) setErrorsResearch(prev => ({ ...prev, title: '' })); }} placeholder="Título Paper" className={`w-full bg-maestro-dark border p-3 text-white ${errorsResearch.title ? 'border-red-500' : 'border-white/10'}`} />
                                            {errorsResearch.title && <p className="text-red-400 text-xs mt-1">{errorsResearch.title}</p>}
                                        </div>
                                        <div>
                                            <input type="text" value={newResYear} onChange={(e) => { setNewResYear(e.target.value); if (e.target.value.trim()) setErrorsResearch(prev => ({ ...prev, year: '' })); }} placeholder="Año" className={`w-full bg-maestro-dark border p-3 text-white ${errorsResearch.year ? 'border-red-500' : 'border-white/10'}`} />
                                            {errorsResearch.year && <p className="text-red-400 text-xs mt-1">{errorsResearch.year}</p>}
                                        </div>

                                        {/* Article Language Selection */}
                                        <select
                                            value={newResPaperLang}
                                            onChange={(e) => setNewResPaperLang(e.target.value)}
                                            className="w-full bg-maestro-dark border border-white/10 p-3 text-white outline-none focus:border-maestro-gold transition-colors"
                                        >
                                            <option value="es">Español (ES)</option>
                                            <option value="en">English (EN)</option>
                                            <option value="ru">Русский (RU)</option>
                                            <option value="multilingual">Multilingüe / Otros</option>
                                        </select>
                                    </div>
                                    <div>
                                        <input type="text" value={newResJournal} onChange={(e) => { setNewResJournal(e.target.value); if (e.target.value.trim()) setErrorsResearch(prev => ({ ...prev, journal: '' })); }} placeholder="Revista / Journal" className={`w-full bg-maestro-dark border p-3 text-white ${errorsResearch.journal ? 'border-red-500' : 'border-white/10'}`} />
                                        {errorsResearch.journal && <p className="text-red-400 text-xs mt-1">{errorsResearch.journal}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-black/20 p-6 border border-white/5 rounded-sm">
                                        {/* Link Type Selector */}
                                        <div className="space-y-4">
                                            <label className="block text-[10px] uppercase text-maestro-gold tracking-widest font-bold">Tipo de Recurso</label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setNewResPaperLinkType('pdf')}
                                                    className={`flex-1 flex items-center justify-center gap-2 p-3 text-xs font-bold transition-all border ${newResPaperLinkType === 'pdf' ? 'bg-maestro-gold text-maestro-dark border-maestro-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-maestro-dark border-white/10 text-white/50 hover:border-white/30'}`}
                                                >
                                                    <UploadCloud size={16} /> ARCHIVO PDF
                                                </button>
                                                <button
                                                    onClick={() => setNewResPaperLinkType('external')}
                                                    className={`flex-1 flex items-center justify-center gap-2 p-3 text-xs font-bold transition-all border ${newResPaperLinkType === 'external' ? 'bg-maestro-gold text-maestro-dark border-maestro-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-maestro-dark border-white/10 text-white/50 hover:border-white/30'}`}
                                                >
                                                    <ExternalLink size={16} /> LINK EXTERNO
                                                </button>
                                            </div>

                                            {/* Link Input (Conditional) */}
                                            {newResPaperLinkType === 'pdf' ? (
                                                <div className="space-y-2">
                                                    <label className="flex items-center justify-center gap-2 cursor-pointer bg-maestro-dark border border-white/10 p-3 text-white/50 hover:text-white hover:border-maestro-gold transition-colors w-full rounded-sm">
                                                        <UploadCloud size={20} />
                                                        <span className="text-xs">{newResPaperPdfUrl ? 'PDF Cargado' : 'Subir Artículo (PDF solamente)'}</span>
                                                        <input
                                                            type="file"
                                                            accept=".pdf,application/pdf"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file && file.type !== 'application/pdf') {
                                                                    alert('Por favor, sube solo archivos en formato PDF.');
                                                                    e.target.value = '';
                                                                    return;
                                                                }
                                                                handleFileUpload(e, setNewResPaperPdfUrl, 'research/pdfs/');
                                                            }}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                    {newResPaperPdfUrl && <p className="text-[10px] text-maestro-gold italic break-all">✓ {newResPaperPdfUrl}</p>}
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={newResPaperPdfUrl}
                                                        onChange={(e) => { setNewResPaperPdfUrl(e.target.value); if (e.target.value.trim()) setErrorsResearch(prev => ({ ...prev, pdfUrl: '' })); }}
                                                        placeholder="Pegar URL de la revista (https://...)"
                                                        className={`w-full bg-maestro-dark border p-3 text-white text-xs placeholder:opacity-30 ${errorsResearch.pdfUrl ? 'border-red-500' : 'border-white/10'}`}
                                                    />
                                                    {errorsResearch.pdfUrl && <p className="text-red-400 text-xs mt-1">{errorsResearch.pdfUrl}</p>}
                                                </div>
                                            )}
                                        </div>

                                        {/* Preview Image Upload */}
                                        <div className="space-y-4">
                                            <label className="block text-[10px] uppercase text-maestro-gold tracking-widest font-bold">Imagen de Portada</label>
                                            <div className="flex gap-4 items-start">
                                                <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer bg-maestro-dark border border-white/10 p-3 text-white/50 hover:text-white hover:border-maestro-gold transition-colors rounded-sm h-[46px]">
                                                    <ImageIcon size={20} />
                                                    <span className="text-xs">{newResPaperPreviewImage ? 'Cambiar Imagen' : 'Subir Miniatura'}</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload(e, setNewResPaperPreviewImage, 'research/previews/')}
                                                        className="hidden"
                                                    />
                                                </label>
                                                {newResPaperPreviewImage && (
                                                    <div className="w-16 h-16 bg-black/20 rounded border border-white/10 overflow-hidden shrink-0">
                                                        <img src={newResPaperPreviewImage} alt="Preview" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {translating && (
                                        <div className="flex items-center gap-3 text-maestro-gold text-sm animate-pulse mb-4">
                                            <Database size={16} className="animate-spin" />
                                            <span>Traduciendo título...</span>
                                        </div>
                                    )}
                                    {errorsResearch.pdfUrl && newResPaperLinkType === 'pdf' && (
                                        <p className="text-red-400 text-xs">{errorsResearch.pdfUrl}</p>
                                    )}
                                    <button disabled={translating || loading} onClick={handleSaveResearch} className={`w-full md:w-auto px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors ${(translating || loading) ? 'bg-gray-600 cursor-not-allowed' : (editingId ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-maestro-gold hover:bg-white text-maestro-dark')}`}>
                                        {translating ? 'Traduciendo...' : (loading ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Añadir'))}
                                    </button>
                                    {Object.values(errorsResearch).some(Boolean) && (
                                        <p className="text-red-400 text-xs flex items-center gap-1">⚠ Completa los campos obligatorios antes de guardar.</p>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    {research.map(res => (
                                        <div key={res.id} className={`flex justify-between items-center p-4 border transition-all ${editingId === res.id ? 'bg-maestro-gold/10 border-maestro-gold' : 'bg-maestro-dark border-white/5 hover:border-maestro-gold/30'}`}>
                                            <div><h4 className="text-maestro-light font-bold">{(typeof res.title === 'object' ? res.title?.es : res.title) || ''}</h4><span className="text-xs text-maestro-light/40">{res.year}</span></div>
                                            <div className="flex gap-2">
                                                <button onClick={() => startEditResearch(res)} className="text-maestro-light/30 hover:text-blue-400 p-2"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete('research', res.id)} className="text-maestro-light/30 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>
                        )}

                        {/* 5. PERFORMANCES MANAGEMENT */}
                        {activeTab === 'performances' && (
                            <FadeIn>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-serif text-maestro-light flex items-center gap-2">
                                        {editingId ? <Edit className="text-maestro-gold" size={20} /> : <PlusCircle className="text-maestro-gold" size={20} />}
                                        {editingId ? 'Editar Actuación' : 'Nueva Actuación'}
                                    </h3>
                                    {editingId && <button onClick={resetForms} className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300"><RotateCcw size={12} /> Cancelar Edición</button>}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 border-b border-white/10 pb-12">
                                    {/* Left: Interactive Calendar */}
                                    <div className="lg:col-span-1">
                                        <AdminCalendar
                                            lang={lang}
                                            performances={performances}
                                            setNewPerfDate={setNewPerfDate}
                                            setNewPerfDateISO={setNewPerfDateISO}
                                        />
                                    </div>

                                    {/* Right: The Form */}
                                    <div className="lg:col-span-2 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <input type="text" value={newPerfTitle} onChange={(e) => { setNewPerfTitle(e.target.value); if (e.target.value.trim()) setErrorsPerf(prev => ({ ...prev, title: '' })); }} placeholder="Título Concierto" className={`w-full bg-maestro-dark border p-3 text-white focus:border-maestro-gold outline-none ${errorsPerf.title ? 'border-red-500' : 'border-white/10'}`} />
                                                {errorsPerf.title && <p className="text-red-400 text-xs mt-1">{errorsPerf.title}</p>}
                                            </div>
                                            <div>
                                                <input type="text" value={newPerfDate} onChange={(e) => { setNewPerfDate(e.target.value); if (e.target.value.trim()) setErrorsPerf(prev => ({ ...prev, date: '' })); }} placeholder="Fecha (DD MMM YYYY)" className={`w-full bg-maestro-dark border p-3 text-white focus:border-maestro-gold outline-none ${errorsPerf.date ? 'border-red-500' : 'border-white/10'}`} />
                                                {errorsPerf.date && <p className="text-red-400 text-xs mt-1">{errorsPerf.date}</p>}
                                                {errorsPerf.dateISO && <p className="text-red-400 text-xs mt-1">{errorsPerf.dateISO}</p>}
                                            </div>
                                        </div>
                                        <div className="bg-maestro-dark border border-white/10 p-4">
                                            <label className="block text-[10px] uppercase text-maestro-light/50 mb-3 tracking-widest font-bold">Imágenes del Evento (Información del sitio)</label>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <label className="flex-grow bg-white/5 border border-dashed border-white/20 p-4 text-maestro-light hover:text-maestro-gold hover:border-maestro-gold/50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all group">
                                                    <UploadCloud size={24} className="group-hover:scale-110 transition-transform" />
                                                    <span className="text-xs uppercase tracking-widest font-bold">Subir Imagen desde Dispositivo</span>
                                                    <input type="file" accept="image/*" onChange={handlePerfImageUpload} className="hidden" />
                                                </label>
                                            </div>
                                            {compressing && (
                                                <div className="flex items-center gap-3 text-maestro-gold text-xs animate-pulse bg-maestro-gold/10 p-2 border border-maestro-gold/20 mb-4">
                                                    <ImageIcon size={14} />
                                                    <span>Optimizando imagen...</span>
                                                </div>
                                            )}
                                            {newPerfImages.length > 0 && (
                                                <div className="flex flex-wrap gap-3 p-2 bg-black/20 rounded-lg">
                                                    {newPerfImages.map((img, idx) => (
                                                        <div key={idx} className="relative w-24 h-24 group rounded overflow-hidden border border-white/10">
                                                            <img src={img} alt="preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <button onClick={() => removePerfImage(idx)} className="bg-red-500 text-white rounded-full p-2 hover:bg-red-400 transition-colors shadow-lg">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <input type="text" value={newPerfLoc} onChange={(e) => { setNewPerfLoc(e.target.value); if (e.target.value.trim()) setErrorsPerf(prev => ({ ...prev, location: '' })); }} placeholder="Ubicación" className={`w-full bg-maestro-dark border p-3 text-white focus:border-maestro-gold outline-none ${errorsPerf.location ? 'border-red-500' : 'border-white/10'}`} />
                                                {errorsPerf.location && <p className="text-red-400 text-xs mt-1">{errorsPerf.location}</p>}
                                            </div>
                                            <div>
                                                <input type="text" value={newPerfRole} onChange={(e) => { setNewPerfRole(e.target.value); if (e.target.value.trim()) setErrorsPerf(prev => ({ ...prev, role: '' })); }} placeholder="Rol" className={`w-full bg-maestro-dark border p-3 text-white focus:border-maestro-gold outline-none ${errorsPerf.role ? 'border-red-500' : 'border-white/10'}`} />
                                                {errorsPerf.role && <p className="text-red-400 text-xs mt-1">{errorsPerf.role}</p>}
                                            </div>
                                        </div>
                                        <RichTextEditor
                                            value={newPerfDesc}
                                            onChange={setNewPerfDesc}
                                            placeholder="Detalles del programa musical..."
                                            minHeight="150px"
                                        />
                                        {translating && (
                                            <div className="flex items-center gap-3 text-maestro-gold text-sm animate-pulse mb-4">
                                                <Database size={16} className="animate-spin" />
                                                <span>Traduciendo evento...</span>
                                            </div>
                                        )}
                                        <button disabled={translating || loading} onClick={handleSavePerformance} className={`w-full md:w-auto px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors ${(translating || loading) ? 'bg-gray-600 cursor-not-allowed' : (editingId ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-maestro-gold hover:bg-white text-maestro-dark')}`}>
                                            {translating ? 'Traduciendo...' : (loading ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Programar'))}
                                        </button>
                                        {Object.values(errorsPerf).some(Boolean) && (
                                            <p className="text-red-400 text-xs flex items-center gap-1">⚠ Completa los campos obligatorios antes de guardar.</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-maestro-gold uppercase tracking-widest text-xs font-bold mb-4 opacity-70">Listado de Actuaciones</h4>
                                    {performances.map(perf => (
                                        <div key={perf.id} className={`flex justify-between items-center p-4 border transition-all ${editingId === perf.id ? 'bg-maestro-gold/10 border-maestro-gold' : 'bg-maestro-dark border-white/5 hover:border-maestro-gold/30'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-maestro-gold/10 rounded flex items-center justify-center border border-maestro-gold/20">
                                                    <Calendar size={16} className="text-maestro-gold" />
                                                </div>
                                                <div>
                                                    <h4 className="text-maestro-light font-bold text-sm">{(typeof perf.title === 'object' ? perf.title?.es : perf.title) || ''}</h4>
                                                    <span className="text-[10px] uppercase tracking-widest text-maestro-light/40">{(typeof perf.date === 'object' ? perf.date?.es : perf.date) || ''} | {(typeof perf.location === 'object' ? perf.location?.es : perf.location) || ''}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => startEditPerformance(perf)} className="text-maestro-light/30 hover:text-blue-400 p-2 transition-colors"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete('performances', perf.id)} className="text-maestro-light/30 hover:text-red-500 p-2 transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>
                        )}

                        {/* 7. MESSAGES MANAGEMENT */}
                        {activeTab === 'messages' && (
                            <FadeIn>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-serif text-maestro-light flex items-center gap-2">
                                        <Mail className="text-maestro-gold" size={20} />
                                        {translations[lang].admin.messagesTitle}
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {messages.length > 0 ? (
                                        [...messages].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(msg => (
                                            <div key={msg.id} className={`p-6 border transition-all bg-maestro-dark border-white/5 hover:border-maestro-gold/30 ${!msg.read ? 'border-l-4 border-l-maestro-gold' : ''}`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="text-maestro-light font-bold text-lg">{msg.name}</h4>
                                                        <p className="text-maestro-gold text-sm">{msg.email}</p>
                                                        <span className="text-[10px] uppercase tracking-widest text-maestro-light/40">
                                                            {new Date(msg.date).toLocaleString(lang === 'ru' ? 'ru-RU' : (lang === 'en' ? 'en-US' : 'es-ES'))}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {!msg.read && (
                                                            <button
                                                                onClick={() => updateItem('messages', msg.id, { read: true })}
                                                                className="text-maestro-light/30 hover:text-maestro-gold p-2 transition-colors"
                                                                title={translations[lang].admin.markAsRead}
                                                            >
                                                                <Save size={18} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete('messages', msg.id)}
                                                            className="text-maestro-light/30 hover:text-red-500 p-2 transition-colors"
                                                            title={translations[lang].admin.deleteMessage}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="bg-black/20 p-4 rounded text-maestro-light/70 text-sm whitespace-pre-wrap">
                                                    {msg.message}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-black/20 border border-dashed border-white/5 rounded-sm">
                                            <p className="text-white/20 text-xs italic">{translations[lang].admin.noMessages}</p>
                                        </div>
                                    )}
                                </div>
                            </FadeIn>
                        )}

                        {/* 6. GALLERY MANAGEMENT */}
                        {activeTab === 'gallery' && (
                            <FadeIn>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-serif text-maestro-light flex items-center gap-2">
                                        {editingId ? <Edit className="text-maestro-gold" size={20} /> : <PlusCircle className="text-maestro-gold" size={20} />}
                                        {editingId ? 'Editar Galería' : 'Añadir a Galería'}
                                    </h3>
                                    {editingId && <button onClick={resetForms} className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300"><RotateCcw size={12} /> Cancelar Edición</button>}
                                </div>
                                <div className="space-y-4 mb-12 border-b border-white/10 pb-12">
                                    <div className="flex gap-4 mb-4">
                                        <button
                                            onClick={() => setNewGalType('image')}
                                            className={`flex-1 p-3 text-xs uppercase font-bold border flex justify-center items-center gap-2 ${newGalType === 'image' ? 'bg-maestro-gold text-black border-maestro-gold' : 'border-white/10 text-white/50 hover:bg-white/5'}`}
                                        >
                                            <ImageIcon size={16} /> Foto
                                        </button>
                                        <button
                                            onClick={() => setNewGalType('video')}
                                            className={`flex-1 p-3 text-xs uppercase font-bold border flex justify-center items-center gap-2 ${newGalType === 'video' ? 'bg-maestro-gold text-black border-maestro-gold' : 'border-white/10 text-white/50 hover:bg-white/5'}`}
                                        >
                                            <Video size={16} /> Video
                                        </button>
                                        <button
                                            onClick={() => setNewGalType('audio')}
                                            className={`flex-1 p-3 text-xs uppercase font-bold border flex justify-center items-center gap-2 ${newGalType === 'audio' ? 'bg-maestro-gold text-black border-maestro-gold' : 'border-white/10 text-white/50 hover:bg-white/5'}`}
                                        >
                                            <Music size={16} /> Audio
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex gap-2">
                                            {newGalType === 'image' ? (
                                                <div className="flex-grow">
                                                    <label className={`flex items-center justify-center gap-2 cursor-pointer bg-maestro-dark border p-3 text-white/50 hover:text-white hover:border-maestro-gold transition-colors w-full ${errorsGal.src ? 'border-red-500' : 'border-white/10'}`}>
                                                        <UploadCloud size={20} />
                                                        <span className="text-sm">{newGalSrc ? 'Imagen Seleccionada (Click para cambiar)' : 'Subir Imagen desde Dispositivo'}</span>
                                                        <input type="file" accept="image/*" onChange={(e) => { handleFileUpload(e, setNewGalSrc, 'images/gallery/'); setErrorsGal(prev => ({ ...prev, src: '' })); }} className="hidden" />
                                                    </label>
                                                    {newGalSrc && <p className="text-[10px] text-maestro-gold mt-1 text-center">✓ Imagen cargada en memoria</p>}
                                                </div>
                                            ) : newGalType === 'video' ? (
                                                <input
                                                    type="text"
                                                    value={newGalSrc}
                                                    onChange={(e) => { setNewGalSrc(e.target.value); if (e.target.value.trim()) setErrorsGal(prev => ({ ...prev, src: '' })); }}
                                                    placeholder="Enlace de YouTube (ej: https://www.youtube.com/watch?v=...)"
                                                    className={`flex-grow bg-maestro-dark border p-3 text-white ${errorsGal.src ? 'border-red-500' : 'border-white/10'}`}
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={newGalSrc}
                                                    onChange={(e) => { setNewGalSrc(e.target.value); if (e.target.value.trim()) setErrorsGal(prev => ({ ...prev, src: '' })); }}
                                                    placeholder="Enlace de SoundCloud (ej: https://soundcloud.com/...)"
                                                    className={`flex-grow bg-maestro-dark border p-3 text-white ${errorsGal.src ? 'border-red-500' : 'border-white/10'}`}
                                                />
                                            )}
                                        </div>
                                        {errorsGal.src && <p className="text-red-400 text-xs">{errorsGal.src}</p>}
                                    </div>

                                    {newGalType === 'audio' && newGalSrc && (
                                        <div className="mt-4 p-4 bg-black/20 border border-white/5 rounded-sm">
                                            <p className="text-[10px] uppercase text-maestro-gold mb-2 tracking-widest font-bold">Previsualización de Audio:</p>
                                            <div className="w-full h-[166px] bg-black/40 overflow-hidden rounded-sm">
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    scrolling="no"
                                                    frameBorder="no"
                                                    allow="autoplay"
                                                    src={getSoundCloudEmbedUrl(newGalSrc)}
                                                ></iframe>
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={newGalCat}
                                                    onChange={(e) => { setNewGalCat(e.target.value); if (e.target.value.trim()) setErrorsGal(prev => ({ ...prev, category: '' })); }}
                                                    placeholder="Título (ej: Sinfonía No. 5)"
                                                    className={`w-full bg-maestro-dark border p-3 text-white ${errorsGal.category ? 'border-red-500' : 'border-white/10'}`}
                                                />
                                                {errorsGal.category && <p className="text-red-400 text-xs mt-1">{errorsGal.category}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={newGalSubCat}
                                                    onChange={(e) => setNewGalSubCat(e.target.value)}
                                                    placeholder="Categoría (ej: Retratos, Conciertos, Director)"
                                                    className="w-full bg-maestro-dark border border-white/10 p-3 text-white"
                                                />
                                                {/* Sugerencias de categorías existentes */}
                                                <div className="flex flex-wrap gap-2">
                                                    {Array.from(new Set(gallery
                                                        .filter(item => item.type === newGalType && item.subCategory)
                                                        .map(item => (typeof item.subCategory === 'object' ? item.subCategory?.es : item.subCategory) || '')
                                                    )).map((cat, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => setNewGalSubCat(cat || '')}
                                                            className={`text-[10px] px-2 py-1 border rounded transition-all ${newGalSubCat === cat ? 'bg-maestro-gold text-maestro-dark border-maestro-gold' : 'border-white/10 text-white/40 hover:text-white hover:border-white/30'}`}
                                                        >
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                value={newGalAuthor}
                                                onChange={(e) => setNewGalAuthor(e.target.value)}
                                                placeholder="Autor / Orquesta (ej: Orquesta Sinfónica de Guayaquil)"
                                                className="w-full bg-maestro-dark border border-white/10 p-3 text-white"
                                            />
                                        </div>
                                        <textarea
                                            value={newGalCap}
                                            onChange={(e) => setNewGalCap(e.target.value)}
                                            placeholder="Descripción del elemento"
                                            rows={3}
                                            className="w-full bg-maestro-dark border border-white/10 p-3 text-white resize-none"
                                        />
                                    </div>
                                    {translating && (
                                        <div className="flex items-center gap-3 text-maestro-gold text-sm animate-pulse mb-4">
                                            <Database size={16} className="animate-spin" />
                                            <span>Traduciendo descripción...</span>
                                        </div>
                                    )}
                                    <button disabled={translating || loading} onClick={handleSaveGallery} className={`w-full md:w-auto px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors ${(translating || loading) ? 'bg-gray-600 cursor-not-allowed' : (editingId ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-maestro-gold hover:bg-white text-maestro-dark')}`}>
                                        {translating ? 'Traduciendo...' : (loading ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Añadir'))}
                                    </button>
                                    {Object.values(errorsGal).some(Boolean) && (
                                        <p className="text-red-400 text-xs flex items-center gap-1">⚠ Completa los campos obligatorios antes de guardar.</p>
                                    )}
                                </div>

                                {/* Gallery Filter Tabs */}
                                <div className="flex gap-4 mb-6 border-b border-white/5 pb-4">
                                    <button
                                        onClick={() => { setAdminGalleryTab('image'); setAdminGalleryPage(1); }}
                                        className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${adminGalleryTab === 'image' ? 'text-maestro-gold border-b border-maestro-gold' : 'text-white/40 hover:text-white'}`}
                                    >
                                        <ImageIcon size={14} /> Fotos ({gallery.filter(i => i.type === 'image').length})
                                    </button>
                                    <button
                                        onClick={() => { setAdminGalleryTab('video'); setAdminGalleryPage(1); }}
                                        className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${adminGalleryTab === 'video' ? 'text-maestro-gold border-b border-maestro-gold' : 'text-white/40 hover:text-white'}`}
                                    >
                                        <Video size={14} /> Videos ({gallery.filter(i => i.type === 'video').length})
                                    </button>
                                    <button
                                        onClick={() => { setAdminGalleryTab('audio'); setAdminGalleryPage(1); }}
                                        className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${adminGalleryTab === 'audio' ? 'text-maestro-gold border-b border-maestro-gold' : 'text-white/40 hover:text-white'}`}
                                    >
                                        <Music size={14} /> Audio ({gallery.filter(i => i.type === 'audio').length})
                                    </button>
                                </div>

                                {/* Gallery Search & Info */}
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                                    <div className="relative w-full md:w-64">
                                        <input
                                            type="text"
                                            value={adminGallerySearch}
                                            onChange={(e) => { setAdminGallerySearch(e.target.value); setAdminGalleryPage(1); }}
                                            placeholder="Buscar en esta categoría..."
                                            className="w-full bg-maestro-dark border border-white/10 p-2 pl-8 text-[10px] text-white focus:border-maestro-gold outline-none"
                                        />
                                        <PlusCircle size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30" />
                                    </div>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest">
                                        Total: {gallery.filter(item => item.type === adminGalleryTab).length} elementos
                                    </p>
                                </div>

                                {/* Gallery Grid Preview with Pagination & Search */}
                                {(() => {
                                    const filtered = gallery
                                        .filter(item => item.type === adminGalleryTab)
                                        .filter(item => {
                                            if (!adminGallerySearch) return true;
                                            const search = adminGallerySearch.toLowerCase();
                                            const caption = (typeof item.caption === 'object' ? item.caption?.es : (item.caption || '')).toLowerCase();
                                            const author = (typeof item.author === 'object' ? item.author?.es : (item.author || '')).toLowerCase();
                                            const category = (typeof item.category === 'object' ? item.category?.es : (item.category || '')).toLowerCase();
                                            return caption.includes(search) || author.includes(search) || category.includes(search);
                                        });

                                    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE_ADMIN);
                                    const paginated = filtered.slice((adminGalleryPage - 1) * ITEMS_PER_PAGE_ADMIN, adminGalleryPage * ITEMS_PER_PAGE_ADMIN);

                                    if (filtered.length === 0) {
                                        return (
                                            <div className="text-center py-12 bg-black/20 border border-dashed border-white/5 rounded-sm">
                                                <p className="text-white/20 text-xs italic">No se encontraron elementos</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {paginated.map(item => (
                                                    <div key={item.id} className={`relative aspect-video group border ${editingId === item.id ? 'border-maestro-gold' : 'border-white/5'}`}>
                                                        <img
                                                            src={
                                                                item.type === 'audio'
                                                                    ? (item.thumbnail || '/images/audio-section.webp')
                                                                    : (item.type === 'video' ? (item.thumbnail || getVideoThumbnailUrl(item.src)) : item.src)
                                                            }
                                                            alt="Gallery"
                                                            className="w-full h-full object-cover"
                                                        />

                                                        {/* Type Badge */}
                                                        <div className={`absolute top-2 left-2 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-sm ${item.type === 'video' ? 'bg-red-600 text-white' : item.type === 'audio' ? 'bg-blue-600 text-white' : 'bg-maestro-gold text-maestro-dark'}`}>
                                                            {item.type === 'video' ? 'Video' : item.type === 'audio' ? 'Audio' : 'Foto'}
                                                        </div>

                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <button onClick={() => startEditGallery(item)} className="p-2 bg-maestro-gold text-maestro-dark rounded-full"><Edit size={16} /></button>
                                                            <button onClick={() => handleDelete('gallery', item.id)} className="p-2 bg-red-500 text-white rounded-full"><Trash2 size={16} /></button>
                                                        </div>
                                                        <div className="absolute bottom-0 left-0 w-full bg-black/80 p-2 text-[10px] text-white/70 truncate">
                                                            {(typeof item.caption === 'object' ? item.caption?.es : item.caption) || ''}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Pagination Controls */}
                                            {totalPages > 1 && (
                                                <div className="mt-8 flex justify-center items-center gap-4">
                                                    <button
                                                        disabled={adminGalleryPage === 1}
                                                        onClick={() => setAdminGalleryPage(prev => Math.max(1, prev - 1))}
                                                        className="p-2 text-white/40 hover:text-maestro-gold disabled:opacity-20 transition-colors"
                                                    >
                                                        <ChevronDown size={20} className="rotate-90" />
                                                    </button>
                                                    <span className="text-[10px] uppercase tracking-widest font-bold text-maestro-gold">
                                                        Página {adminGalleryPage} de {totalPages}
                                                    </span>
                                                    <button
                                                        disabled={adminGalleryPage === totalPages}
                                                        onClick={() => setAdminGalleryPage(prev => Math.min(totalPages, prev + 1))}
                                                        className="p-2 text-white/40 hover:text-maestro-gold disabled:opacity-20 transition-colors"
                                                    >
                                                        <ChevronDown size={20} className="-rotate-90" />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </FadeIn>
                        )}

                        {/* 8. PRESS MANAGEMENT */}
                        {activeTab === 'press' && (
                            <FadeIn>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-serif text-maestro-light flex items-center gap-2">
                                        {editingId ? <Edit className="text-maestro-gold" size={20} /> : <PlusCircle className="text-maestro-gold" size={20} />}
                                        {editingId ? translations[lang].admin.editPress : translations[lang].admin.addPress}
                                    </h3>
                                    {editingId && <button onClick={resetForms} className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300"><RotateCcw size={12} /> Cancelar Edición</button>}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 border-b border-white/10 pb-12">
                                    {/* Left: Interactive Calendar */}
                                    <div className="lg:col-span-1">
                                        <PressCalendar
                                            lang={lang}
                                            press={press}
                                            setNewPressDate={setNewPressDate}
                                            setNewPressDateISO={setNewPressDateISO}
                                        />
                                    </div>

                                    {/* Right: The Form */}
                                    <div className="lg:col-span-2 space-y-4">
                                        <div>
                                            <input
                                                type="text"
                                                value={newPressTitle}
                                                onChange={(e) => { setNewPressTitle(e.target.value); if (e.target.value.trim()) setErrorsPressForm(prev => ({ ...prev, title: '' })); }}
                                                placeholder="Título del artículo..."
                                                className={`w-full bg-maestro-dark border p-3 text-white focus:border-maestro-gold outline-none ${errorsPress.title ? 'border-red-500' : 'border-white/10'}`}
                                            />
                                            {errorsPress.title && <p className="text-red-400 text-xs mt-1">{errorsPress.title}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={newPressSource}
                                                    onChange={(e) => { setNewPressSource(e.target.value); if (e.target.value.trim()) setErrorsPressForm(prev => ({ ...prev, source: '' })); }}
                                                    placeholder="Fuente (ej: El Universo, BBC)"
                                                    className={`w-full bg-maestro-dark border p-3 text-white focus:border-maestro-gold outline-none ${errorsPress.source ? 'border-red-500' : 'border-white/10'}`}
                                                />
                                                {errorsPress.source && <p className="text-red-400 text-xs mt-1">{errorsPress.source}</p>}
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={newPressDate}
                                                    onChange={(e) => { setNewPressDate(e.target.value); if (e.target.value.trim()) setErrorsPressForm(prev => ({ ...prev, date: '' })); }}
                                                    placeholder="Fecha (ej: 15 May 2023)"
                                                    className={`w-full bg-maestro-dark border p-3 text-white focus:border-maestro-gold outline-none ${errorsPress.date ? 'border-red-500' : 'border-white/10'}`}
                                                />
                                                {errorsPress.date && <p className="text-red-400 text-xs mt-1">{errorsPress.date}</p>}
                                                {errorsPress.dateISO && <p className="text-red-400 text-xs mt-1">{errorsPress.dateISO}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={newPressCategory}
                                                    onChange={(e) => setNewPressCategory(e.target.value)}
                                                    placeholder="Categoría (ej: Entrevista, Crítica)"
                                                    className="w-full bg-maestro-dark border border-white/10 p-3 text-white focus:border-maestro-gold outline-none"
                                                />
                                                {/* Sugerencias de categorías existentes */}
                                                <div className="flex flex-wrap gap-2">
                                                    {Array.from(new Set(press
                                                        .map(item => (typeof item.category === 'object' ? item.category?.es : item.category) || '')
                                                    )).filter(Boolean).map((cat, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => setNewPressCategory(cat || '')}
                                                            className={`text-[10px] px-2 py-1 border rounded transition-all ${newPressCategory === cat ? 'bg-maestro-gold text-maestro-dark border-maestro-gold' : 'border-white/10 text-white/40 hover:text-white hover:border-white/30'}`}
                                                        >
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                value={newPressUrl}
                                                onChange={(e) => setNewPressUrl(e.target.value)}
                                                placeholder="Enlace al artículo (URL completa)"
                                                className="w-full bg-maestro-dark border border-white/10 p-3 text-white focus:border-maestro-gold outline-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-maestro-gold uppercase tracking-[0.2em]">Imagen del Artículo</label>
                                            <div className="flex gap-4 items-start">
                                                <label className="flex-grow bg-white/5 border border-dashed border-white/20 p-6 text-maestro-light hover:text-maestro-gold hover:border-maestro-gold/50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all group rounded-sm min-h-[120px]">
                                                    <UploadCloud size={24} className="group-hover:scale-110 transition-transform" />
                                                    <span className="text-xs uppercase tracking-widest font-bold">Subir Imagen desde Dispositivo</span>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handleFileUpload(e, setNewPressImage, 'images/press/')}
                                                        className="hidden"
                                                        accept="image/*"
                                                    />
                                                </label>

                                                {newPressImage && (
                                                    <div className="relative w-48 aspect-video border border-maestro-gold/50 bg-black/20 overflow-hidden rounded-sm group shadow-2xl">
                                                        <img src={newPressImage} alt="Press" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button
                                                                onClick={() => setNewPressImage('')}
                                                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-400 transition-colors shadow-lg"
                                                                title="Eliminar imagen"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-maestro-gold uppercase tracking-[0.2em]">Resumen o extracto del artículo</label>
                                            <RichTextEditor
                                                value={newPressExcerpt}
                                                onChange={setNewPressExcerpt}
                                                onImageUpload={handlePressEditorImageUpload}
                                                placeholder="Escribe el resumen o extracto aquí..."
                                                minHeight="150px"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-maestro-gold uppercase tracking-[0.2em]">Contenido completo del artículo</label>
                                            <RichTextEditor
                                                value={newPressContent}
                                                onChange={setNewPressContent}
                                                onImageUpload={handlePressEditorImageUpload}
                                                placeholder="Escribe el contenido completo del artículo aquí..."
                                                minHeight="300px"
                                            />
                                        </div>

                                        {translating && (
                                            <div className="flex items-center gap-3 text-maestro-gold text-sm animate-pulse bg-maestro-gold/10 p-3 border border-maestro-gold/20">
                                                <Database size={16} className="animate-spin" />
                                                <span>Traduciendo artículo...</span>
                                            </div>
                                        )}

                                        <button
                                            disabled={translating || loading}
                                            onClick={handleSavePress}
                                            className={`w-full md:w-auto px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors ${(translating || loading) ? 'bg-gray-600 cursor-not-allowed' : (editingId ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-maestro-gold hover:bg-white text-maestro-dark')}`}
                                        >
                                            {translating ? 'Traduciendo...' : (loading ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Añadir'))}
                                        </button>
                                        {Object.values(errorsPress).some(Boolean) && (
                                            <p className="text-red-400 text-xs flex items-center gap-1">⚠ Completa los campos obligatorios antes de guardar.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-maestro-gold uppercase tracking-widest text-xs font-bold opacity-70">Listado de Prensa</h4>
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Total: {press.length} artículos</p>
                                    </div>

                                    {(() => {
                                        const totalPages = Math.ceil(press.length / ITEMS_PER_PAGE_ADMIN);
                                        const paginatedPress = press.slice((adminPressPage - 1) * ITEMS_PER_PAGE_ADMIN, adminPressPage * ITEMS_PER_PAGE_ADMIN);

                                        if (press.length === 0) {
                                            return (
                                                <div className="text-center py-12 bg-black/20 border border-dashed border-white/5 rounded-sm">
                                                    <p className="text-white/20 text-xs italic">No hay artículos de prensa registrados</p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <>
                                                <div className="space-y-4">
                                                    {paginatedPress.map(item => (
                                                        <div key={item.id} className={`flex justify-between items-center p-4 border transition-all ${editingId === item.id ? 'bg-maestro-gold/10 border-maestro-gold' : 'bg-maestro-dark border-white/5 hover:border-maestro-gold/30'}`}>
                                                            <div className="flex items-center gap-4">
                                                                {item.image ? (
                                                                    <div className="w-16 h-10 border border-white/10 overflow-hidden rounded-sm">
                                                                        <img src={item.image} alt="Thumbnail" className="w-full h-full object-cover" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-16 h-10 bg-maestro-gold/10 rounded flex items-center justify-center border border-maestro-gold/20">
                                                                        <FileText size={16} className="text-maestro-gold" />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <h4 className="text-maestro-light font-bold text-sm">{(typeof item.title === 'object' ? item.title?.es : item.title) || ''}</h4>
                                                                    <span className="text-[10px] uppercase tracking-widest text-maestro-light/40">{item.source} | {item.date}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => startEditPress(item)} className="text-maestro-light/30 hover:text-blue-400 p-2 transition-colors"><Edit size={18} /></button>
                                                                <button onClick={() => handleDelete('press', item.id)} className="text-maestro-light/30 hover:text-red-500 p-2 transition-colors"><Trash2 size={18} /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Press Pagination Controls */}
                                                {totalPages > 1 && (
                                                    <div className="mt-8 flex justify-center items-center gap-4 border-t border-white/5 pt-6">
                                                        <button
                                                            disabled={adminPressPage === 1}
                                                            onClick={() => { setAdminPressPage(prev => Math.max(1, prev - 1)); }}
                                                            className="p-2 text-white/40 hover:text-maestro-gold disabled:opacity-20 transition-colors"
                                                        >
                                                            <ChevronDown size={20} className="rotate-90" />
                                                        </button>
                                                        <span className="text-[10px] uppercase tracking-widest font-bold text-maestro-gold">
                                                            Página {adminPressPage} de {totalPages}
                                                        </span>
                                                        <button
                                                            disabled={adminPressPage === totalPages}
                                                            onClick={() => { setAdminPressPage(prev => Math.min(totalPages, prev + 1)); }}
                                                            className="p-2 text-white/40 hover:text-maestro-gold disabled:opacity-20 transition-colors"
                                                        >
                                                            <ChevronDown size={20} className="-rotate-90" />
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </FadeIn>
                        )}

                        {/* 9. ABOUT MANAGEMENT */}
                        {activeTab === 'about' && (
                            <FadeIn>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-serif text-maestro-light flex items-center gap-2">
                                        <Briefcase className="text-maestro-gold" size={20} />
                                        Configuración "Sobre Mí"
                                    </h3>
                                    <div className="flex flex-col items-end gap-2">
                                        <button disabled={translating || loading} onClick={handleSaveAbout} className={`px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors ${(translating || loading) ? 'bg-gray-600 cursor-not-allowed' : 'bg-maestro-gold hover:bg-white text-maestro-dark'}`}>
                                            {translating ? 'Traduciendo...' : (loading ? 'Guardando...' : 'Guardar Todo')}
                                        </button>
                                        {Object.values(errorsAbout).some(Boolean) && (
                                            <p className="text-red-400 text-xs flex items-center gap-1">⚠ Completa los campos obligatorios antes de guardar.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-8 mb-12">
                                    {/* Profile Image */}
                                    <div className="bg-maestro-dark border border-white/10 p-6 rounded-sm">
                                        <h4 className="text-maestro-gold text-sm font-bold uppercase tracking-widest mb-4">Imagen de Perfil</h4>
                                        <div className="flex gap-6 items-start">
                                            <div className="w-32 aspect-[3/4] bg-black/20 border border-white/10 overflow-hidden">
                                                {aboutProfileImage ? (
                                                    <img src={aboutProfileImage} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">Sin Imagen</div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <label className="block w-full bg-white/5 border border-dashed border-white/20 p-4 text-maestro-light hover:text-maestro-gold hover:border-maestro-gold/50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all">
                                                    <UploadCloud size={24} />
                                                    <span className="text-xs uppercase tracking-widest font-bold">Cambiar Foto</span>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handleFileUpload(e, setAboutProfileImage, 'images/about/')}
                                                        className="hidden"
                                                        accept="image/*"
                                                    />
                                                </label>
                                                {compressing && <p className="text-xs text-maestro-gold mt-2 animate-pulse">Optimizando imagen...</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Main Info */}
                                    <div className="bg-maestro-dark border border-white/10 p-6 rounded-sm space-y-4">
                                        <h4 className="text-maestro-gold text-sm font-bold uppercase tracking-widest mb-2">Información Principal</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase text-white/50">Título (Pequeño)</label>
                                                <input
                                                    type="text"
                                                    value={aboutBioTitle}
                                                    onChange={(e) => { setAboutBioTitle(e.target.value); if (e.target.value.trim()) setErrorsAbout(prev => ({ ...prev, bioTitle: '' })); }}
                                                    placeholder="Ej: DIRECTOR DE ORQUESTA"
                                                    className={`w-full bg-black/20 border p-3 text-white focus:border-maestro-gold outline-none ${errorsAbout.bioTitle ? 'border-red-500' : 'border-white/10'}`}
                                                />
                                                {errorsAbout.bioTitle && <p className="text-red-400 text-xs mt-1">{errorsAbout.bioTitle}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase text-white/50">Encabezado (Grande)</label>
                                                <input
                                                    type="text"
                                                    value={aboutBioHeading}
                                                    onChange={(e) => { setAboutBioHeading(e.target.value); if (e.target.value.trim()) setErrorsAbout(prev => ({ ...prev, bioHeading: '' })); }}
                                                    placeholder="Ej: Diego Carrión Granda"
                                                    className={`w-full bg-black/20 border p-3 text-white focus:border-maestro-gold outline-none ${errorsAbout.bioHeading ? 'border-red-500' : 'border-white/10'}`}
                                                />
                                                {errorsAbout.bioHeading && <p className="text-red-400 text-xs mt-1">{errorsAbout.bioHeading}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sections */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-maestro-gold text-sm font-bold uppercase tracking-widest">Biografía (Secciones)</h4>
                                            <div className="flex gap-2">
                                                <button onClick={() => addAboutSection('text')} className="text-[10px] uppercase font-bold bg-white/10 hover:bg-white/20 px-3 py-1 flex items-center gap-1 transition-colors">
                                                    <PlusCircle size={12} /> Texto
                                                </button>
                                                <button onClick={() => addAboutSection('image')} className="text-[10px] uppercase font-bold bg-white/10 hover:bg-white/20 px-3 py-1 flex items-center gap-1 transition-colors">
                                                    <ImageIcon size={12} /> Imagen
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {aboutSections.map((section, idx) => (
                                                <div key={section.id} className="bg-maestro-dark border border-white/10 p-4 relative group">
                                                    <div className="absolute right-2 top-2 flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity z-10">
                                                        <button onClick={() => moveAboutSection(idx, 'up')} disabled={idx === 0} className="p-1 hover:text-maestro-gold disabled:opacity-20 bg-black/40 rounded"><ArrowRight size={14} className="-rotate-90" /></button>
                                                        <button onClick={() => moveAboutSection(idx, 'down')} disabled={idx === aboutSections.length - 1} className="p-1 hover:text-maestro-gold disabled:opacity-20 bg-black/40 rounded"><ArrowRight size={14} className="rotate-90" /></button>
                                                        <button onClick={() => removeAboutSection(idx)} className="p-1 hover:text-red-500 text-red-500/50 bg-black/40 rounded"><Trash2 size={14} /></button>
                                                    </div>

                                                    <div className="">
                                                        {section.type === 'text' ? (
                                                            <div>
                                                                <span className="text-[10px] uppercase text-white/30 block mb-2">Bloque de Texto</span>
                                                                <RichTextEditor
                                                                    value={typeof section.content === 'object' ? (section.content as any).es || '' : section.content || ''}
                                                                    onChange={(val) => updateAboutSection(section.id, 'content', val)}
                                                                    onImageUpload={handleAboutEditorImageUpload}
                                                                    minHeight="150px"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <span className="text-[10px] uppercase text-white/30 block mb-2">Bloque de Imagen</span>
                                                                <div className="flex gap-4 items-center">
                                                                    <div className="w-24 aspect-video bg-black/20 border border-white/10 overflow-hidden">
                                                                        {section.image ? (
                                                                            <img src={section.image} alt="Section" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="flex items-center justify-center w-full h-full text-[9px]">Sin Img</div>
                                                                        )}
                                                                    </div>
                                                                    <label className="px-4 py-2 bg-white/5 border border-white/10 hover:border-maestro-gold cursor-pointer text-xs uppercase transition-colors">
                                                                        Subir Imagen
                                                                        <input
                                                                            type="file"
                                                                            onChange={(e) => handleFileUpload(e, (url) => updateAboutSection(section.id, 'image', url), `images/about/${section.id}`)}
                                                                            className="hidden"
                                                                            accept="image/*"
                                                                        />
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {aboutSections.length === 0 && (
                                                <div className="text-center py-8 border border-dashed border-white/10 text-white/30 text-xs italic">
                                                    No hay secciones. Añade texto o imágenes para construir la biografía.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        )}
                    </div>
                </div>
            </div >
        </section >
    );
};

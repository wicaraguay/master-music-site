import React, { useState } from 'react';
import { FadeIn } from './FadeIn';
import {
    Lock, LogOut, FileText, Music, UploadCloud, Trash2, PlusCircle,
    LayoutDashboard, Image as ImageIcon, X, Briefcase, BookOpen, Calendar, MapPin, Video, PlayCircle, Edit, Save, RotateCcw, Database,
    ChevronDown, ArrowRight
} from 'lucide-react';
import { BlogPost, Resource, ExperienceItem, ResearchPaper, Performance, GalleryItem, Language } from '../types';
import { addItem, updateItem, deleteItem as deleteDbItem } from '../src/services/db';
import { signIn, logout } from '../src/services/auth';
import { uploadToStorage } from '../src/services/storage';
import { translateFields } from '../src/services/translationService';
import { RichTextEditor } from './RichTextEditor';
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '../src/utils/video';
import { getSoundCloudEmbedUrl } from '../src/utils/audio';
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
}

export const Admin: React.FC<AdminProps> = ({
    isAuthenticated, onLogin, userEmail, lang,
    posts, resources, experience, research, performances, gallery
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [compressing, setCompressing] = useState(false);

    type Tab = 'blog' | 'resources' | 'experience' | 'research' | 'performances' | 'gallery';
    const [activeTab, setActiveTab] = useState<Tab>('blog');

    // Track which item ID is being edited. Null means "Creating New".
    const [editingId, setEditingId] = useState<string | null>(null);

    // --- STATE FOR FORMS ---
    // Blog
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImages, setNewPostImages] = useState<string[]>([]);
    const [currentImageUrl, setCurrentImageUrl] = useState('');

    // Resources
    const [newResTitle, setNewResTitle] = useState('');
    const [newResDesc, setNewResDesc] = useState('');
    const [newResType, setNewResType] = useState<'score' | 'article' | 'audio'>('article');

    // Experience
    const [newExpYear, setNewExpYear] = useState('');
    const [newExpRole, setNewExpRole] = useState('');
    const [newExpInst, setNewExpInst] = useState('');
    const [newExpDesc, setNewExpDesc] = useState('');

    // Research
    const [newResPaperTitle, setNewResPaperTitle] = useState('');
    const [newResJournal, setNewResJournal] = useState('');
    const [newResYear, setNewResYear] = useState('');
    const [newResAbstract, setNewResAbstract] = useState('');

    // Performances
    const [newPerfDate, setNewPerfDate] = useState('');
    const [newPerfTitle, setNewPerfTitle] = useState('');
    const [newPerfLoc, setNewPerfLoc] = useState('');
    const [newPerfRole, setNewPerfRole] = useState('');
    const [newPerfDesc, setNewPerfDesc] = useState('');
    const [newPerfStatus, setNewPerfStatus] = useState<'upcoming' | 'past'>('upcoming');
    const [newPerfImages, setNewPerfImages] = useState<string[]>([]);

    // Gallery
    const [newGalType, setNewGalType] = useState<'image' | 'video' | 'audio'>('image');
    const [adminGalleryTab, setAdminGalleryTab] = useState<'image' | 'video' | 'audio'>('image');
    const [newGalSrc, setNewGalSrc] = useState('');
    const [newGalThumbnail, setNewGalThumbnail] = useState('');
    const [newGalCat, setNewGalCat] = useState('');
    const [newGalAuthor, setNewGalAuthor] = useState('');
    const [newGalCap, setNewGalCap] = useState('');

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
        setNewPostTitle(''); setNewPostContent(''); setNewPostImages([]); setCurrentImageUrl('');
        // Res
        setNewResTitle(''); setNewResDesc(''); setNewResType('article');
        // Exp
        setNewExpYear(''); setNewExpRole(''); setNewExpInst(''); setNewExpDesc('');
        // Research
        setNewResPaperTitle(''); setNewResJournal(''); setNewResYear(''); setNewResAbstract('');
        // Perf
        setNewPerfDate(''); setNewPerfTitle(''); setNewPerfLoc(''); setNewPerfRole(''); setNewPerfDesc(''); setNewPerfImages([]);
        // Gal
        setNewGalSrc(''); setNewGalThumbnail(''); setNewGalCat('');
        setNewGalAuthor('');
        setNewGalCap('');
    };

    const changeTab = (tab: Tab) => {
        resetForms();
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

            if (id) {
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
    const handleAddImageUrl = () => { if (currentImageUrl) { setNewPostImages([...newPostImages, currentImageUrl]); setCurrentImageUrl(''); } };
    const removeImage = (index: number) => { setNewPostImages(newPostImages.filter((_, i) => i !== index)); };

    const handleSavePost = async () => {
        if (!newPostTitle) return;
        try {
            setTranslating(true);
            // Limpiar HTML del contenido para el preview
            const cleanText = newPostContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
            const previewText = cleanText.substring(0, 160) + '...';

            const translations = await translateFields(
                { title: newPostTitle, content: newPostContent, preview: previewText },
                ['title', 'content', 'preview']
            );

            await saveToDb('posts', editingId,
                {
                    title: translations.title,
                    content: translations.content,
                    preview: translations.preview
                },
                { date: new Date().toLocaleDateString('es-ES').toUpperCase(), images: newPostImages }
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
        setNewResTitle(res.title?.es || res.title || '');
        setNewResDesc(res.description?.es || res.description || '');
        setNewResType(res.type);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- EXPERIENCE HANDLERS ---
    const handleSaveExperience = async () => {
        if (!newExpRole) return;
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
                { yearRaw: newExpYear } // Keep raw year for sorting if needed
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
        setNewExpYear(exp.year?.es || exp.year || '');
        setNewExpRole(exp.role?.es || exp.role || '');
        setNewExpInst(exp.institution?.es || exp.institution || '');
        setNewExpDesc(exp.description?.es || exp.description || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- RESEARCH HANDLERS ---
    const handleSaveResearch = async () => {
        if (!newResPaperTitle) return;
        try {
            setTranslating(true);
            const translations = await translateFields(
                { title: newResPaperTitle, abstract: newResAbstract },
                ['title', 'abstract']
            );

            await saveToDb('research', editingId,
                { title: translations.title, abstract: translations.abstract },
                { journal: newResJournal, year: newResYear }
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
        setNewResPaperTitle(res.title?.es || res.title || '');
        setNewResJournal(res.journal);
        setNewResYear(res.year);
        setNewResAbstract(res.abstract?.es || res.abstract || '');
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
        if (!newPerfTitle) return;
        try {
            setTranslating(true);
            const translations = await translateFields(
                { title: newPerfTitle, description: newPerfDesc, location: newPerfLoc, role: newPerfRole, date: newPerfDate },
                ['title', 'description', 'location', 'role', 'date']
            );

            await saveToDb('performances', editingId,
                {
                    title: translations.title,
                    description: translations.description,
                    location: translations.location,
                    role: translations.role,
                    date: translations.date
                },
                { status: newPerfStatus, images: newPerfImages }
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
        setNewPerfDate(perf.date?.es || perf.date || '');
        setNewPerfTitle(perf.title?.es || perf.title || '');
        setNewPerfLoc(perf.location?.es || perf.location || '');
        setNewPerfRole(perf.role?.es || perf.role || '');
        setNewPerfDesc(perf.description?.es || perf.description || '');
        setNewPerfStatus(perf.status);
        setNewPerfImages(perf.images || []);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };



    // --- GALLERY HANDLERS ---
    const handleSaveGallery = async () => {
        if (!newGalSrc) return;
        try {
            setTranslating(true);
            const translations = await translateFields(
                { caption: newGalCap, category: newGalCat, author: newGalAuthor },
                ['caption', 'category', 'author']
            );

            await saveToDb('gallery', editingId,
                { caption: translations.caption, category: translations.category, author: translations.author },
                {
                    type: newGalType,
                    src: newGalType === 'video' ? getYouTubeEmbedUrl(newGalSrc) : (newGalType === 'audio' ? getSoundCloudEmbedUrl(newGalSrc) : newGalSrc),
                    thumbnail: newGalType === 'video' ? (newGalThumbnail || getYouTubeThumbnailUrl(newGalSrc)) : newGalThumbnail
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
        setNewGalCat((item.category as any)?.es || item.category || '');
        setNewGalAuthor((item.author as any)?.es || item.author || '');
        setNewGalCap((item.caption as any)?.es || item.caption || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
    // --- PERFORMANCE CALENDAR HELPER ---
    const AdminCalendar = () => {
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
                const perfDate = new Date((perf.date as any)?.es || perf.date);
                return perfDate.getDate() === day && perfDate.getMonth() === currentMonth && perfDate.getFullYear() === currentYear;
            });
        };

        const onDateSelect = (day: number) => {
            const date = new Date(currentYear, currentMonth, day);
            const dayStr = date.getDate().toString().padStart(2, '0');
            const monthStr = date.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'short' }).replace('.', '');
            const yearStr = date.getFullYear();
            setNewPerfDate(`${dayStr} ${monthStr} ${yearStr}`);
        };

        return (
            <div className="bg-maestro-dark border border-white/10 p-6 rounded-xl shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-maestro-gold font-serif tracking-wide">{monthNames[currentMonth]} {currentYear}</h4>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentMonth(prev => prev === 0 ? 11 : prev - 1)} className="p-1 hover:text-maestro-gold transition-colors">
                            <ChevronDown size={18} className="rotate-90" />
                        </button>
                        <button onClick={() => setCurrentMonth(prev => prev === 11 ? 0 : prev + 1)} className="p-1 hover:text-maestro-gold transition-colors">
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
                            { id: 'resources', label: 'Recursos', icon: Music },
                            { id: 'experience', label: 'Experiencia', icon: Briefcase },
                            { id: 'research', label: 'Investigación', icon: BookOpen },
                            { id: 'performances', label: 'Eventos', icon: Calendar },
                            { id: 'gallery', label: 'Galería', icon: ImageIcon },
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
                                    <input type="text" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} placeholder="Título..." className="w-full bg-maestro-dark border border-white/10 p-3 text-white focus:border-maestro-gold outline-none" />

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
                                    <RichTextEditor
                                        value={newPostContent}
                                        onChange={setNewPostContent}
                                        placeholder="Contenido del artículo..."
                                        minHeight="300px"
                                    />
                                    <button disabled={translating || loading} onClick={handleSavePost} className={`w-full md:w-auto px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors ${(translating || loading) ? 'bg-gray-600 cursor-not-allowed' : (editingId ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-maestro-gold hover:bg-white text-maestro-dark')}`}>
                                        {translating ? 'Traduciendo...' : (loading ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Publicar'))}
                                    </button>
                                </div>
                                {/* List */}
                                <div className="space-y-4">
                                    {posts.map(post => (
                                        <div key={post.id} className={`flex justify-between items-center p-4 border transition-all ${editingId === post.id ? 'bg-maestro-gold/10 border-maestro-gold' : 'bg-maestro-dark border-white/5 hover:border-maestro-gold/30'}`}>
                                            <div><h4 className="text-maestro-light font-bold">{(post.title as any)?.es || post.title}</h4><span className="text-xs text-maestro-light/40">{post.date}</span></div>
                                            <div className="flex gap-2">
                                                <button onClick={() => startEditPost(post)} className="text-maestro-light/30 hover:text-blue-400 p-2"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete('posts', post.id)} className="text-maestro-light/30 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>
                        )}

                        {/* 2. RESOURCES MANAGEMENT */}
                        {activeTab === 'resources' && (
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
                                            <div><h4 className="text-maestro-light font-bold">{(res.title as any)?.es || res.title}</h4><span className="text-xs text-maestro-light/40">{res.type}</span></div>
                                            <div className="flex gap-2">
                                                <button onClick={() => startEditResource(res)} className="text-maestro-light/30 hover:text-blue-400 p-2"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete('resources', res.id)} className="text-maestro-light/30 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </FadeIn>
                        )}

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
                                <div className="space-y-4 mb-12 border-b border-white/10 pb-12">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" value={newExpYear} onChange={(e) => setNewExpYear(e.target.value)} placeholder="Año (ej: 2023 - Presente)" className="w-full bg-maestro-dark border border-white/10 p-3 text-white" />
                                        <input type="text" value={newExpRole} onChange={(e) => setNewExpRole(e.target.value)} placeholder="Rol (ej: Director)" className="w-full bg-maestro-dark border border-white/10 p-3 text-white" />
                                    </div>
                                    <input type="text" value={newExpInst} onChange={(e) => setNewExpInst(e.target.value)} placeholder="Institución" className="w-full bg-maestro-dark border border-white/10 p-3 text-white" />
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
                                </div>
                                <div className="space-y-4">
                                    {experience.map(exp => (
                                        <div key={exp.id} className={`flex justify-between items-center p-4 border transition-all ${editingId === exp.id ? 'bg-maestro-gold/10 border-maestro-gold' : 'bg-maestro-dark border-white/5 hover:border-maestro-gold/30'}`}>
                                            <div><h4 className="text-maestro-light font-bold">{(exp.role as any)?.es || exp.role}</h4><span className="text-xs text-maestro-light/40">{(exp.year as any)?.es || exp.year}</span></div>
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" value={newResPaperTitle} onChange={(e) => setNewResPaperTitle(e.target.value)} placeholder="Título Paper" className="w-full bg-maestro-dark border border-white/10 p-3 text-white" />
                                        <input type="text" value={newResYear} onChange={(e) => setNewResYear(e.target.value)} placeholder="Año" className="w-full bg-maestro-dark border border-white/10 p-3 text-white" />
                                    </div>
                                    <input type="text" value={newResJournal} onChange={(e) => setNewResJournal(e.target.value)} placeholder="Revista / Journal" className="w-full bg-maestro-dark border border-white/10 p-3 text-white" />
                                    <RichTextEditor
                                        value={newResAbstract}
                                        onChange={setNewResAbstract}
                                        placeholder="Abstract de la investigación..."
                                        minHeight="250px"
                                    />
                                    {translating && (
                                        <div className="flex items-center gap-3 text-maestro-gold text-sm animate-pulse mb-4">
                                            <Database size={16} className="animate-spin" />
                                            <span>Traduciendo investigación...</span>
                                        </div>
                                    )}
                                    <button disabled={translating || loading} onClick={handleSaveResearch} className={`w-full md:w-auto px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors ${(translating || loading) ? 'bg-gray-600 cursor-not-allowed' : (editingId ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-maestro-gold hover:bg-white text-maestro-dark')}`}>
                                        {translating ? 'Traduciendo...' : (loading ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Añadir'))}
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {research.map(res => (
                                        <div key={res.id} className={`flex justify-between items-center p-4 border transition-all ${editingId === res.id ? 'bg-maestro-gold/10 border-maestro-gold' : 'bg-maestro-dark border-white/5 hover:border-maestro-gold/30'}`}>
                                            <div><h4 className="text-maestro-light font-bold">{(res.title as any)?.es || res.title}</h4><span className="text-xs text-maestro-light/40">{res.year}</span></div>
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
                                        <AdminCalendar />
                                    </div>

                                    {/* Right: The Form */}
                                    <div className="lg:col-span-2 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" value={newPerfTitle} onChange={(e) => setNewPerfTitle(e.target.value)} placeholder="Título Concierto" className="w-full bg-maestro-dark border border-white/10 p-3 text-white focus:border-maestro-gold outline-none" />
                                            <input type="text" value={newPerfDate} onChange={(e) => setNewPerfDate(e.target.value)} placeholder="Fecha (DD MMM YYYY)" className="w-full bg-maestro-dark border border-white/10 p-3 text-white focus:border-maestro-gold outline-none" />
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
                                            <input type="text" value={newPerfLoc} onChange={(e) => setNewPerfLoc(e.target.value)} placeholder="Ubicación" className="w-full bg-maestro-dark border border-white/10 p-3 text-white focus:border-maestro-gold outline-none" />
                                            <input type="text" value={newPerfRole} onChange={(e) => setNewPerfRole(e.target.value)} placeholder="Rol" className="w-full bg-maestro-dark border border-white/10 p-3 text-white focus:border-maestro-gold outline-none" />
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
                                                    <h4 className="text-maestro-light font-bold text-sm">{(perf.title as any)?.es || perf.title}</h4>
                                                    <span className="text-[10px] uppercase tracking-widest text-maestro-light/40">{(perf.date as any)?.es || perf.date} | {(perf.location as any)?.es || perf.location}</span>
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
                                    <div className="flex gap-2">
                                        {newGalType === 'image' ? (
                                            <div className="flex-grow">
                                                <label className="flex items-center justify-center gap-2 cursor-pointer bg-maestro-dark border border-white/10 p-3 text-white/50 hover:text-white hover:border-maestro-gold transition-colors w-full">
                                                    <UploadCloud size={20} />
                                                    <span className="text-sm">{newGalSrc ? 'Imagen Seleccionada (Click para cambiar)' : 'Subir Imagen desde Dispositivo'}</span>
                                                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setNewGalSrc, 'images/gallery/')} className="hidden" />
                                                </label>
                                                {newGalSrc && <p className="text-[10px] text-maestro-gold mt-1 text-center">✓ Imagen cargada en memoria</p>}
                                            </div>
                                        ) : newGalType === 'video' ? (
                                            <input
                                                type="text"
                                                value={newGalSrc}
                                                onChange={(e) => setNewGalSrc(e.target.value)}
                                                placeholder="Enlace de YouTube (ej: https://www.youtube.com/watch?v=...)"
                                                className="flex-grow bg-maestro-dark border border-white/10 p-3 text-white"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={newGalSrc}
                                                onChange={(e) => setNewGalSrc(e.target.value)}
                                                placeholder="Enlace de SoundCloud (ej: https://soundcloud.com/...)"
                                                className="flex-grow bg-maestro-dark border border-white/10 p-3 text-white"
                                            />
                                        )}
                                    </div>

                                    {newGalType === 'audio' && newGalSrc && (
                                        <div className="mt-4 p-4 bg-black/20 border border-white/5 rounded-sm">
                                            <p className="text-[10px] uppercase text-maestro-gold mb-2 tracking-widest font-bold">Previsualización de Audio:</p>
                                            <div className="w-full aspect-[3/1] md:aspect-[4/1] bg-black/40 overflow-hidden rounded-sm">
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

                                    {newGalType === 'video' && (
                                        <input
                                            type="text"
                                            value={newGalThumbnail}
                                            onChange={(e) => setNewGalThumbnail(e.target.value)}
                                            placeholder="URL Miniatura (Opcional, se genera auto para YouTube)"
                                            className="w-full bg-maestro-dark border border-white/10 p-3 text-white"
                                        />
                                    )}

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                value={newGalCat}
                                                onChange={(e) => setNewGalCat(e.target.value)}
                                                placeholder="Título (ej: Sinfonía No. 5)"
                                                className="w-full bg-maestro-dark border border-white/10 p-3 text-white"
                                            />
                                            <input
                                                type="text"
                                                value={newGalAuthor}
                                                onChange={(e) => setNewGalAuthor(e.target.value)}
                                                placeholder="Autor (ej: Beethoven, Grabación propia)"
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
                                </div>

                                {/* Gallery Filter Tabs */}
                                <div className="flex gap-4 mb-6 border-b border-white/5 pb-4">
                                    <button
                                        onClick={() => setAdminGalleryTab('image')}
                                        className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${adminGalleryTab === 'image' ? 'text-maestro-gold border-b border-maestro-gold' : 'text-white/40 hover:text-white'}`}
                                    >
                                        <ImageIcon size={14} /> Fotos ({gallery.filter(i => i.type === 'image').length})
                                    </button>
                                    <button
                                        onClick={() => setAdminGalleryTab('video')}
                                        className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${adminGalleryTab === 'video' ? 'text-maestro-gold border-b border-maestro-gold' : 'text-white/40 hover:text-white'}`}
                                    >
                                        <Video size={14} /> Videos ({gallery.filter(i => i.type === 'video').length})
                                    </button>
                                    <button
                                        onClick={() => setAdminGalleryTab('audio')}
                                        className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${adminGalleryTab === 'audio' ? 'text-maestro-gold border-b border-maestro-gold' : 'text-white/40 hover:text-white'}`}
                                    >
                                        <Music size={14} /> Audio ({gallery.filter(i => i.type === 'audio').length})
                                    </button>
                                </div>

                                {/* Gallery Grid Preview */}
                                {gallery.filter(item => item.type === adminGalleryTab).length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {gallery.filter(item => item.type === adminGalleryTab).map(item => (
                                            <div key={item.id} className={`relative aspect-video group border ${editingId === item.id ? 'border-maestro-gold' : 'border-white/5'}`}>
                                                <img
                                                    src={
                                                        item.type === 'audio'
                                                            ? (item.thumbnail || '/images/audio-section.webp')
                                                            : (item.type === 'video' ? (item.thumbnail || getYouTubeThumbnailUrl(item.src)) : item.src)
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
                                                    {(item.caption as any)?.es || item.caption}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-black/20 border border-dashed border-white/5 rounded-sm">
                                        <p className="text-white/20 text-xs italic">No hay archivos en esta categoría</p>
                                    </div>
                                )}
                            </FadeIn>
                        )}

                    </div>
                </div>
            </div>
        </section>
    );
};
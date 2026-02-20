import React from 'react';
import { FadeIn } from './FadeIn';
import { Mail, Phone, Instagram, Facebook } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

// Custom VK Icon to match Lucide style
const VkIcon = ({ size = 20 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12.9 2H11C4.3 2 2 4.3 2 11V13C2 19.7 4.3 22 11 22H13C19.7 22 22 19.7 22 13V11C22 4.3 19.7 2 13 2H12.9Z" />
        <path d="M16 8C16 8 15.5 8 15.2 8.3C14.9 8.6 14.8 9 14.8 9V10.2C14.8 10.2 14.8 10.5 15 10.7C15.2 10.9 15.5 11 15.5 11L16.2 11C16.8 11 17 11.2 17 11.8V12.2C17 12.8 16.8 13 16.2 13H15.5C14.5 13 13.5 12.5 13 11.5L12 9.5C11.5 8.5 10.5 8 9.5 8H8V16H9.5V13.5C9.5 13.5 9.7 13 10 13C10.3 13 10.5 13.5 10.5 13.5L11.5 15.5C12 16.5 13 17 14 17H16.2C17.5 17 18.5 16 18.5 14.7V10.3C18.5 9 17.5 8 16.2 8H16Z" />
    </svg>
);

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.605 6.039L0 24l6.117-1.605a11.803 11.803 0 005.925 1.597h.005c6.635 0 12.032-5.396 12.035-12.031a11.774 11.774 0 00-3.517-8.293" />
    </svg>
);

const TelegramIcon = ({ size = 20 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
    </svg>
);

import { addItem } from '../src/services/db';

interface ContactProps {
    lang: Language;
}

export const Contact: React.FC<ContactProps> = ({ lang }) => {
    const t = translations[lang].contact;
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) return;

        setStatus('submitting');
        try {
            await addItem('messages', {
                name,
                email,
                message,
                read: false,
                date: new Date().toISOString()
            });
            setStatus('success');
            setName('');
            setEmail('');
            setMessage('');
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            console.error("Error sending message:", error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <section className="relative py-24 px-6 overflow-hidden min-h-[80vh] flex items-center">
            {/* Background Image with Cinematic Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/page-contact.webp"
                    alt="Background"
                    className="w-full h-full object-cover opacity-65 transition-opacity duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-maestro-dark/90 via-maestro-dark/40 to-maestro-dark/90 z-1"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-maestro-dark/60 via-transparent to-maestro-dark/60 z-1"></div>
            </div>

            <div className="relative z-10 w-full">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h2 className="text-4xl font-serif text-maestro-light">{t.title}</h2>
                    <p className="text-maestro-light/60 mt-4">{t.subtitle}</p>
                </div>

                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
                    <FadeIn>
                        <div className="bg-maestro-dark/40 backdrop-blur-md p-8 rounded border border-white/10 hover:border-maestro-gold/30 transition-colors">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-maestro-light/50 mb-2">{t.name}</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-maestro-dark/60 border border-white/10 p-3 text-maestro-light focus:border-maestro-gold outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-maestro-light/50 mb-2">{t.email}</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-maestro-dark/60 border border-white/10 p-3 text-maestro-light focus:border-maestro-gold outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-maestro-light/50 mb-2">{t.message}</label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full bg-maestro-dark/60 border border-white/10 p-3 text-maestro-light focus:border-maestro-gold outline-none transition-colors"
                                    ></textarea>
                                </div>
                                <button
                                    disabled={status === 'submitting'}
                                    className={`w-full font-bold py-3 uppercase tracking-widest transition-all shadow-lg ${status === 'success' ? 'bg-green-600 text-white' :
                                        status === 'error' ? 'bg-red-600 text-white' :
                                            'bg-maestro-gold text-white hover:bg-white hover:text-maestro-dark shadow-maestro-gold/20'
                                        }`}
                                >
                                    {status === 'submitting' ? '...' :
                                        status === 'success' ? '¡Enviado!' :
                                            status === 'error' ? 'Error' : t.send}
                                </button>
                            </form>
                        </div>
                    </FadeIn>

                    <FadeIn delay={200} className="flex flex-col justify-center space-y-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 text-maestro-light group">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-maestro-gold group-hover:bg-maestro-gold group-hover:text-white transition-all">
                                    <Mail />
                                </div>
                                <div>
                                    <h4 className="font-serif text-xl">{t.email}</h4>
                                    <p className="text-maestro-light/60 font-light">diegocarrion@mail.ru</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-maestro-light group">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-maestro-gold group-hover:bg-maestro-gold group-hover:text-white transition-all">
                                    <Phone />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-serif text-xl">{t.phone}</h4>
                                    <div className="flex flex-wrap items-center gap-3 mt-1">
                                        <p className="text-maestro-light/60 font-light">+7 917 901 33 45</p>
                                        <div className="flex gap-2">
                                            <a href="https://wa.me/79179013345" target="_blank" rel="noopener noreferrer" className="text-maestro-gold hover:text-white transition-colors bg-white/5 p-1 rounded hover:bg-maestro-gold/20" title="WhatsApp">
                                                <WhatsAppIcon size={16} />
                                            </a>
                                            <a href="https://t.me/+79179013345" target="_blank" rel="noopener noreferrer" className="text-maestro-gold hover:text-white transition-colors bg-white/5 p-1 rounded hover:bg-maestro-gold/20" title="Telegram">
                                                <TelegramIcon size={16} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <h4 className="text-sm uppercase tracking-widest text-maestro-light/50 mb-4">{t.follow}</h4>
                            <div className="flex gap-4">
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-maestro-light hover:border-maestro-gold hover:text-maestro-gold transition-all hover:scale-110">
                                    <Instagram size={20} />
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-maestro-light hover:border-maestro-gold hover:text-maestro-gold transition-all hover:scale-110">
                                    <Facebook size={20} />
                                </a>
                                <a href="https://wa.me/79179013345" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-maestro-light hover:border-maestro-gold hover:text-maestro-gold transition-all hover:scale-110">
                                    <WhatsAppIcon size={20} />
                                </a>
                                <a href="https://t.me/+79179013345" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-maestro-light hover:border-maestro-gold hover:text-maestro-gold transition-all hover:scale-110">
                                    <TelegramIcon size={20} />
                                </a>
                                <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-maestro-light hover:border-maestro-gold hover:text-maestro-gold transition-all hover:scale-110">
                                    <VkIcon size={20} />
                                </a>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
};
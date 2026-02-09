import React from 'react';
import { FadeIn } from './FadeIn';
import { Mail, Phone, Linkedin, Instagram } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface ContactProps {
    lang: Language;
}

export const Contact: React.FC<ContactProps> = ({ lang }) => {
    const t = translations['es'].contact;

    return (
        <section className="py-24 px-6 bg-maestro-dark border-t border-white/5">
            <div className="max-w-4xl mx-auto text-center mb-12">
                <h2 className="text-4xl font-serif text-maestro-light">{t.title}</h2>
                <p className="text-maestro-light/60 mt-4">{t.subtitle}</p>
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
                <FadeIn>
                    <div className="bg-white/5 p-8 rounded border border-white/10">
                        <form className="space-y-6">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-maestro-light/50 mb-2">{t.name}</label>
                                <input type="text" className="w-full bg-maestro-dark border border-white/10 p-3 text-maestro-light focus:border-maestro-gold outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-maestro-light/50 mb-2">{t.email}</label>
                                <input type="email" className="w-full bg-maestro-dark border border-white/10 p-3 text-maestro-light focus:border-maestro-gold outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-maestro-light/50 mb-2">{t.message}</label>
                                <textarea rows={4} className="w-full bg-maestro-dark border border-white/10 p-3 text-maestro-light focus:border-maestro-gold outline-none transition-colors"></textarea>
                            </div>
                            <button className="w-full bg-maestro-gold text-white font-bold py-3 uppercase tracking-widest hover:bg-white hover:text-maestro-dark transition-colors">
                                {t.send}
                            </button>
                        </form>
                    </div>
                </FadeIn>

                <FadeIn delay={200} className="flex flex-col justify-center space-y-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-maestro-light">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-maestro-gold">
                                <Mail />
                            </div>
                            <div>
                                <h4 className="font-serif text-xl">{t.email}</h4>
                                <p className="text-maestro-light/60 font-light">contacto@alexanderv.com</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-maestro-light">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-maestro-gold">
                                <Phone />
                            </div>
                            <div>
                                <h4 className="font-serif text-xl">Teléfono</h4>
                                <p className="text-maestro-light/60 font-light">+34 912 345 678</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/10">
                        <h4 className="text-sm uppercase tracking-widest text-maestro-light/50 mb-4">{t.follow}</h4>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-maestro-light hover:border-maestro-gold hover:text-maestro-gold transition-all">
                                <Linkedin size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-maestro-light hover:border-maestro-gold hover:text-maestro-gold transition-all">
                                <Instagram size={20} />
                            </a>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};
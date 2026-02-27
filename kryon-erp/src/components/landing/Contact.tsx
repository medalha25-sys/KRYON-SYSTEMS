'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, MessageSquare } from 'lucide-react';

const Contact = () => {
    const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('sending');
        // Simulate sending
        setTimeout(() => {
            setFormStatus('success');
        }, 1500);
    };

    return (
        <section id="contact" className="py-20 relative overflow-hidden bg-black/20">
            {/* Background Glow */}
            <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(112,0,255,0.1) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(60px)',
                zIndex: -1
            }} />

            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
                        Fale com um <span className="text-blue-500">Especialista</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Pronto para escalar seu negócio? Entre em contato e vamos construir o futuro juntos.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-16 items-start max-w-5xl mx-auto">

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-2xl font-bold mb-6 text-white">Canais de Atendimento</h3>
                        <p className="text-gray-400 mb-8">
                            Nossa equipe está pronta para entender sua necessidade e propor a melhor solução tecnológica.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4 items-center">
                                <div className="bg-white/5 p-3 rounded-xl">
                                    <MessageSquare size={24} color="#25D366" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white">WhatsApp Comercial</h4>
                                    <a href="https://wa.me/5538984257511" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition no-underline">
                                        (38) 98425-7511
                                    </a>
                                </div>
                            </div>

                            <div className="flex gap-4 items-center">
                                <div className="bg-white/5 p-3 rounded-xl">
                                    <Mail size={24} color="#00f0ff" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white">E-mail</h4>
                                    <p className="text-gray-400">contato@kryonsystems.com.br</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-center">
                                <div className="bg-white/5 p-3 rounded-xl">
                                    <MapPin size={24} color="#7000ff" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white">Localização</h4>
                                    <p className="text-gray-400">Minas Gerais, Brasil - Atendimento Global</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm"
                    >
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Seu Nome</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: João Silva"
                                    className="w-full p-3 rounded-lg bg-black/20 border border-white/10 text-white focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Empresa</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Minha Loja Ltda"
                                    className="w-full p-3 rounded-lg bg-black/20 border border-white/10 text-white focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Mensagem</label>
                                <textarea
                                    rows={4}
                                    required
                                    placeholder="Gostaria de saber mais sobre..."
                                    className="w-full p-3 rounded-lg bg-black/20 border border-white/10 text-white focus:border-blue-500 outline-none transition resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                                disabled={formStatus === 'sending' || formStatus === 'success'}
                            >
                                {formStatus === 'idle' && <>Enviar Mensagem <Send size={18} /></>}
                                {formStatus === 'sending' && <>Enviando...</>}
                                {formStatus === 'success' && <>Mensagem Enviada! ✅</>}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;

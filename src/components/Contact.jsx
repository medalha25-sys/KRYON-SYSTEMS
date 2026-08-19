import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react';

const Contact = () => {
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [message, setMessage] = useState('');
    const [formStatus, setFormStatus] = useState('idle');

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormStatus('sending');

        const fullMessage = `Olá, equipe Kryon Systems! 👋\n\n*Nome:* ${name}\n*Empresa:* ${company || 'Não informada'}\n*Mensagem:* ${message}\n\n_Vim através do formulário do site kryonsystems.com.br_`;
        const whatsappUrl = `https://wa.me/5538984257511?text=${encodeURIComponent(fullMessage)}`;

        setTimeout(() => {
            setFormStatus('success');
            window.open(whatsappUrl, '_blank');
        }, 600);
    };

    return (
        <section id="contato" className="section py-16 md:py-24 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute bottom-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container-custom relative z-10">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="title text-3xl sm:text-4xl md:text-5xl">
                        Fale com um <span className="gradient-text">Especialista</span>
                    </h2>
                    <p className="subtitle mx-auto text-base sm:text-lg mt-3 text-slate-400 max-w-2xl">
                        Pronto para escalar seu negócio? Envie sua mensagem e nossa equipe entrará em contato imediatamente.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Canais Diretos</h3>
                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
                            Nossa equipe está pronta para entender sua necessidade e propor a melhor solução tecnológica para a sua empresa.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition-all">
                                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 flex-shrink-0">
                                    <MessageSquare size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-semibold text-slate-300">WhatsApp Comercial</h4>
                                    <a 
                                        href="https://wa.me/5538984257511" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-base sm:text-lg font-bold text-emerald-400 hover:text-emerald-300 transition-colors no-underline"
                                    >
                                        (38) 98425-7511
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 transition-all">
                                <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 flex-shrink-0">
                                    <Mail size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-semibold text-slate-300">E-mail</h4>
                                    <a 
                                        href="mailto:contato@kryonsystems.com.br"
                                        className="text-base sm:text-lg font-bold text-white hover:text-cyan-400 transition-colors no-underline truncate block"
                                    >
                                        contato@kryonsystems.com.br
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 transition-all">
                                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 flex-shrink-0">
                                    <MapPin size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-semibold text-slate-300">Localização</h4>
                                    <p className="text-sm sm:text-base font-medium text-slate-300">Minas Gerais, Brasil - Atendimento Global</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="card p-6 sm:p-10"
                    >
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block mb-2 text-xs sm:text-sm font-semibold text-slate-300">Seu Nome</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ex: João Silva"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400 transition-colors text-sm sm:text-base"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-xs sm:text-sm font-semibold text-slate-300">Nome da Empresa / Negócio</label>
                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    placeholder="Ex: Loja de Utilidades Silva"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400 transition-colors text-sm sm:text-base"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-xs sm:text-sm font-semibold text-slate-300">Mensagem</label>
                                <textarea
                                    rows="4"
                                    required
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Gostaria de saber mais sobre..."
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400 transition-colors text-sm sm:text-base resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                disabled={formStatus === 'sending'}
                            >
                                {formStatus === 'idle' && <>Enviar via WhatsApp <Send size={18} /></>}
                                {formStatus === 'sending' && <>Conectando ao WhatsApp...</>}
                                {formStatus === 'success' && <>Enviando Conversa... <CheckCircle2 size={18} /></>}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;

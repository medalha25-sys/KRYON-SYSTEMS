import React from 'react';
import { motion } from 'framer-motion';
import { Star, User } from 'lucide-react';

const testimonials = [
    {
        name: "Carlos Mendes",
        role: "Proprietário de Loja de Roupas",
        text: "Antes eu perdia horas fechando o caixa. Com o sistema da Kryon, resolvo tudo em 5 minutos. Sobra tempo para vender mais!",
        rating: 5,
        image: null // Placeholder for user image if available
    },
    {
        name: "Mariana Souza",
        role: "Gerente de E-commerce",
        text: "A integração com o catálogo online foi a melhor coisa. Meus clientes pedem pelo site e o pedido cai direto no meu WhatsApp e no sistema.",
        rating: 5,
        image: null
    },
    {
        name: "Renato Silva",
        role: "Dika Celulares",
        text: "As Ordens de Serviço organizaram minha oficina. O cliente recebe atualização por email e eu não perco mais peças no estoque.",
        rating: 5,
        image: null
    }
];

const Testimonials = () => {
    return (
        <section className="section py-12 sm:py-16 md:py-24 bg-[#050507] relative">
             <div className="container-custom">
                <div className="text-center mb-8 sm:mb-16">
                    <h2 className="title text-2xl sm:text-3xl md:text-5xl">
                        O que dizem nossos <span className="gradient-text">Parceiros</span>
                    </h2>
                    <p className="subtitle mx-auto text-sm sm:text-base md:text-lg mt-2 sm:mt-3 text-slate-400">
                        Quem usa, aprova e recomenda.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
                    {testimonials.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="card p-5 sm:p-7 relative flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex gap-1 mb-3 sm:mb-4">
                                    {[...Array(item.rating)].map((_, i) => (
                                        <Star key={i} size={16} fill="#ffbd2e" color="#ffbd2e" />
                                    ))}
                                </div>
                                
                                <p className="italic text-slate-300 mb-6 text-xs sm:text-sm leading-relaxed">
                                    "{item.text}"
                                </p>
                            </div>

                            <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                                <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400">
                                    <User size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-white">{item.name}</div>
                                    <div className="text-xs text-slate-400">{item.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
             </div>
        </section>
    );
};

export default Testimonials;

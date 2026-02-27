'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Star, User } from 'lucide-react';

const testimonials = [
    {
        name: "Carlos Mendes",
        role: "Proprietário de Loja de Roupas",
        text: "Antes eu perdia horas fechando o caixa. Com o sistema da Kryon, resolvo tudo em 5 minutos. Sobra tempo para vender mais!",
        rating: 5,
        image: null 
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
        <section className="py-24 bg-[#050507] relative overflow-hidden">
             <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">O que dizem nossos <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Parceiros</span></h2>
                    <p className="text-gray-400 text-lg">
                        Quem usa, aprova e recomenda.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-[#0f172a] border border-gray-800 rounded-3xl p-8 relative hover:border-blue-500/30 transition-colors"
                        >
                            <div className="flex gap-1 mb-4">
                                {[...Array(item.rating)].map((_, i) => (
                                    <Star key={i} size={18} className="fill-yellow-500 text-yellow-500" />
                                ))}
                            </div>
                            
                            <p className="italic text-gray-300 mb-8 leading-relaxed h-[100px] overflow-hidden">
                                "{item.text}"
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                    <User size={24} className="text-blue-500" />
                                </div>
                                <div>
                                    <div className="font-bold text-white mb-0.5">{item.name}</div>
                                    <div className="text-xs text-gray-400">{item.role}</div>
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

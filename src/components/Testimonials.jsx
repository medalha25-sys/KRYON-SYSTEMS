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
        <section className="section" style={{ background: '#050507', position: 'relative' }}>
             <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 className="title">O que dizem nossos <span className="gradient-text">Parceiros</span></h2>
                    <p className="subtitle" style={{ margin: '0 auto' }}>
                        Quem usa, aprova e recomenda.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {testimonials.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                background: 'var(--glass)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '16px',
                                padding: '2rem',
                                position: 'relative'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
                                {[...Array(item.rating)].map((_, i) => (
                                    <Star key={i} size={18} fill="#ffbd2e" color="#ffbd2e" />
                                ))}
                            </div>
                            
                            <p style={{ fontStyle: 'italic', color: '#ccc', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                "{item.text}"
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '50%',
                                    background: 'var(--glass-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <User size={24} color="var(--primary)" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.role}</div>
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

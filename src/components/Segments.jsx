import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Dog, Smartphone, ShoppingBag, Camera, Armchair } from 'lucide-react';

const segments = [
    {
        title: "Saúde e Atendimento",
        product: "Agenda Fácil",
        desc: "Sistema de agendamento online simples e eficiente para terapeutas e profissionais da saúde.",
        icon: <Stethoscope size={28} />,
        color: "#00f0ff"
    },
    {
        title: "Pet Shop",
        product: "Sistema Gestão Pet",
        desc: "Agendamento de serviços, controle de clientes e organização completa dos atendimentos.",
        icon: <Dog size={28} />,
        color: "#ff0070"
    },
    {
        title: "Loja de Celulares",
        product: "Tech Assist",
        desc: "Controle de estoque, ordens de serviço e gestão completa da assistência técnica.",
        icon: <Smartphone size={28} />,
        color: "#7000ff"
    },
    {
        title: "Loja de Roupas",
        product: "Fashion Manager",
        desc: "Controle de produtos, vendas e organização do negócio.",
        icon: <ShoppingBag size={28} />,
        color: "#ffbd2e"
    },
    {
        title: "Fotógrafos",
        product: "Galeria Pro",
        desc: "Galeria online segura com marca d'água automática e seleção de fotos sem download.",
        icon: <Camera size={28} />,
        color: "#27c93f"
    },
    {
        title: "Loja de Decoração",
        product: "Decor Manager (Em Breve)",
        desc: "Controle de estoque, orçamentos personalizados e gestão de entregas.",
        icon: <Armchair size={28} />,
        color: "#ff8c00"
    }
];

const Segments = () => {
    return (
        <section id="segmentos" className="section">
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 className="title">Soluções por <span className="gradient-text">Segmento</span></h2>
                    <p className="subtitle" style={{ margin: '0 auto' }}>
                        Ferramentas especializadas para impulsionar o seu nicho.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '2rem'
                }}>
                    {segments.map((item, index) => (
                        <motion.div
                            key={index}
                            className="card"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                position: 'relative',
                                overflow: 'hidden',
                                borderTop: `1px solid ${item.color}`
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '4px',
                                background: item.color,
                                boxShadow: `0 0 10px ${item.color}`
                            }} />

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    color: item.color
                                }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.title}</h4>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{item.product}</h3>
                                </div>
                            </div>

                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{item.desc}</p>

                            <a href="https://app.kryonsystems.com.br/register" style={{
                                color: item.color,
                                fontWeight: 'bold',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem'
                            }}>
                                Teste Grátis &rarr;
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Segments;

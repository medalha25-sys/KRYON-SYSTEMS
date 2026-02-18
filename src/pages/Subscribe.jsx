import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, PawPrint, Smartphone, ShoppingBag, Camera, Armchair, ArrowRight } from 'lucide-react';

const Subscribe = () => {
    const systems = [
        {
            category: "SAÚDE E ATENDIMENTO",
            title: "Agenda Fácil",
            slug: "agenda-facil",
            description: "Elimine faltas com lembretes automáticos e organize sua agenda. Ideal para focar no atendimento enquanto o sistema cuida da burocracia do seu consultório.",
            icon: <Stethoscope size={28} />,
            color: "#00f0ff", // Cyan
            link: "https://app.kryonsystems.com.br/trial?product=agenda-facil"
        },
        {
            category: "PET SHOP",
            title: "Sistema Gestão Pet",
            slug: "gestao-pet",
            description: "Gerencie banho, tosa e vendas com facilidade. Tenha o histórico completo de cada pet e fidelize clientes com um atendimento personalizado e organizado.",
            icon: <PawPrint size={28} />,
            color: "#ff007f", // Pink
            link: "https://app.kryonsystems.com.br/trial?product=gestao-pet"
        },
        {
            category: "LOJA DE CELULARES",
            title: "Tech Assist",
            slug: "tech-assist",
            description: "Organize sua assistência técnica do início ao fim. Controle ordens de serviço, estoque de peças e comunique o status do reparo para o cliente automaticamente.",
            icon: <Smartphone size={28} />,
            color: "#9d4edd", // Purple
            link: "https://app.kryonsystems.com.br/trial?product=tech-assist"
        },
        {
            category: "LOJA DE ROUPAS",
            title: "Fashion Manager",
            slug: "fashion-manager",
            description: "Domine seu estoque de grade e cor. Controle condicional, vendas e crediário de forma simples, garantindo que sua loja de roupas nunca perca uma venda.",
            icon: <ShoppingBag size={28} />,
            color: "#ffaa00", // Gold/Orange
            link: "https://app.kryonsystems.com.br/trial?product=fashion-manager"
        },
        {
            category: "FOTÓGRAFOS",
            title: "Galeria Pro",
            slug: "galeria-pro",
            description: "Agilize a aprovação de fotos com seus clientes. Uma galeria segura e profissional para seleção de imagens, protegendo seu trabalho e valorizando seu portfólio.",
            icon: <Camera size={28} />,
            color: "#00ff41", // Green
            link: "https://app.kryonsystems.com.br/trial?product=galeria-pro"
        },
        {
            category: "LOJA DE DECORAÇÃO",
            title: "Decor Manager (Em Breve)",
            slug: "decor-manager",
            description: "Gestão sob medida para projetos e orçamentos. Controle entregas, encomendas e o financeiro da sua loja de decoração com precisão e elegância.",
            icon: <Armchair size={28} />,
            color: "#ff6b00", // Deep Orange
            link: "https://app.kryonsystems.com.br/trial?product=decor-manager"
        }
    ];

    return (
        <div style={{ background: '#050507', minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px', fontFamily: 'sans-serif' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 className="title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                        Nossos <span className="gradient-text">Sistemas</span>
                    </h1>
                    <p className="subtitle" style={{ maxWidth: '700px', margin: '0 auto', color: 'var(--text-muted)' }}>
                        Soluções especializadas para cada tipo de negócio.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '2rem',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    {systems.map((system, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                background: '#121216', // Darker card bg
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                                padding: '2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                            }}
                        >
                            {/* Top Glow Border */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '2px', // Thin header line
                                background: system.color,
                                boxShadow: `0 0 15px ${system.color}`
                            }} />

                            {/* Icon Box */}
                            <div style={{
                                width: '50px',
                                height: '50px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                color: system.color,
                                border: `1px solid rgba(255,255,255,0.05)`
                            }}>
                                {system.icon}
                            </div>

                            {/* Text Content */}
                            <div style={{ marginBottom: 'auto' }}>
                                <div style={{ 
                                    fontSize: '0.75rem', 
                                    textTransform: 'uppercase', 
                                    letterSpacing: '1px', 
                                    color: 'var(--text-muted)', 
                                    marginBottom: '0.5rem',
                                    fontWeight: '600'
                                }}>
                                    {system.category}
                                </div>
                                <h3 style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: 'bold', 
                                    color: '#fff', 
                                    marginBottom: '1rem',
                                    fontFamily: 'inherit'
                                }}>
                                    {system.title}
                                </h3>
                                <p style={{ 
                                    color: '#94a3b8', 
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6',
                                    marginBottom: '1.5rem'
                                }}>
                                    {system.description}
                                </p>
                            </div>

                            {/* Link/Action */}
                            <a 
                                href={system.link} 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '6px',
                                    color: system.color,
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    textDecoration: 'none',
                                    transition: 'gap 0.2s ease',
                                    cursor: system.link === '#' ? 'default' : 'pointer',
                                    opacity: system.link === '#' ? 0.7 : 1
                                }}
                                onMouseOver={(e) => {
                                    if(system.link !== '#') e.currentTarget.style.gap = '10px';
                                }}
                                onMouseOut={(e) => {
                                    if(system.link !== '#') e.currentTarget.style.gap = '6px';
                                }}
                            >
                                {system.link === '#' ? 'Em Breve' : 'Saiba mais'} 
                                {system.link !== '#' && <ArrowRight size={16} />}
                            </a>

                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Subscribe;

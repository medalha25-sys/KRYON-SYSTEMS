import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, PawPrint, Smartphone, ShoppingBag, Camera, Armchair, ShoppingCart, Car, Wrench, Scale, ArrowRight } from 'lucide-react';

const Subscribe = () => {
    const systems = [
        {
            category: "LOJA DE UTILIDADES",
            title: "Sistema VasiStore",
            slug: "vasistore",
            description: "Gestão completa para lojas de utilidades: controle total de estoque, vendas rápidas no PDV e relatórios inteligentes para organizar e crescer.",
            niches: ["Lojas de Variedades", "Vasilhas & Plásticos", "Utilidades do Lar", "Bazares", "Presentes", "Lojas de 1,99"],
            icon: <ShoppingCart size={28} />,
            color: "#ff7b00", // Bright Orange
            badge: "✨ NOVIDADE",
            link: "https://utillar-gestao.vercel.app/login"
        },
        {
            category: "LAVA RÁPIDO",
            title: "Kryon Lava Rápido",
            slug: "lava-rapido",
            description: "Agendamentos, clientes, serviços, ordens de serviço e controle financeiro para seu lava-rápido.",
            niches: ["Lava-Rápidos", "Lava-Jatos", "Estética Automotiva", "Detailers", "Polimento & Vitrificação"],
            icon: <Car size={28} />,
            color: "#2e6aff", // Blue Neon
            badge: "⚡ 30 DIAS GRÁTIS",
            link: "https://brilho-magico-saas.vercel.app/cadastro"
        },
        {
            category: "LOJA DE DECORAÇÃO",
            title: "Kryon Decor",
            slug: "decor-manager",
            description: "Controle de estoque, produtos, vendas, orçamentos e entregas para sua loja de decoração.",
            niches: ["Lojas de Decoração", "Cortinas & Persianas", "Móveis Planejados", "Tapetes & Quadros", "Artigos para o Lar"],
            icon: <Armchair size={28} />,
            color: "#ff8c00", // Deep Orange
            link: "https://app.kryonsystems.com.br/products/decor-manager"
        },
        {
            category: "OFICINA MECÂNICA",
            title: "Kryon Auto",
            slug: "mechanic",
            description: "Ordens de serviço, peças, clientes, veículos e histórico de manutenção em um só lugar.",
            niches: ["Oficinas Mecânicas", "Auto Centers", "Centros Automotivos", "Auto Elétricas", "Funilaria & Pintura"],
            icon: <Wrench size={28} />,
            color: "#ff3d00", // Bright Red-Orange
            link: "https://app.kryonsystems.com.br/products/mechanic"
        },
        {
            category: "ADVOGADOS",
            title: "Kryon Jurídico",
            slug: "legal-desk",
            description: "Organize processos, clientes, prazos, audiências e documentos em um só lugar.",
            niches: ["Escritórios de Advocacia", "Advogados Autônomos", "Consultorias Jurídicas", "Departamentos Legais"],
            icon: <Scale size={28} />,
            color: "#8c52ff", // Purple Neon
            link: "https://app.kryonsystems.com.br/products/legal-desk"
        },
        {
            category: "SAÚDE E ATENDIMENTO",
            title: "Agenda Fácil",
            slug: "agenda-facil",
            description: "Elimine faltas com lembretes automáticos e organize sua agenda de consultas e procedimentos.",
            niches: ["Clínicas Médicas", "Dentistas & Odonto", "Psicólogos", "Terapeutas", "Fisioterapeutas", "Nutricionistas", "Fonoaudiólogos", "Estética & Bem-Estar"],
            icon: <Stethoscope size={28} />,
            color: "#00f0ff", // Cyan
            link: "https://app.kryonsystems.com.br/products/agenda-facil"
        },
        {
            category: "PET SHOP",
            title: "Sistema Gestão Pet",
            slug: "gestao-pet",
            description: "Gerencie banho, tosa e vendas com facilidade. Tenha o histórico de cada pet e fidelize clientes.",
            niches: ["Pet Shops", "Banho & Tosa", "Clínicas Veterinárias", "Spas Caninos", "Creches & Hotéis Pet"],
            icon: <PawPrint size={28} />,
            color: "#ff007f", // Pink
            link: "https://app.kryonsystems.com.br/products/gestao-pet"
        },
        {
            category: "LOJA DE CELULARES",
            title: "Tech Assist",
            slug: "tech-assist",
            description: "Organize sua assistência técnica do início ao fim. Controle ordens de serviço, peças e prazos.",
            niches: ["Assistência de Celulares", "Lojas de Acessórios", "Conserto de Informática", "Eletrônicos & Games"],
            icon: <Smartphone size={28} />,
            color: "#9d4edd", // Purple
            link: "https://app.kryonsystems.com.br/products/tech-assist"
        },
        {
            category: "LOJA DE ROUPAS",
            title: "Fashion Manager",
            slug: "fashion-manager",
            description: "Domine seu estoque de grade e cor. Controle condicional, vendas e crediário de forma simples.",
            niches: ["Lojas de Roupas", "Boutiques", "Lojas de Calçados", "Moda Feminina & Masculina", "Lingerie & Acessórios"],
            icon: <ShoppingBag size={28} />,
            color: "#ffaa00", // Gold/Orange
            link: "https://app.kryonsystems.com.br/products/fashion-manager"
        },
        {
            category: "FOTÓGRAFOS",
            title: "Galeria Pro",
            slug: "galeria-pro",
            description: "Agilize a aprovação de fotos com clientes. Galeria segura para seleção de imagens com marca d'água.",
            niches: ["Fotógrafos de Casamentos", "Ensaios & Família", "Eventos & Formaturas", "Festas & Aniversários", "Estúdios Fotográficos"],
            icon: <Camera size={28} />,
            color: "#00ff41", // Green
            link: "https://app.kryonsystems.com.br/products/galeria-pro"
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
                                background: '#121216',
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
                                height: '2px',
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
                            <div style={{ marginBottom: 'auto', width: '100%' }}>
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '0.5rem'
                                }}>
                                    <span style={{ 
                                        fontSize: '0.75rem', 
                                        textTransform: 'uppercase', 
                                        letterSpacing: '1px', 
                                        color: 'var(--text-muted)', 
                                        fontWeight: '600'
                                    }}>
                                        {system.category}
                                    </span>
                                    {system.badge && (
                                        <span style={{
                                            fontSize: '0.65rem',
                                            background: 'rgba(255, 123, 0, 0.2)',
                                            color: system.color,
                                            padding: '2px 6px',
                                            borderRadius: '6px',
                                            fontWeight: 'bold',
                                            border: `1px solid ${system.color}40`
                                        }}>
                                            {system.badge}
                                        </span>
                                    )}
                                </div>
                                <h3 style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: 'bold', 
                                    color: '#fff', 
                                    marginBottom: '0.75rem',
                                    fontFamily: 'inherit'
                                }}>
                                    {system.title}
                                </h3>
                                <p style={{ 
                                    color: '#94a3b8', 
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6',
                                    marginBottom: '1rem'
                                }}>
                                    {system.description}
                                </p>

                                {/* Ideal para Tags */}
                                {system.niches && (
                                    <div style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '12px',
                                        padding: '12px',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <span style={{
                                            display: 'block',
                                            fontSize: '0.65rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            fontWeight: 'bold',
                                            color: system.color,
                                            marginBottom: '8px'
                                        }}>
                                            🎯 Ideal para:
                                        </span>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {system.niches.map((niche, nIdx) => (
                                                <span 
                                                    key={nIdx}
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        color: '#cbd5e1',
                                                        border: '1px solid rgba(255,255,255,0.05)'
                                                    }}
                                                >
                                                    {niche}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
                                {system.link === '#' ? 'Em Breve' : 'Começar Teste Grátis'} 
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

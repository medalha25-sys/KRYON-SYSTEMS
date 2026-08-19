import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Dog, Smartphone, ShoppingBag, Camera, Armchair, Car, Wrench, Scale, ShoppingCart } from 'lucide-react';

const segments = [
    {
        title: "Loja de Utilidades",
        product: "Sistema VasiStore",
        slug: "vasistore",
        desc: "Gestão completa para lojas de utilidades: controle total de vendas e estoque, frente de caixa PDV e organização para fazer seu negócio crescer.",
        icon: <ShoppingCart size={24} />,
        color: "#ff7b00",
        badge: "✨ NOVIDADE",
        logo: "/vasistore-logo.png",
        directUrl: "https://utillar-gestao.vercel.app/login",
        trialText: "Testar 30 Dias Grátis \u2192"
    },
    {
        title: "Saúde e Atendimento",
        product: "Agenda Fácil",
        slug: "agenda-facil",
        desc: "Sistema de agendamento online simples e eficiente para terapeutas e profissionais da saúde.",
        icon: <Stethoscope size={24} />,
        color: "#00f0ff",
        directUrl: "https://app.kryonsystems.com.br/products/agenda-facil"
    },
    {
        title: "Pet Shop",
        product: "Sistema Gestão Pet",
        slug: "gestao-pet",
        desc: "Agendamento de serviços, controle de clientes e organização completa dos atendimentos.",
        icon: <Dog size={24} />,
        color: "#ff0070",
        directUrl: "https://app.kryonsystems.com.br/products/gestao-pet"
    },
    {
        title: "Loja de Celulares",
        product: "Tech Assist",
        slug: "tech-assist",
        desc: "Controle de estoque, ordens de serviço e gestão completa da assistência técnica.",
        icon: <Smartphone size={24} />,
        color: "#7000ff",
        directUrl: "https://app.kryonsystems.com.br/products/tech-assist"
    },
    {
        title: "Loja de Roupas",
        product: "Fashion Manager",
        slug: "fashion-manager",
        desc: "Controle de produtos, vendas e organização do negócio.",
        icon: <ShoppingBag size={24} />,
        color: "#ffbd2e",
        directUrl: "https://app.kryonsystems.com.br/products/fashion-manager"
    },
    {
        title: "Fotógrafos",
        product: "Galeria Pro",
        slug: "galeria-pro",
        desc: "Galeria online segura com marca d'água automática e seleção de fotos sem download.",
        icon: <Camera size={24} />,
        color: "#27c93f",
        directUrl: "https://app.kryonsystems.com.br/products/galeria-pro"
    },
    {
        title: "Lava Rápido",
        product: "Agendamento Online",
        slug: "lava-rapido",
        desc: "Agendamento online inteligente, gestão de OS e controle financeiro completo para seu lava jato.",
        icon: <Car size={24} />,
        color: "#2e6aff",
        directUrl: "https://app.kryonsystems.com.br/products/lava-rapido"
    },
    {
        title: "Loja de Decoração",
        product: "Decor Manager",
        slug: "decor-manager",
        desc: "Controle de estoque, orçamentos personalizados e gestão de entregas.",
        icon: <Armchair size={24} />,
        color: "#ff8c00",
        directUrl: "https://app.kryonsystems.com.br/products/decor-manager"
    },
    {
        title: "Oficina Mecânica",
        product: "Auto Gestor",
        slug: "mechanic",
        desc: "Ordens de serviço, controle de peças e histórico de manutenção veicular.",
        icon: <Wrench size={24} />,
        color: "#ff3d00",
        directUrl: "https://app.kryonsystems.com.br/products/mechanic"
    },
    {
        title: "Advogados",
        product: "Legal Desk",
        slug: "legal-desk",
        desc: "Gestão de processos, agenda de audiências e controle de prazos.",
        icon: <Scale size={24} />,
        color: "#8c52ff",
        directUrl: "https://app.kryonsystems.com.br/products/legal-desk"
    }
];

const Segments = () => {
    return (
        <section id="segmentos" className="section py-16 md:py-24">
            <div className="container-custom">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="title text-3xl sm:text-4xl md:text-5xl">
                        Soluções por <span className="gradient-text">Segmento</span>
                    </h2>
                    <p className="subtitle mx-auto text-base sm:text-lg mt-3 text-slate-400 max-w-2xl">
                        Ferramentas especializadas e pensadas sob medida para impulsionar o seu nicho.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {segments.map((item, index) => (
                        <motion.div
                            key={index}
                            className="card relative flex flex-col justify-between overflow-hidden p-6 sm:p-8"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                                borderTop: `2px solid ${item.color}`
                            }}
                        >
                            <div 
                                className="absolute top-0 left-0 w-full h-1"
                                style={{
                                    background: item.color,
                                    boxShadow: `0 0 14px ${item.color}`
                                }}
                            />

                            <div>
                                <div className="flex items-center gap-3.5 mb-5">
                                    <div 
                                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{
                                            background: 'rgba(255,255,255,0.06)',
                                            color: item.color,
                                            border: `1px solid ${item.color}40`,
                                            padding: item.logo ? '6px' : '10px'
                                        }}
                                    >
                                        {item.logo ? (
                                            <img 
                                                src={item.logo} 
                                                alt={item.product} 
                                                className="w-full h-full object-contain" 
                                            />
                                        ) : (
                                            item.icon
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold truncate">
                                                {item.title}
                                            </span>
                                            {item.badge && (
                                                <span 
                                                    className="text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider whitespace-nowrap shadow-sm shadow-orange-500/20"
                                                    style={{
                                                        background: 'linear-gradient(135deg, rgba(255, 123, 0, 0.25), rgba(255, 60, 0, 0.2))',
                                                        color: '#ffaa44',
                                                        border: '1px solid rgba(255, 123, 0, 0.6)'
                                                    }}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                                            {item.product}
                                        </h3>
                                    </div>
                                </div>

                                <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                                    {item.desc}
                                </p>
                            </div>

                            <a 
                                href={item.directUrl || `https://app.kryonsystems.com.br/products/${item.slug}`} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 sm:py-3.5 px-5 rounded-xl font-bold text-sm sm:text-base text-center transition-all flex items-center justify-center gap-2 no-underline active:scale-[0.98]"
                                style={{
                                    backgroundColor: item.color,
                                    color: '#050507',
                                    boxShadow: `0 4px 16px ${item.color}35`
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {item.trialText || "Testar 30 Dias Grátis \u2192"}
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Segments;

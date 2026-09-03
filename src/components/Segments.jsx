import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Dog, Smartphone, ShoppingBag, Camera, Armchair, Car, Wrench, Scale, ShoppingCart } from 'lucide-react';

const segments = [
    {
        title: "LOJA DE UTILIDADES",
        product: "Kryon Utilidades",
        slug: "vasistore",
        subtitle: "Gestão para Lojas de Utilidades Domésticas",
        desc: "Controle produtos, estoque, vendas, clientes e financeiro em um só lugar.",
        niches: ["Lojas de Variedades", "Vasilhas & Plásticos", "Utilidades do Lar", "Bazares", "Presentes", "Lojas de 1,99"],
        icon: <ShoppingCart size={24} />,
        color: "#ff7b00",
        badge: "✨ NOVIDADE",
        logo: "/vasistore-logo.png",
        directUrl: "https://utillar-gestao.vercel.app/login",
        trialText: "Começar Teste Grátis →"
    },
    {
        title: "AGENDAMENTO ONLINE",
        product: "Kryon Agenda",
        slug: "agenda-facil",
        subtitle: "Agendamento Online para o seu Negócio",
        desc: "Organize agendamentos, clientes, serviços, profissionais e horários de forma simples.",
        niches: ["Clínicas Médicas", "Dentistas & Odonto", "Psicólogos", "Terapeutas", "Fisioterapeutas", "Nutricionistas", "Estética & Bem-Estar"],
        icon: <Stethoscope size={24} />,
        color: "#00f0ff",
        directUrl: "https://app.kryonsystems.com.br/products/agenda-facil",
        trialText: "Começar Teste Grátis →"
    },
    {
        title: "PET SHOP",
        product: "Kryon Pet",
        slug: "gestao-pet",
        subtitle: "Gestão Completa para Pet Shops",
        desc: "Controle clientes, pets, banho e tosa, serviços, agenda e financeiro em um só lugar.",
        niches: ["Pet Shops", "Banho & Tosa", "Clínicas Veterinárias", "Spas Caninos", "Creches & Hotéis Pet"],
        icon: <Dog size={24} />,
        color: "#ff007f",
        directUrl: "https://app.kryonsystems.com.br/products/gestao-pet",
        trialText: "Começar Teste Grátis →"
    },
    {
        title: "LOJA DE CELULARES",
        product: "Kryon Celular",
        slug: "tech-assist",
        subtitle: "Gestão para Lojas e Assistências de Celulares",
        desc: "Controle vendas, estoque, aparelhos, acessórios, clientes e serviços técnicos.",
        niches: ["Assistência de Celulares", "Lojas de Acessórios", "Conserto de Informática", "Eletrônicos & Games"],
        icon: <Smartphone size={24} />,
        color: "#7000ff",
        directUrl: "https://app.kryonsystems.com.br/products/tech-assist",
        trialText: "Começar Teste Grátis →"
    },
    {
        title: "LOJA DE ROUPAS",
        product: "Kryon Moda",
        slug: "fashion-manager",
        subtitle: "Gestão para Lojas de Roupas e Calçados",
        desc: "Controle produtos, estoque, vendas, clientes e financeiro de forma simples.",
        niches: ["Lojas de Roupas", "Boutiques", "Lojas de Calçados", "Moda Feminina & Masculina", "Lingerie & Acessórios"],
        icon: <ShoppingBag size={24} />,
        color: "#ffbd2e",
        directUrl: "https://app.kryonsystems.com.br/products/fashion-manager",
        trialText: "Começar Teste Grátis →"
    },
    {
        title: "FOTÓGRAFOS",
        product: "Kryon Fotos — Studio Pro",
        slug: "galeria-pro",
        subtitle: "Galeria Profissional para Fotógrafos",
        desc: "Crie galerias, entregue fotos aos clientes e organize seleção e compartilhamento em um só lugar.",
        niches: ["Fotógrafos de Casamentos", "Ensaios & Família", "Eventos & Formaturas", "Festas & Aniversários", "Estúdios Fotográficos"],
        icon: <Camera size={24} />,
        color: "#27c93f",
        directUrl: "https://kryon-fotos.vercel.app",
        trialText: "Começar Teste Grátis →"
    },
    {
        title: "LAVA RÁPIDO",
        product: "Kryon Lava Rápido",
        slug: "lava-rapido",
        subtitle: "Gestão para Lava-Rápidos",
        desc: "Controle agendamentos, clientes, serviços, ordens de serviço e financeiro do seu lava-rápido.",
        niches: ["Lava-Rápidos", "Lava-Jatos", "Estética Automotiva", "Detailers", "Polimento & Vitrificação"],
        icon: <Car size={24} />,
        color: "#2e6aff",
        directUrl: "https://brilho-magico-saas.vercel.app/cadastro",
        trialText: "Começar Teste Grátis →"
    },
    {
        title: "LOJA DE DECORAÇÃO",
        product: "Kryon Decor",
        slug: "decor-manager",
        subtitle: "Gestão para Lojas de Decoração",
        desc: "Controle estoque, produtos, vendas, orçamentos personalizados e entregas.",
        niches: ["Lojas de Decoração", "Cortinas & Persianas", "Móveis Planejados", "Tapetes & Quadros", "Artigos para o Lar"],
        icon: <Armchair size={24} />,
        color: "#ff8c00",
        directUrl: "https://app.kryonsystems.com.br/products/decor-manager",
        trialText: "Começar Teste Grátis →"
    },
    {
        title: "OFICINA MECÂNICA",
        product: "Kryon Auto",
        slug: "mechanic",
        subtitle: "Gestão Completa para Oficinas Mecânicas",
        desc: "Controle ordens de serviço, peças, clientes, veículos e histórico de manutenção.",
        niches: ["Oficinas Mecânicas", "Auto Centers", "Centros Automotivos", "Auto Elétricas", "Funilaria & Pintura"],
        icon: <Wrench size={24} />,
        color: "#ff3d00",
        directUrl: "https://app.kryonsystems.com.br/products/mechanic",
        trialText: "Começar Teste Grátis →"
    },
    {
        title: "ADVOGADOS",
        product: "Kryon Jurídico",
        slug: "legal-desk",
        subtitle: "Gestão para Escritórios de Advocacia",
        desc: "Organize processos, clientes, prazos, audiências e documentos em um só lugar.",
        niches: ["Escritórios de Advocacia", "Advogados Autônomos", "Consultorias Jurídicas", "Departamentos Legais"],
        icon: <Scale size={24} />,
        color: "#8c52ff",
        directUrl: "https://app.kryonsystems.com.br/products/legal-desk",
        trialText: "Começar Teste Grátis →"
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
                                        {item.subtitle && (
                                            <p className="text-xs font-semibold text-slate-300 mt-0.5">
                                                {item.subtitle}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-4">
                                    {item.desc}
                                </p>

                                {/* Seção "Ideal para" com tags elegantes */}
                                {item.niches && (
                                    <div className="mb-6 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider block mb-2 flex items-center gap-1.5" style={{ color: item.color }}>
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                            Ideal para:
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.niches.map((niche, nIdx) => (
                                                <span 
                                                    key={nIdx}
                                                    className="text-[11px] px-2 py-0.5 rounded-md font-medium text-slate-300 bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                                                >
                                                    {niche}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
                                {item.trialText || "Começar Teste Grátis →"}
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Segments;

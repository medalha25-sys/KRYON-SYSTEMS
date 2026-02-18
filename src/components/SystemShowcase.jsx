import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const features = [
    {
        title: "Vendas Rápidas e Completas",
        description: "Faça vendas rapidamente, controle as comissões dos vendedores, recebimentos e muito mais!"
    },
    {
        title: "PDV com Leitor de Código de Barras",
        description: "PDV rápido compatível com leitores de códigos de barras para agilizar suas vendas."
    },
    {
        title: "Orçamentos e Pré-Vendas",
        description: "Opção de orçamento e pré-vendas com observação nas vendas ou individualmente nos produtos."
    },
    {
        title: "Pagamento via PIX",
        description: "Ofereça aos seus clientes maior comodidade e facilidade com pagamentos via QR Code PIX."
    }
];

const SystemShowcase = () => {
    return (
        <section className="section" id="showcase" style={{ background: '#050507', overflow: 'hidden' }}>
            <div className="container">
                <div className="showcase-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))',
                    gap: '4rem',
                    alignItems: 'center'
                }}>
                    {/* Left Column: Mockups */}
                    <div className="mockups-container" style={{ position: 'relative', height: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         {/* Desktop Monitor */}
                         <div className="desktop-mockup" style={{
                            width: '100%',
                            maxWidth: '500px',
                            aspectRatio: '16/9',
                            background: '#1a1a2e',
                            border: '10px solid #333',
                            borderRadius: '12px',
                            position: 'relative',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 1,
                            transform: 'perspective(1000px) rotateY(-10deg) rotateX(2deg)',
                            transition: 'transform 0.5s ease'
                        }}>
                            {/* Main Area */}
                            <div style={{ flex: 1, padding: 'clamp(10px, 3%, 20px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Header Title */}
                                <div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>Visão Geral</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Métricas em tempo real.</div>
                                </div>

                                {/* Acesso Rápido Section */}
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                        <div style={{ color: 'var(--primary)' }}>⚡</div>
                                        Acesso Rápido
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {/* Abrir PDV */}
                                        <div style={{
                                            background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            flex: '1 1 100px',
                                            minWidth: '100px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 15px rgba(30, 136, 229, 0.4)',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <div style={{ width: '20px', height: '20px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} />
                                            <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center' }}>Abrir PDV</div>
                                        </div>

                                        {/* Other Actions */}
                                        {['Venda', 'O.S.'].map((item, i) => (
                                            <div key={i} style={{
                                                background: '#1a1a2e',
                                                borderRadius: '8px',
                                                padding: '10px',
                                                flex: '1 1 60px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{item}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Bottom Widgets */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1 }}>
                                    <div style={{ background: '#1a1a2e', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', padding: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div style={{ color: '#ff9f43', fontSize: '0.7rem', fontWeight: 'bold' }}>⚠ Estoque</div>
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontStyle: 'italic' }}>Ok</div>
                                    </div>
                                    <div style={{ background: '#1a1a2e', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', padding: '12px' }}>
                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 'bold' }}>🔧 O.S.</div>
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontStyle: 'italic' }}>Ok</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Monitor Stand */}
                        <div className="monitor-stand" style={{
                            position: 'absolute',
                            bottom: '0',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '120px',
                            height: '30px',
                            background: 'linear-gradient(180deg, #333 0%, #111 100%)',
                            clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
                        }} />

                        {/* Mobile Phone */}
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mobile-mockup"
                            style={{
                                position: 'absolute',
                                bottom: '20px',
                                right: '10px',
                                width: '180px',
                                height: '380px',
                                background: '#000',
                                border: '6px solid #1e293b',
                                borderRadius: '24px',
                                zIndex: 3,
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Mobile Screen Content */}
                            <div style={{ padding: '15px', height: '100%', background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <div style={{ width: '15px', height: '2px', background: '#94a3b8', boxShadow: '0 5px 0 #94a3b8, 0 -5px 0 #94a3b8' }} />
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#2563eb' }} />
                                </div>

                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '10px' }}>Dashboard mobile</div>
                                
                                <div style={{
                                    background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
                                    borderRadius: '10px',
                                    padding: '12px',
                                    marginBottom: '10px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>Novo Pedido</div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} style={{ background: '#1e293b', height: '40px', borderRadius: '8px' }} />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Features List */}
                    <div className="features-container">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                style={{
                                    background: 'var(--glass)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    padding: '1.25rem',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <div style={{
                                    background: 'linear-gradient(135deg, #ff4d4d 0%, #d93025 100%)',
                                    minWidth: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 10px rgba(217, 48, 37, 0.3)'
                                }}>
                                    <Check color="#fff" size={20} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: '#fff' }}>{feature.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .showcase-grid {
                        gap: 2rem !important;
                    }
                    .mockups-container {
                        height: 380px !important;
                        margin-bottom: 2rem;
                    }
                    .desktop-mockup {
                        transform: none !important;
                        border-width: 6px !important;
                    }
                    .mobile-mockup {
                        width: 150px !important;
                        height: 320px !important;
                        right: 0px !important;
                        bottom: 0px !important;
                        transform: none !important;
                    }
                    .monitor-stand {
                        display: none;
                    }
                    .features-container {
                        margin-top: 2rem;
                    }
                }
                @media (max-width: 480px) {
                    .mockups-container {
                        height: 320px !important;
                    }
                    .desktop-mockup {
                        max-width: 100% !important;
                    }
                    .mobile-mockup {
                        width: 130px !important;
                        height: 280px !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default SystemShowcase;

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';

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
        <section className="section" style={{ background: '#050507', overflow: 'hidden' }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '4rem',
                    alignItems: 'center'
                }}>
                    {/* Left Column: Mockups */}
                    <div style={{ position: 'relative', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         {/* Desktop Monitor */}
                         <div style={{
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
                            transform: 'perspective(1000px) rotateY(-15deg) rotateX(5deg)',
                            transition: 'transform 0.5s ease'
                        }}>
                            {/* Main Area - Recreated from User Screenshot */}
                            <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Header Title */}
                                <div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>Visão Geral</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bem-vindo de volta! Aqui está o resumo da sua loja.</div>
                                </div>

                                {/* Acesso Rápido Section */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                        <div style={{ color: 'var(--primary)' }}>⚡</div>
                                        Acesso Rápido
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        {/* Abrir PDV - Blue Hero Button */}
                                        <div style={{
                                            background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            width: '120px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 15px rgba(30, 136, 229, 0.4)',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <div style={{ width: '24px', height: '24px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} />
                                            <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>Abrir PDV</div>
                                        </div>

                                        {/* Other Actions */}
                                        {['Nova Venda', 'Nova O.S.', 'Novo Cliente'].map((item, i) => (
                                            <div key={i} style={{
                                                background: '#1a1a2e',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                flex: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Bottom Widgets (Estoque / OS) */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flex: 1 }}>
                                    <div style={{ background: '#1a1a2e', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', padding: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <div style={{ color: '#ff9f43', fontSize: '0.85rem', fontWeight: 'bold' }}>⚠ Estoque Baixo</div>
                                            <div style={{ color: 'var(--primary)', fontSize: '0.7rem' }}>Ver estoque</div>
                                        </div>
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                                            Nenhum alerta.
                                        </div>
                                    </div>
                                    <div style={{ background: '#1a1a2e', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', padding: '16px' }}>
                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>🔧 Últimas O.S.</div>
                                            <div style={{ color: 'var(--primary)', fontSize: '0.7rem' }}>Ver todas</div>
                                        </div>
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                                            Nenhuma ordem.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                            {/* Monitor Stand */}
                            <div style={{
                                position: 'absolute',
                                bottom: '-40px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '120px',
                                height: '40px',
                                background: 'linear-gradient(180deg, #333 0%, #111 100%)',
                                clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
                            }} />
                            <div style={{
                                position: 'absolute',
                                bottom: '-45px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                            }} />

                        {/* Mobile Phone */}
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 20, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                position: 'absolute',
                                bottom: '-40px',
                                right: '-30px',
                                left: 'auto',
                                width: '220px',
                                height: '450px',
                                background: '#000',
                                border: '6px solid #1e293b',
                                borderRadius: '24px',
                                zIndex: 3,
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Mobile Screen Content - Updated Dark Theme */}
                            <div style={{ padding: '20px', height: '100%', background: '#0f172a', color: '#fff', fontFamily: 'sans-serif', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <div style={{ width: '20px', height: '2px', background: '#94a3b8', boxShadow: '0 6px 0 #94a3b8, 0 -6px 0 #94a3b8', alignSelf: 'center' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <div style={{ width: '20px', height: '20px', border: '2px dashed #94a3b8', borderRadius: '50%' }} title="Theme" />
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ width: '18px', height: '18px', border: '2px solid #94a3b8', borderRadius: '4px 4px 0 0', borderBottom: 'none' }} />
                                            <div style={{ width: '22px', height: '4px', background: '#94a3b8', margin: '0 -2px' }} />
                                            <div style={{ width: '6px', height: '6px', background: 'red', borderRadius: '50%', position: 'absolute', top: '-2px', right: '-2px' }} />
                                        </div>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>SA</div>
                                    </div>
                                </div>

                                {/* Greeting */}
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '15px', lineHeight: '1.4' }}>
                                    Bem-vindo de volta! Aqui está o resumo da sua loja hoje.
                                </div>

                                {/* Date Input Mockup */}
                                <div style={{ background: '#1e293b', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '0.75rem', color: '#94a3b8' }}>
                                    <span>📅</span> 6 de fevereiro de 2026
                                </div>

                                {/* Acesso Rápido */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    <div style={{ color: '#3b82f6' }}>⚡</div>
                                    Acesso Rápido
                                </div>

                                {/* Main Action: Abrir PDV */}
                                <div style={{
                                    background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '15px',
                                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ width: '24px', height: '24px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} />
                                    <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 'bold' }}>Abrir PDV</div>
                                </div>

                                {/* Grid Menu */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1 }}>
                                    {[
                                        { name: 'Nova Venda', icon: '🛒' },
                                        { name: 'Nova O.S.', icon: '🔧' },
                                        { name: 'Novo Cliente', icon: '👤' },
                                        { name: 'Novo Produto', icon: '📦' }
                                    ].map((item, i) => (
                                        <div key={i} style={{
                                            background: '#1e293b',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ color: '#3b82f6', fontSize: '1.2rem' }}>{item.icon}</div>
                                            <div style={{ color: '#e2e8f0', fontSize: '0.7rem', fontWeight: '500' }}>{item.name}</div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Bottom Alert */}
                                <div style={{ marginTop: '15px', background: '#1e293b', padding: '10px', borderRadius: '10px', borderLeft: '4px solid #ff9f43', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#e2e8f0' }}>⚠ Estoque Baixo</span>
                                    <span style={{ fontSize: '0.7rem', color: '#3b82f6' }}>Ver</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Features List */}
                    <div>
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                style={{
                                    background: 'var(--glass)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    gap: '1.5rem',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <div style={{
                                    background: 'linear-gradient(135deg, #ff4d4d 0%, #d93025 100%)', // Using red/orange accent for features like reference
                                    minWidth: '50px',
                                    height: '50px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 10px rgba(217, 48, 37, 0.3)'
                                }}>
                                    <Check color="#fff" size={28} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff' }}>{feature.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SystemShowcase;

import React from 'react';
import { motion } from 'framer-motion';
import { MousePointerClick, Zap, Shield, RefreshCw } from 'lucide-react';

const reasons = [
    {
        icon: <MousePointerClick size={32} />,
        title: "Usabilidade Simples",
        text: "Interfaces intuitivas que não exigem treinamento complexo."
    },
    {
        icon: <Zap size={32} />,
        title: "Tecnologia Moderna",
        text: "Utilizamos as stacks mais atuais do mercado (React, Node, Cloud)."
    },
    {
        icon: <Shield size={32} />,
        title: "Segurança Total",
        text: "Seus dados protegidos com os melhores padrões de segurança."
    },
    {
        icon: <RefreshCw size={32} />,
        title: "Evolução Contínua",
        text: "Sistemas que recebem atualizações constantes e melhorias."
    }
];

const WhyUs = () => {
    return (
        <section className="section" style={{ background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 10% 10%, rgba(112,0,255,0.05) 0%, rgba(0,0,0,0) 50%)',
                pointerEvents: 'none'
            }} />

            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 className="title">Por que a <span className="gradient-text">Kryon Systems</span>?</h2>
                    <p className="subtitle" style={{ margin: '0 auto' }}>
                        Não entregamos apenas código. Entregamos resultados.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem'
                }}>
                    {reasons.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                background: 'var(--glass)',
                                padding: '2rem',
                                borderRadius: '16px',
                                border: '1px solid var(--glass-border)',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{
                                color: 'var(--primary)',
                                marginBottom: '1rem',
                                background: 'rgba(0, 240, 255, 0.1)',
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem auto'
                            }}>
                                {item.icon}
                            </div>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{item.text}</p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default WhyUs;

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Lock, Coins } from 'lucide-react';

const TechDiff = () => {
    return (
        <section id="diferenciais" className="section" style={{ background: 'linear-gradient(180deg, var(--bg-color) 0%, var(--bg-secondary) 100%)' }}>
            <div className="container">
                <div className="tech-diff-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
                    gap: '3rem',
                    alignItems: 'center'
                }}>
                    {/* Left: Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="title">Tecnologia Preparada para o <span className="gradient-text">Futuro</span></h2>
                        <p className="subtitle">
                            Nossas plataformas não resolvem apenas os problemas de hoje. Elas são desenhadas para acompanhar a evolução do mercado e as mudanças regulatórias.
                        </p>

                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {[
                                { icon: <Coins size={22} color="#00f0ff" />, title: "Integração DREX", text: "Preparados para a nova moeda digital brasileira." },
                                { icon: <TrendingUp size={22} color="#7000ff" />, title: "Reforma Tributária", text: "Adequação automática às novas regras fiscais." },
                                { icon: <Lock size={22} color="#00ff88" />, title: "Segurança de Dados", text: "Criptografia avançada e proteção contra falhas." },
                            ].map((item, idx) => (
                                <li key={idx} style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ marginTop: '4px', flexShrink: 0 }}>{item.icon}</div>
                                    <div>
                                        <h4 style={{ fontSize: '1.05rem', marginBottom: '0.2rem', color: '#fff' }}>{item.title}</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>{item.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Right: Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto' }}
                    >
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            backdropFilter: 'blur(10px)',
                            position: 'relative',
                            zIndex: 2,
                            overflow: 'hidden'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', fontSize: '0.85rem' }}>
                                <span style={{ color: '#94a3b8' }}>System Health</span>
                                <span style={{ color: '#00ff88', fontWeight: 'bold' }}>● Stable</span>
                            </div>

                            {/* Fake Code / Metrics */}
                            <div style={{ fontFamily: 'monospace', color: '#ccc', fontSize: '0.8rem', lineHeight: '1.6' }}>
                                <p><span style={{ color: '#c792ea' }}>const</span> status = <span style={{ color: '#ecc48d' }}>"optimized"</span>;</p>
                                <p><span style={{ color: '#82aaff' }}>checkCompliance</span>(TaxRules.<span style={{ color: '#ffcb6b' }}>NEW</span>);</p>
                                <p><span style={{ color: '#89ddff' }}>await</span> DREX.integrate();</p>
                                <br />
                                <div style={{
                                    marginTop: '0.5rem',
                                    height: '4px',
                                    width: '100%',
                                    background: '#1e293b',
                                    borderRadius: '2px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ width: '85%', height: '100%', background: 'var(--primary)' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Glow effect simplified */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '100%',
                            height: '100%',
                            background: 'radial-gradient(circle, rgba(112,0,255,0.1) 0%, rgba(0,0,0,0) 70%)',
                            filter: 'blur(30px)',
                            zIndex: 1
                        }} />
                    </motion.div>
                </div>
            </div>

            <style>{`
                @media (max-width: 968px) {
                    .tech-diff-grid {
                        grid-template-columns: 1fr !important;
                        gap: 2.5rem !important;
                        text-align: center;
                    }
                    .tech-diff-grid ul {
                        align-items: center;
                        text-align: left;
                    }
                    .tech-diff-grid li {
                        max-width: 400px;
                    }
                }
            `}</style>
        </section>
    );
};

export default TechDiff;

import React from 'react';
import { ArrowRight, ChevronRight, Code, Database, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section id="início" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            paddingTop: '80px',
            overflow: 'hidden'
        }}>
            {/* Background Elements */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '10%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(112,0,255,0.15) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(50px)',
                zIndex: -1
            }} />
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '5%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(0,240,255,0.1) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(50px)',
                zIndex: -1
            }} />

            <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        background: 'var(--glass)',
                        borderRadius: '50px',
                        marginBottom: '1.5rem',
                        border: '1px solid var(--glass-border)',
                        fontSize: '0.9rem',
                        color: 'var(--primary)'
                    }}>
                        🚀 Tecnologia que organiza, conecta e escala.
                    </div>

                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: '800',
                        lineHeight: '1.1',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(180deg, #fff 0%, #aaa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Criamos sistemas <br /> <span className="gradient-text">inteligentes</span> para o seu negócio.
                    </h1>

                    <p className="subtitle" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                        Desenvolvemos plataformas web e soluções SaaS para diferentes segmentos,
                        todas preparadas para o futuro digital e a nova realidade tributária do Brasil.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <a href="#segmentos" className="btn btn-primary">
                            Conhecer Soluções <ArrowRight size={18} />
                        </a>
                        <a href="#contact" className="btn btn-outline">
                            Falar com Especialista
                        </a>
                    </div>
                </motion.div>

                {/* Visual/Image Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ position: 'relative' }}
                >
                    {/* Abstract Tech Representation */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '24px',
                        padding: '2rem',
                        position: 'relative'
                    }}>
                        {/* Floating Badge 1 */}
                        className="hero-floating-badge"
                        style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            background: '#1a1a2e',
                            padding: '1rem',
                            borderRadius: '16px',
                            border: '1px solid var(--primary)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            zIndex: 10
                        }}>
                        <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '8px', color: '#000' }}>
                            <Globe size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Status</div>
                            <div style={{ fontWeight: 'bold' }}>Online Global</div>
                        </div>
                    </div>

                    {/* Main Graphic Content - Simplified Code/Dashboard Look */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
                        </div>

                        <div style={{
                            height: '8px', width: '60%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px'
                        }}></div>
                        <div style={{
                            height: '8px', width: '80%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px'
                        }}></div>

                        <div style={{
                            marginTop: '1rem',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem'
                        }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                                <Database size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Cloud Data</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>99.9%</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                                <Code size={24} color="var(--secondary)" style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '0.8rem', color: '#aaa' }}>API Requests</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>2.5k/s</div>
                            </div>
                        </div>

                        <div style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            background: 'rgba(0, 240, 255, 0.05)',
                            borderRadius: '12px',
                            border: '1px dashed var(--primary)',
                            textAlign: 'center',
                            fontSize: '0.9rem',
                            color: 'var(--primary)'
                        }}>
                            System Ready
                        </div>
                    </div>

            </div>
        </motion.div>
            </div >

    <style>{`
        @media (max-width: 968px) {
          .container { grid-template-columns: 1fr !important; text-align: center; }
          h1 { font-size: 2.5rem !important; }
          .subtitle { margin: 0 auto 2rem auto; }
          .btn { justify-content: center; }
          div[style*="display: flex"] { justify-content: center; }
          .hero-floating-badge {
             right: 0 !important;
             top: -40px !important;
             transform: scale(0.9);
          }
        }
      `}</style>
        </section >
    );
};

export default Hero;

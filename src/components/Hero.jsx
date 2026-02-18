import { ArrowRight, ChevronRight, Code, Database, Globe, Rocket } from 'lucide-react';
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

            <div className="container" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))', 
                gap: '4rem', 
                alignItems: 'center',
                position: 'relative',
                zIndex: 1
            }}>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ textAlign: 'inherit' }}
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

                    <h1 className="hero-title" style={{
                        fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
                        fontWeight: '800',
                        lineHeight: '1.1',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(180deg, #fff 0%, #aaa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Criamos sistemas <br /> <span className="gradient-text">inteligentes</span> para o seu negócio.
                    </h1>

                    <p className="subtitle" style={{ fontSize: '1.1rem', lineHeight: '1.8', margin: '0 0 2rem 0' }}>
                        Desenvolvemos plataformas web e soluções SaaS para diferentes segmentos,
                        todas preparadas para o futuro digital e a nova realidade tributária do Brasil.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <a href="https://app.kryonsystems.com.br/trial" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ gap: '10px' }}>
                            Começar Teste Grátis <Rocket size={18} />
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
                    style={{ position: 'relative', width: '100%' }}
                >
                    {/* Monitor Area */}
                    <div className="hero-mockup-wrapper" style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '550px',
                        margin: '0 auto'
                    }}>
                        {/* Desktop Monitor Mockup */}
                        <div className="hero-monitor" style={{
                            width: '100%',
                            aspectRatio: '16/10',
                            background: '#1a1a2e',
                            border: '10px solid #333',
                            borderRadius: '16px',
                            position: 'relative',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
                            display: 'flex',
                            flexDirection: 'column',
                            transform: 'perspective(1500px) rotateY(-10deg) rotateX(2deg)',
                            overflow: 'hidden'
                        }}>
                             {/* Dashboard Content Mockup */}
                             <div style={{ flex: 1, padding: '1rem', background: '#0f172a', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ width: '80px', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                                    <div style={{ width: '24px', height: '24px', background: '#3b82f6', borderRadius: '50%' }}></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} style={{ height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}></div>
                                    ))}
                                </div>
                                <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}></div>
                             </div>
                        </div>

                        {/* Monitor Stand */}
                        <div className="hero-monitor-stand" style={{
                            width: '100px',
                            height: '30px',
                            background: '#222',
                            margin: '-2px auto 0',
                            clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
                            transform: 'perspective(1500px) rotateY(-10deg)'
                        }} />

                        {/* Mobile Phone Mockup */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="hero-phone"
                            style={{
                                position: 'absolute',
                                bottom: '-20px',
                                right: '-10px',
                                width: '150px',
                                height: '300px',
                                background: '#000',
                                border: '6px solid #333',
                                borderRadius: '24px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                zIndex: 10,
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ height: '15px', width: '50px', background: '#333', margin: '0 auto', borderRadius: '0 0 8px 8px' }}></div>
                            <div style={{ padding: '0.75rem', height: '100%', background: '#0f172a', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ width: '100%', height: '30px', background: '#3b82f6', borderRadius: '6px' }}></div>
                                <div style={{ width: '80%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}></div>
                                <div style={{ width: '60%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    {[1, 2, 3, 4].map(i => <div key={i} style={{ height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>)}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div >

            <style>{`
        @media (max-width: 968px) {
          .container { grid-template-columns: 1fr !important; text-align: center; gap: 3rem !important; }
          .hero-title { font-size: 2.2rem !important; }
          .subtitle { margin: 0 auto 2rem auto !important; }
          div[style*="display: flex"] { justify-content: center; }
          .hero-mockup-wrapper { margin-top: 2rem; }
          .hero-monitor { transform: none !important; border-width: 6px !important; }
          .hero-monitor-stand { display: none; }
          .hero-phone { 
            width: 130px !important; 
            height: 260px !important; 
            right: 0px !important; 
            bottom: -30px !important; 
            transform: none !important; 
          }
        }
        @media (max-width: 480px) {
          .hero-title { font-size: 1.8rem !important; }
          .hero-phone { display: none; }
          .hero-mockup-wrapper { max-width: 100%; }
        }
      `}</style>
        </section >
    );
};

export default Hero;

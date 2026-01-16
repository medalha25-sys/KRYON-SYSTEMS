import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

const Contact = () => {
    const [formStatus, setFormStatus] = useState('idle'); // idle, sending, success, error

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormStatus('sending');
        // Simulate sending
        setTimeout(() => {
            setFormStatus('success');
        }, 1500);
    };

    return (
        <section id="contact" className="section" style={{ position: 'relative' }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(112,0,255,0.1) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(60px)',
                zIndex: -1
            }} />

            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 className="title">Fale com um <span className="gradient-text">Especialista</span></h2>
                    <p className="subtitle" style={{ margin: '0 auto' }}>
                        Pronto para escalar seu negócio? Entre em contato e vamos construir o futuro juntos.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4rem',
                    alignItems: 'start'
                }}>

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Canais de Atendimento</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
                            Nossa equipe está pronta para entender sua necessidade e propor a melhor solução tecnológica.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
                                    <MessageSquare size={24} color="#25D366" />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem' }}>WhatsApp Comercial</h4>
                                    <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>(31) 99999-9999</a>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
                                    <Mail size={24} color="#00f0ff" />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem' }}>E-mail</h4>
                                    <p style={{ color: 'var(--text-muted)' }}>contato@kryonsystems.com.br</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
                                    <MapPin size={24} color="#7000ff" />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem' }}>Localização</h4>
                                    <p style={{ color: 'var(--text-muted)' }}>São Paulo, Brasil - Atendimento Global</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        style={{
                            background: 'var(--glass)',
                            padding: '2.5rem',
                            borderRadius: '20px',
                            border: '1px solid var(--glass-border)',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>Seu Nome</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: João Silva"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'rgba(0,0,0,0.3)',
                                        color: '#fff',
                                        outline: 'none',
                                        fontSize: '1rem'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>Empresa</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Minha Loja Ltda"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'rgba(0,0,0,0.3)',
                                        color: '#fff',
                                        outline: 'none',
                                        fontSize: '1rem'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>Mensagem</label>
                                <textarea
                                    rows="4"
                                    required
                                    placeholder="Gostaria de saber mais sobre..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'rgba(0,0,0,0.3)',
                                        color: '#fff',
                                        outline: 'none',
                                        fontSize: '1rem',
                                        resize: 'vertical'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ justifyContent: 'center', marginTop: '1rem' }}
                                disabled={formStatus === 'sending' || formStatus === 'success'}
                            >
                                {formStatus === 'idle' && <>Enviar Mensagem <Send size={18} /></>}
                                {formStatus === 'sending' && <>Enviando...</>}
                                {formStatus === 'success' && <>Mensagem Enviada! ✅</>}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .container > div[className!="container"] {
             grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </section>
    );
};

export default Contact;

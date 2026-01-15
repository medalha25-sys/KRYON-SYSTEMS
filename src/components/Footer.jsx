import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            background: '#020203',
            padding: '4rem 0 2rem 0',
            borderTop: '1px solid #111'
        }}>
            <div className="container">
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '2rem',
                    marginBottom: '3rem'
                }}>
                    {/* Brand */}
                    <div style={{ maxWidth: '300px' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                            Kryon <span className="gradient-text">Systems</span>
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Tecnologia que organiza, conecta e escala negócios. Preparando sua empresa para o futuro.
                        </p>
                    </div>

                    {/* Links */}
                    <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                        <div>
                            <h4 style={{ color: '#fff', marginBottom: '1rem' }}>Empresa</h4>
                            <ul style={{ listStyle: 'none', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Sobre</a></li>
                                <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Carreiras</a></li>
                                <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Contato</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ color: '#fff', marginBottom: '1rem' }}>Legal</h4>
                            <ul style={{ listStyle: 'none', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Termos de Uso</a></li>
                                <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Privacidade</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid #111',
                    paddingTop: '2rem',
                    textAlign: 'center',
                    color: '#444',
                    fontSize: '0.8rem'
                }}>
                    &copy; 2026 Kryon Systems. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
};

export default Footer;

import React, { useState, useEffect } from 'react';
import { Menu, X, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        padding: '1.5rem 0',
        transition: 'all 0.3s ease',
        background: isScrolled ? 'rgba(5, 5, 7, 0.8)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.1)' : 'none'
      }}
    >
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo */}
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: 'inherit' }} onClick={() => window.scrollTo(0, 0)}>
          <img src="/logo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
          <span>Kryon <span className="gradient-text">Systems</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="desktop-menu" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {[
            { name: 'Quem Somos', link: '#quem-somos' },
            { name: 'Sistemas', link: '#sistemas' },
            { name: 'Diferenciais', link: '#contato' } // Mapping 'Contato' or 'Diferenciais'
          ].map((item) => (
            <a
              key={item.name}
              href={item.link}
              style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem', opacity: 0.8, transition: 'opacity 0.2s' }}
              onMouseOver={(e) => e.target.style.opacity = 1}
              onMouseOut={(e) => e.target.style.opacity = 0.8}
            >
              {item.name}
            </a>
          ))}
          <a href="https://app.kryonsystems.com.br/login" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold', marginLeft: '20px' }}>
            Já sou cliente
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          className="mobile-toggle"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          background: '#0a0a12',
          padding: '2rem',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {[
            { name: 'Quem Somos', link: '#quem-somos' },
            { name: 'Sistemas', link: '#sistemas' },
            { name: 'Diferenciais', link: '#contato' }
          ].map((item) => (
            <a
              key={item.name}
              href={item.link}
              onClick={() => setIsOpen(false)}
              style={{ color: '#fff', textDecoration: 'none', fontSize: '1.1rem' }}
            >
              {item.name}
            </a>
          ))}

        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

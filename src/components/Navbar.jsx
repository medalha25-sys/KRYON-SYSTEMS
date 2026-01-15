import React, { useState, useEffect } from 'react';
import { Menu, X, Rocket } from 'lucide-react';

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>K</span>
          </div>
          <span>Kryon <span className="gradient-text">Systems</span></span>
        </div>

        {/* Desktop Links */}
        <div className="desktop-menu" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {['Início', 'Soluções', 'Segmentos', 'Diferenciais'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem', opacity: 0.8, transition: 'opacity 0.2s' }}
              onMouseOver={(e) => e.target.style.opacity = 1}
              onMouseOut={(e) => e.target.style.opacity = 0.8}
            >
              {item}
            </a>
          ))}
          <a href="#contact" className="btn btn-primary" style={{ padding: '8px 20px' }}>
            Falar com Especialista
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
           {['Início', 'Soluções', 'Segmentos', 'Diferenciais'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              onClick={() => setIsOpen(false)}
              style={{ color: '#fff', textDecoration: 'none', fontSize: '1.1rem' }}
            >
              {item}
            </a>
          ))}
          <a href="#contact" className="btn btn-primary" onClick={() => setIsOpen(false)}>
            Falar com Especialista
          </a>
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

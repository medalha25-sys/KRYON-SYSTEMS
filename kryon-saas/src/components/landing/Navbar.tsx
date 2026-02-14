'use client'

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

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

  const menuItems = [
    { name: 'Quem Somos', link: '#quem-somos' },
    { name: 'Sistemas', link: '#sistemas' },
    { name: 'Diferenciais', link: '#contato' } 
  ]

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
      <div className="container mx-auto px-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold no-underline text-inherit" onClick={() => window.scrollTo(0, 0)}>
          {/* Replaced img with div/text for now or use next/image if logo.png exists in new public */}
          {/* <img src="/logo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} /> */} 
          <span>Kryon <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Systems</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 items-center">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.link}
              className="text-white text-sm opacity-80 hover:opacity-100 transition-opacity no-underline"
            >
              {item.name}
            </Link>
          ))}
          <Link href="/login" className="text-white text-sm font-bold ml-5 no-underline">
            Já sou cliente
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden bg-transparent border-none text-white cursor-pointer"
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
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.link}
              onClick={() => setIsOpen(false)}
              className="text-white text-lg no-underline"
            >
              {item.name}
            </Link>
          ))}
           <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Já sou cliente
            </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { Menu, X, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'Quem Somos', link: '/#quem-somos' },
    { name: 'Sistemas', link: '/#sistemas' },
    { name: 'Diferenciais', link: '/#diferenciais' },
    { name: 'Preços', link: '/#precos' },
    { name: 'Contato', link: '/#contato' }
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-500 ${
        isScrolled 
          ? 'bg-background/85 backdrop-blur-xl border-b border-white/10 py-2.5 sm:py-3 shadow-2xl' 
          : 'bg-transparent py-4 sm:py-6'
      }`}
    >
      <div className="container-custom flex justify-between items-center text-white">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 sm:gap-3 no-underline group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight">
            Kryon <span className="text-gradient">Systems</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex gap-10 items-center">
            <div className="flex gap-8 items-center mr-4">
                {menuItems.map((item) => (
                    <a
                        key={item.name}
                        href={item.link}
                        className="text-sm font-medium text-gray-400 hover:text-white transition-colors no-underline relative group"
                    >
                        {item.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                    </a>
                ))}
            </div>
            
            <div className="flex items-center gap-4 border-l border-white/10 pl-8">
                <a 
                    href="https://app.kryonsystems.com.br/login" 
                    className="text-sm font-semibold text-gray-300 hover:text-white transition-colors no-underline"
                >
                    Entrar
                </a>
                <a 
                    href="https://app.kryonsystems.com.br/trial" 
                    className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-white/10 active:scale-95 no-underline"
                >
                    Teste Grátis
                </a>
            </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
          className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 top-[58px] sm:top-[68px] bg-background/95 backdrop-blur-2xl lg:hidden transition-all duration-300 overflow-y-auto ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-4 p-6 border-t border-white/10 min-h-[calc(100vh-68px)]">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.link}
              onClick={() => setIsOpen(false)}
              className="text-lg sm:text-xl font-bold text-white no-underline border-b border-white/5 pb-3"
            >
              {item.name}
            </a>
          ))}
          
          <div className="flex flex-col gap-3 mt-auto pt-6">
             <a 
                href="https://app.kryonsystems.com.br/login" 
                className="w-full py-3.5 text-center font-bold text-gray-300 border border-white/10 rounded-xl no-underline text-sm"
              >
                Já sou cliente
              </a>
              <a 
                href="https://app.kryonsystems.com.br/trial" 
                className="w-full py-4 text-center font-extrabold bg-blue-600 rounded-xl text-white shadow-xl shadow-blue-900/40 no-underline text-sm sm:text-base"
              >
                Começar agora (30 Dias Grátis)
              </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

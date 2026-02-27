'use client'

import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer style={{
            background: '#020203',
            padding: '4rem 0 2rem 0',
            borderTop: '1px solid #111'
        }}>
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                    {/* Brand */}
                    <div className="max-w-xs">
                        <h3 className="text-2xl font-bold mb-4 text-white">
                            Kryon <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Systems</span>
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Tecnologia que organiza, conecta e escala negócios. Preparando sua empresa para o futuro.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex gap-12 flex-wrap">
                        <div>
                            <h4 className="text-white font-bold mb-4">Empresa</h4>
                            <ul className="space-y-2 text-gray-500 text-sm">
                                <li><a href="#" className="hover:text-white transition no-underline text-inherit">Sobre</a></li>
                                <li><a href="#" className="hover:text-white transition no-underline text-inherit">Carreiras</a></li>
                                <li><a href="#contact" className="hover:text-white transition no-underline text-inherit">Contato</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-500 text-sm">
                                <li><Link href="/terms" className="hover:text-white transition no-underline text-inherit">Termos de Uso</Link></li>
                                <li><Link href="/privacy" className="hover:text-white transition no-underline text-inherit">Privacidade</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-900 pt-8 text-center text-gray-600 text-xs">
                    &copy; {new Date().getFullYear()} Kryon Systems. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
};

export default Footer;

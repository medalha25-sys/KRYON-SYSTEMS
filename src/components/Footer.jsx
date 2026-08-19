import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-[#030305] py-16 border-t border-white/10 text-slate-400">
            <div className="container-custom">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">
                                Kryon <span className="text-gradient">Systems</span>
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                            Tecnologia de ponta que organiza, conecta e escala negócios. Plataformas web e soluções SaaS preparadas para o futuro.
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Navegação</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><a href="/#quem-somos" className="hover:text-cyan-400 transition-colors no-underline">Sobre Nós</a></li>
                            <li><a href="/#sistemas" className="hover:text-cyan-400 transition-colors no-underline">Sistemas</a></li>
                            <li><a href="/#segmentos" className="hover:text-cyan-400 transition-colors no-underline">Soluções por Nicho</a></li>
                            <li><a href="/#precos" className="hover:text-cyan-400 transition-colors no-underline">Planos e Preços</a></li>
                            <li><a href="/#contato" className="hover:text-cyan-400 transition-colors no-underline">Fale Conosco</a></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Legal & Acesso</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><a href="https://app.kryonsystems.com.br/login" className="text-cyan-400 hover:underline">Área do Cliente</a></li>
                            <li><a href="https://app.kryonsystems.com.br/trial" className="text-white font-semibold hover:text-cyan-300">Testar 30 Dias Grátis</a></li>
                            <li><Link to="/termos" className="hover:text-cyan-400 transition-colors no-underline">Termos de Uso</Link></li>
                            <li><Link to="/privacidade" className="hover:text-cyan-400 transition-colors no-underline">Política de Privacidade</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Kryon Systems. Todos os direitos reservados.</p>
                    <p>CNPJ & Tecnologia 100% Brasileira 🇧🇷</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

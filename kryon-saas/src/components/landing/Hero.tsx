'use client'

import { Rocket, Globe, Database, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

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

            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '50px',
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.9rem',
                        color: '#3b82f6'
                    }}>
                        🚀 Tecnologia que organiza, conecta e escala.
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                        Criamos sistemas <br /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">inteligentes</span> para o seu negócio.
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 mb-8 leading-relaxed">
                        Desenvolvemos plataformas web e soluções SaaS para diferentes segmentos,
                        todas preparadas para o futuro digital e a nova realidade tributária do Brasil.
                    </p>

                    <div className="flex gap-4 flex-wrap">
                        <Link href="#sistemas" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-blue-900/20">
                            Começar Teste Grátis <Rocket size={18} />
                        </Link>
                        <Link href="#contact" className="px-6 py-3 border border-gray-700 text-white rounded-xl font-medium hover:bg-gray-800 transition">
                            Falar com Especialista
                        </Link>
                    </div>
                </motion.div>

                {/* Visual/Image Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative hidden md:block"
                >
                    {/* Monitor Stand */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div className="relative h-[350px] w-full flex items-center justify-center transform scale-90 md:scale-110">
                            {/* Desktop Monitor */}
                            <div style={{
                                width: '100%',
                                maxWidth: '500px',
                                aspectRatio: '16/9',
                                background: '#1a1a2e',
                                border: '10px solid #333',
                                borderRadius: '12px',
                                position: 'relative',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                display: 'flex',
                                flexDirection: 'column',
                                zIndex: 1,
                                transform: 'perspective(1000px) rotateY(-15deg) rotateX(5deg)',
                                transition: 'transform 0.5s ease'
                            }}>
                                {/* Main Area */}
                                <div className="flex-1 p-5 flex flex-col gap-5 bg-slate-900 border-2 border-slate-800 rounded-sm overflow-hidden">
                                    {/* Header Title */}
                                    <div>
                                        <div className="text-sm font-bold text-white mb-1">Visão Geral</div>
                                        <div className="text-[10px] text-gray-400">Bem-vindo de volta! Aqui está o resumo da sua loja.</div>
                                    </div>

                                    {/* Acesso Rápido Section */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3 text-white text-xs font-bold">
                                            <span className="text-blue-500">⚡</span>
                                            Acesso Rápido
                                        </div>
                                        <div className="flex gap-3">
                                            {/* Abrir PDV - Blue Hero Button */}
                                            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg p-3 w-28 flex flex-col items-center justify-center gap-2 shadow-lg shadow-blue-900/30 border border-white/10">
                                                <div className="w-6 h-6 bg-white/20 rounded"></div>
                                                <div className="text-white text-[10px] font-bold">Abrir PDV</div>
                                            </div>

                                            {/* Other Actions */}
                                            {['Nova Venda', 'Nova O.S.', 'Novo Cliente'].map((item, i) => (
                                                <div key={i} className="bg-slate-800/50 rounded-lg p-3 flex-1 flex flex-col items-center justify-center gap-2 border border-white/5">
                                                    <div className="w-5 h-5 rounded-full border-2 border-white/20"></div>
                                                    <div className="text-gray-400 text-[9px]">{item}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bottom Widgets (Estoque / OS) */}
                                    <div className="grid grid-cols-2 gap-4 flex-1">
                                        <div className="bg-slate-800/50 rounded-lg border border-white/5 p-3">
                                            <div className="flex justify-between mb-2">
                                                <div className="text-orange-400 text-[10px] font-bold">⚠ Estoque Baixo</div>
                                                <div className="text-blue-500 text-[8px]">Ver estoque</div>
                                            </div>
                                            <div className="h-full flex items-center justify-center text-gray-500 text-[9px] italic">
                                                Nenhum alerta.
                                            </div>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-lg border border-white/5 p-3">
                                            <div className="flex justify-between mb-2">
                                                <div className="text-white text-[10px] font-bold">🔧 Últimas O.S.</div>
                                                <div className="text-blue-500 text-[8px]">Ver todas</div>
                                            </div>
                                            <div className="h-full flex items-center justify-center text-gray-500 text-[9px] italic">
                                                Nenhuma ordem.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Monitor Stand */}
                            <div style={{
                                position: 'absolute',
                                bottom: '-40px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '120px',
                                height: '40px',
                                background: 'linear-gradient(180deg, #333 0%, #111 100%)',
                                clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
                            }} />

                            {/* Mobile Phone */}
                            <motion.div 
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 20, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="absolute bottom-[-20px] right-[-20px] md:right-[-30px] w-[140px] md:w-[160px] h-[300px] md:h-[350px] bg-black border-[5px] border-slate-800 rounded-3xl z-10 shadow-2xl overflow-hidden"
                            >
                                {/* Mobile Screen Content */}
                                <div className="p-3 h-full bg-slate-900 text-white flex flex-col text-left">
                                    {/* Header */}
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="w-5 h-0.5 bg-slate-500 shadow-[0_6px_0_#64748b,0_-6px_0_#64748b]"></div>
                                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[8px] font-bold">SA</div>
                                    </div>

                                    {/* Greeting */}
                                    <div className="text-[8px] text-slate-400 mb-2 leading-relaxed">
                                        Resumo da loja.
                                    </div>

                                    {/* Date Input Mockup */}
                                    <div className="bg-slate-800 rounded-lg p-1.5 flex items-center gap-1 mb-3 text-[8px] text-slate-400">
                                        <span>📅</span> 06/02/26
                                    </div>

                                    {/* Acesso Rápido */}
                                    <div className="flex items-center gap-1 mb-2 text-white text-[9px] font-bold">
                                        <span className="text-blue-500">⚡</span>
                                        Rápido
                                    </div>

                                    {/* Main Action: Abrir PDV */}
                                    <div className="bg-gradient-to-b from-blue-500 to-blue-700 rounded-lg p-2 mb-2 shadow-lg flex flex-col items-center gap-1 text-center">
                                        <div className="w-4 h-4 bg-white/20 rounded"></div>
                                        <div className="text-white text-[9px] font-bold">PDV</div>
                                    </div>

                                    {/* Grid Menu */}
                                    <div className="grid grid-cols-2 gap-1 flex-1">
                                        {[
                                            { name: 'Venda', icon: '🛒' },
                                            { name: 'O.S.', icon: '🔧' },
                                            { name: 'Cliente', icon: '👤' },
                                            { name: 'Prod', icon: '📦' }
                                        ].map((item, i) => (
                                            <div key={i} className="bg-slate-800 p-1 rounded-lg flex flex-col gap-1 items-center justify-center border border-white/5">
                                                <div className="text-blue-500 text-xs">{item.icon}</div>
                                                <div className="text-slate-200 text-[7px] font-medium">{item.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                </motion.div>
            </div >
        </section >
    );
};

export default Hero;

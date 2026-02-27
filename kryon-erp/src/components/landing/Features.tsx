'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const features = [
    {
        title: "Vendas Rápidas e Completas",
        description: "Faça vendas rapidamente, controle as comissões dos vendedores, recebimentos e muito mais!"
    },
    {
        title: "PDV com Leitor de Código de Barras",
        description: "PDV rápido compatível com leitores de códigos de barras para agilizar suas vendas."
    },
    {
        title: "Orçamentos e Pré-Vendas",
        description: "Opção de orçamento e pré-vendas com observação nas vendas ou individualmente nos produtos."
    },
    {
        title: "Pagamento via PIX",
        description: "Ofereça aos seus clientes maior comodidade e facilidade com pagamentos via QR Code PIX."
    }
];

const Features = () => {
    return (
        <section className="py-24 overflow-hidden bg-[#050507]">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    {/* Left Column: Mockups */}
                    <div className="relative h-[400px] flex items-center justify-center transform scale-90 md:scale-100">
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
                            <div className="flex-1 p-5 flex flex-col gap-5 bg-slate-900 border-2 border-slate-800 rounded-sm">
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
                            className="absolute bottom-[-40px] right-[-30px] md:right-[-40px] w-[180px] md:w-[220px] h-[400px] md:h-[450px] bg-black border-[6px] border-slate-800 rounded-3xl z-10 shadow-2xl overflow-hidden"
                        >
                            {/* Mobile Screen Content */}
                            <div className="p-4 h-full bg-slate-900 text-white flex flex-col text-left">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-4">
                                    <div className="w-5 h-0.5 bg-slate-500 shadow-[0_6px_0_#64748b,0_-6px_0_#64748b]"></div>
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">SA</div>
                                </div>

                                {/* Greeting */}
                                <div className="text-[10px] text-slate-400 mb-3 leading-relaxed">
                                    Bem-vindo de volta! Aqui está o resumo da sua loja hoje.
                                </div>

                                {/* Date Input Mockup */}
                                <div className="bg-slate-800 rounded-lg p-2 flex items-center gap-2 mb-4 text-[10px] text-slate-400">
                                    <span>📅</span> 6 de fevereiro de 2026
                                </div>

                                {/* Acesso Rápido */}
                                <div className="flex items-center gap-2 mb-3 text-white text-[12px] font-bold">
                                    <span className="text-blue-500">⚡</span>
                                    Acesso Rápido
                                </div>

                                {/* Main Action: Abrir PDV */}
                                <div className="bg-gradient-to-b from-blue-500 to-blue-700 rounded-xl p-3 mb-3 shadow-lg flex flex-col items-center gap-2 text-center">
                                    <div className="w-5 h-5 bg-white/20 rounded"></div>
                                    <div className="text-white text-[12px] font-bold">Abrir PDV</div>
                                </div>

                                {/* Grid Menu */}
                                <div className="grid grid-cols-2 gap-2 flex-1">
                                    {[
                                        { name: 'Nova Venda', icon: '🛒' },
                                        { name: 'Nova O.S.', icon: '🔧' },
                                        { name: 'Novo Cliente', icon: '👤' },
                                        { name: 'Novo Produto', icon: '📦' }
                                    ].map((item, i) => (
                                        <div key={i} className="bg-slate-800 p-2 rounded-xl flex flex-col gap-2 items-center justify-center border border-white/5">
                                            <div className="text-blue-500 text-sm">{item.icon}</div>
                                            <div className="text-slate-200 text-[9px] font-medium">{item.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Features List */}
                    <div>
                         <div className="mb-12">
                            <h2 className="text-3xl font-bold mb-4">Funcionalidades <span className="text-blue-500">Poderosas</span></h2>
                            <p className="text-gray-400">
                                Tudo o que você precisa para gerenciar seu negócio em um só lugar.
                            </p>
                        </div>
                        
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 flex gap-6 items-start hover:bg-white/10 transition-colors backdrop-blur-sm"
                            >
                                <div className="bg-gradient-to-br from-red-500 to-red-700 min-w-[50px] h-[50px] rounded-xl flex items-center justify-center shadow-lg shadow-red-900/30">
                                    <Check className="text-white w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;

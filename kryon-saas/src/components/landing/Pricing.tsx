'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const Pricing = () => {
    // State
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'semestral'>('semestral');
    const [wantsFiscal, setWantsFiscal] = useState(false);
    const [fiscalTier, setFiscalTier] = useState(0); // 0: 100 notas, 1: 200 notas, 2: 500 notas

    // Configuration
    const fiscalOptions = [
        { count: 100, price: 49 },
        { count: 200, price: 79 },
        { count: 500, price: 149 }
    ];

    // Base Prices
    const basePrices = {
        semestral: { basic: 38.32, essential: 59.92, pro: 77.59 },
        monthly: { basic: 47.90, essential: 74.90, pro: 96.99 }
    };

    const getPrice = (plan: 'basic' | 'essential' | 'pro') => {
        const base = basePrices[billingCycle][plan];
        const fiscal = wantsFiscal ? fiscalOptions[fiscalTier].price : 0;
        return (base + fiscal).toFixed(2).replace('.', ',');
    };

    const getTotalSemestral = (plan: 'basic' | 'essential' | 'pro') => {
        const base = basePrices['semestral'][plan];
        const fiscal = wantsFiscal ? fiscalOptions[fiscalTier].price : 0;
        return ((base + fiscal) * 6).toFixed(2).replace('.', ',');
    };

    return (
        <section id="precos" className="py-24 relative overflow-hidden bg-[#050507]">
             {/* Background Effects */}
             <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(112,0,255,0.05) 0%, rgba(0,0,0,0) 70%)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos e <span className="text-blue-500">Preços</span></h2>
                    <p className="text-gray-400">
                        Transparência total. Sem custos escondidos.
                    </p>
                </div>

                {/* Controls Container */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto mb-12 flex flex-col items-center gap-8 backdrop-blur-sm">
                    {/* 1. Cycle Toggle */}
                    <div className="flex items-center gap-4">
                        <span 
                            className={`cursor-pointer transition-colors ${billingCycle === 'monthly' ? 'text-white font-bold' : 'text-gray-500'}`}
                            onClick={() => setBillingCycle('monthly')}
                        >
                            Mensal
                        </span>
                        <div 
                            onClick={() => setBillingCycle(billingCycle === 'semestral' ? 'monthly' : 'semestral')}
                            className={`w-14 h-8 rounded-full relative cursor-pointer transition-colors ${billingCycle === 'semestral' ? 'bg-blue-600' : 'bg-white/10'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all shadow-md ${billingCycle === 'semestral' ? 'left-7' : 'left-1'}`} />
                        </div>
                        <span 
                            className={`cursor-pointer transition-colors ${billingCycle === 'semestral' ? 'text-white font-bold' : 'text-gray-500'}`}
                            onClick={() => setBillingCycle('semestral')}
                        >
                            Semestral <span className="text-xs text-blue-400 border border-blue-400 rounded px-1 ml-1">-20% OFF</span>
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-white/10" />

                    {/* 2. Fiscal Controls */}
                    <div className="flex flex-wrap justify-center items-center gap-8 w-full">
                        {/* Toggle Fiscal */}
                        <div className="flex items-center gap-4">
                            <div 
                                onClick={() => setWantsFiscal(!wantsFiscal)}
                                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${wantsFiscal ? 'bg-blue-600' : 'bg-white/10'}`}
                            >
                                <div className={`w-5 h-5 rounded-full absolute top-0.5 transition-all ${wantsFiscal ? 'bg-white left-6.5' : 'bg-white left-0.5'}`} style={{ left: wantsFiscal ? '26px' : '2px' }} />
                            </div>
                            <span className="text-white font-medium text-sm md:text-base">Desejo emitir notas (NF-e/NFC-e)</span>
                        </div>

                        {/* Note Packs */}
                        <AnimatePresence>
                            {wantsFiscal && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex gap-2"
                                >
                                    {fiscalOptions.map((opt, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => setFiscalTier(idx)}
                                            className={`border rounded-lg px-4 py-2 cursor-pointer text-center transition-all ${fiscalTier === idx ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:bg-white/5'}`}
                                        >
                                            <div className={`font-bold text-sm ${fiscalTier === idx ? 'text-blue-400' : 'text-gray-400'}`}>{opt.count} Notas</div>
                                            <div className="text-xs text-gray-500">R$ {opt.price}/mês</div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* PLAN: BASIC */}
                    <PlanCard 
                        name="Básico"
                        cycle={billingCycle}
                        price={getPrice('basic')}
                        basePrice={basePrices[billingCycle].basic}
                        fiscalPrice={wantsFiscal ? fiscalOptions[fiscalTier].price : 0}
                        totalSix={getTotalSemestral('basic')}
                        features={[
                            "Cadastro de clientes: 100",
                            "Cadastro de produtos: 500",
                            "Contas a receber",
                            "Frente de caixa PDV",
                            "Controle de Vendas",
                            "1 Usuário"
                        ]}
                    />

                     {/* PLAN: ESSENTIAL */}
                     <PlanCard 
                        name="Essencial"
                        cycle={billingCycle}
                        price={getPrice('essential')}
                        basePrice={basePrices[billingCycle].essential}
                        fiscalPrice={wantsFiscal ? fiscalOptions[fiscalTier].price : 0}
                        totalSix={getTotalSemestral('essential')}
                        highlight
                        features={[
                            "Cadastro de clientes: Ilimitado",
                            "Cadastro de produtos: 2.000",
                            "Contas a pagar e receber",
                            "Catálogo Digital Grátis!",
                            "Importação XML",
                            "3 Usuários"
                        ]}
                    />

                     {/* PLAN: PRO */}
                     <PlanCard 
                        name="Pro"
                        cycle={billingCycle}
                        price={getPrice('pro')}
                        basePrice={basePrices[billingCycle].pro}
                        fiscalPrice={wantsFiscal ? fiscalOptions[fiscalTier].price : 0}
                        totalSix={getTotalSemestral('pro')}
                        features={[
                            "Cadastro de clientes: Ilimitado",
                            "Cadastro de produtos: Ilimitado",
                            "Contas a pagar e receber",
                            "Catálogo Digital Grátis!",
                            "Controle de Ordens de Serviço",
                            "Usuários Ilimitados"
                        ]}
                    />
                </div>
            </div>
        </section>
    );
};

// Subcomponent
const PlanCard = ({ name, cycle, price, basePrice, fiscalPrice, totalSix, features, highlight }: any) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`rounded-2xl p-8 relative flex flex-col border transition-all duration-300 ${
            highlight 
            ? 'bg-gradient-to-br from-blue-900/40 to-black border-blue-500 shadow-xl shadow-blue-900/20' 
            : 'bg-[#0f172a] border-gray-800'
        }`}
    >
        {highlight && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                Mais Vendido
            </div>
        )}

        <div className="text-center mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
                Plano {name} {cycle === 'semestral' ? 'Semestral' : 'Mensal'}
            </h3>
            {cycle === 'semestral' && (
                <p className="text-xs text-gray-500 mb-4">(COBRADO A CADA 6 MESES)</p>
            )}

            <div className="my-6">
                <span className="text-sm text-gray-500">
                    {cycle === 'semestral' ? 'Por apenas 6x' : 'Mensalidade'}
                </span>
                <div className={`text-5xl font-bold leading-none mt-2 ${highlight ? 'text-blue-400' : 'text-white'}`}>
                    <span className="text-2xl align-top mr-1">R$</span>
                    {price}
                </div>
                
                {/* Breakdown Logic */}
                <div className="flex justify-center gap-2 text-xs text-gray-500 mt-3">
                    <span>Plano: R$ {basePrice.toFixed(2).replace('.', ',')}</span>
                    {fiscalPrice > 0 && (
                        <>
                            <span>+</span>
                            <span className="text-blue-400">Fiscal: R$ {fiscalPrice.toFixed(2).replace('.', ',')}/mês</span>
                        </>
                    )}
                </div>
            </div>

            {cycle === 'semestral' && (
                <div className="text-sm text-white font-medium">
                   Ou R$ {totalSix} à vista
                </div>
            )}
        </div>

        <div className="w-full h-px bg-white/10 mb-8" />

        <ul className="space-y-4 mb-8 flex-1">
            {features.map((feat: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                    <Check size={16} className={highlight ? 'text-blue-400' : 'text-gray-500'} />
                    {feat}
                </li>
            ))}
        </ul>

        <a 
            href="https://app.kryonsystems.com.br/register" // Todo: Update this link to new register route?
            className={`w-full py-3 rounded-xl font-bold text-center transition text-sm uppercase tracking-wider ${
                highlight 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50' 
                : 'bg-transparent border border-white/20 hover:bg-white/5 text-white'
            }`}
        >
            Assinar Agora
        </a>
    </motion.div>
);

export default Pricing;

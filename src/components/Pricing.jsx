import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, HelpCircle, FileText } from 'lucide-react';

const Pricing = () => {
    // State
    const [billingCycle, setBillingCycle] = useState('semestral'); // 'monthly' | 'semestral'
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
        semestral: { basic: 23.92, essential: 39.99, pro: 47.99 },
        monthly: { basic: 29.90, essential: 49.99, pro: 59.99 }
    };

    const getPrice = (plan) => {
        const base = basePrices[billingCycle][plan];
        const fiscal = wantsFiscal ? fiscalOptions[fiscalTier].price : 0;
        return (base + fiscal).toFixed(2).replace('.', ',');
    };

    const getTotalSemestral = (plan) => {
        const base = basePrices['semestral'][plan];
        const fiscal = wantsFiscal ? fiscalOptions[fiscalTier].price : 0;
        return ((base + fiscal) * 6).toFixed(2).replace('.', ',');
    };

    return (
        <section className="section py-16 md:py-24 bg-[#08080c] relative overflow-hidden" id="precos">
             {/* Background Effects */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(112,0,255,0.06)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

            <div className="container-custom relative z-10">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="title text-3xl sm:text-4xl md:text-5xl">Planos e Preços</h2>
                    <p className="subtitle mx-auto text-base sm:text-lg mt-3 text-slate-400 max-w-2xl">
                        Transparência total. Escolha o plano ideal para a sua empresa sem custos escondidos.
                    </p>

                    {/* Controls Container */}
                    <div className="card max-w-3xl mx-auto mt-8 mb-12 p-6 sm:p-8 flex flex-col items-center gap-6">
                        {/* 1. Cycle Toggle */}
                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center text-sm sm:text-base">
                            <span 
                                className={`cursor-pointer transition-colors ${billingCycle === 'monthly' ? 'text-white font-bold' : 'text-slate-400'}`} 
                                onClick={() => setBillingCycle('monthly')}
                            >
                                Mensal
                            </span>
                            <div 
                                onClick={() => setBillingCycle(billingCycle === 'semestral' ? 'monthly' : 'semestral')}
                                className="w-14 h-7 bg-white/10 rounded-full relative cursor-pointer transition-all"
                                style={{
                                    backgroundColor: billingCycle === 'semestral' ? '#00f0ff' : 'rgba(255,255,255,0.1)'
                                }}
                            >
                                <div 
                                    className="w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-md"
                                    style={{
                                        left: billingCycle === 'semestral' ? '30px' : '4px',
                                        backgroundColor: billingCycle === 'semestral' ? '#050507' : '#ffffff'
                                    }}
                                />
                            </div>
                            <span 
                                className={`cursor-pointer transition-colors flex items-center gap-1.5 ${billingCycle === 'semestral' ? 'text-white font-bold' : 'text-slate-400'}`} 
                                onClick={() => setBillingCycle('semestral')}
                            >
                                Semestral 
                                <span className="text-[11px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                                    -20% OFF
                                </span>
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-px bg-white/10" />

                        {/* 2. Fiscal Controls */}
                        <div className="flex flex-col items-center gap-4 w-full">
                            {/* Toggle Fiscal */}
                            <div className="flex items-center gap-3 text-left cursor-pointer" onClick={() => setWantsFiscal(!wantsFiscal)}>
                                <div 
                                    className="w-11 h-6 rounded-full relative transition-all flex-shrink-0"
                                    style={{
                                        backgroundColor: wantsFiscal ? '#00f0ff' : 'rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <div 
                                        className="w-4 h-4 rounded-full absolute top-1 transition-all"
                                        style={{
                                            left: wantsFiscal ? '24px' : '4px',
                                            backgroundColor: wantsFiscal ? '#050507' : '#ffffff'
                                        }}
                                    />
                                </div>
                                <span className="text-white text-sm sm:text-base font-medium">Desejo emitir notas fiscais (NF-e / NFC-e)</span>
                            </div>

                            {/* Note Packs */}
                            <AnimatePresence>
                                {wantsFiscal && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex gap-2.5 sm:gap-3 flex-wrap justify-center w-full mt-2"
                                    >
                                        {fiscalOptions.map((opt, idx) => (
                                            <div 
                                                key={idx}
                                                onClick={() => setFiscalTier(idx)}
                                                className={`p-3 rounded-xl cursor-pointer text-center transition-all flex-1 min-w-[90px] border ${
                                                    fiscalTier === idx 
                                                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/10' 
                                                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="font-bold text-xs sm:text-sm">{opt.count} Notas</div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">R$ {opt.price}/mês</div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* PLAN: BASIC */}
                    <PlanCard 
                        name="Básico"
                        slug="basic"
                        cycle={billingCycle}
                        price={getPrice('basic')}
                        basePrice={basePrices[billingCycle].basic}
                        fiscalPrice={wantsFiscal ? fiscalOptions[fiscalTier].price : 0}
                        totalSix={getTotalSemestral('basic')}
                        features={[
                            "Cadastro de clientes: 30",
                            "Cadastro de produtos: 100",
                            "Contas a receber",
                            "Frente de caixa PDV",
                            "Controle de Vendas",
                            "1 Usuário"
                        ]}
                    />

                     {/* PLAN: ESSENTIAL */}
                     <PlanCard 
                        name="Essencial"
                        slug="essential"
                        cycle={billingCycle}
                        price={getPrice('essential')}
                        basePrice={basePrices[billingCycle].essential}
                        fiscalPrice={wantsFiscal ? fiscalOptions[fiscalTier].price : 0}
                        totalSix={getTotalSemestral('essential')}
                        highlight
                        features={[
                            "Cadastro de clientes: 100",
                            "Cadastro de produtos: 500",
                            "Agendamento Online",
                            "Contas a pagar e receber",
                            "Catálogo Digital Grátis!",
                            "Importação XML",
                            "3 Usuários"
                        ]}
                    />

                     {/* PLAN: PRO */}
                     <PlanCard 
                        name="Pro"
                        slug="pro"
                        cycle={billingCycle}
                        price={getPrice('pro')}
                        basePrice={basePrices[billingCycle].pro}
                        fiscalPrice={wantsFiscal ? fiscalOptions[fiscalTier].price : 0}
                        totalSix={getTotalSemestral('pro')}
                        features={[
                            "Cadastro de clientes: 1.000",
                            "Cadastro de produtos: 1.000",
                            "Agendamento Online",
                            "Contas a pagar e receber",
                            "Catálogo Digital Grátis!",
                            "Controle de Ordens de Serviço",
                            "Exportação de relatórios em XML",
                            "5 Usuários"
                        ]}
                    />
                </div>
            </div>
        </section>
    );
};

// Subcomponent PlanCard
const PlanCard = ({ name, cycle, price, basePrice, fiscalPrice, totalSix, features, highlight, slug }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`card relative flex flex-col justify-between p-6 sm:p-8 ${
            highlight ? 'border-cyan-400/80 shadow-2xl shadow-cyan-500/10' : ''
        }`}
    >
        {highlight && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-lg">
                MAIS ESCOLHIDO
            </div>
        )}

        <div className="text-center mb-6">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">
                PLANO {name} {cycle === 'semestral' ? 'SEMESTRAL' : 'MENSAL'}
            </h3>
            {cycle === 'semestral' && (
                <p className="text-[11px] text-slate-500 mb-4">(COBRADO A CADA 6 MESES)</p>
            )}

            <div className="my-4">
                <span className="text-xs sm:text-sm text-slate-400">
                    {cycle === 'semestral' ? 'Por apenas 6x' : 'Mensalidade'}
                </span>
                <div className="text-4xl sm:text-5xl font-black text-white my-1 flex items-center justify-center gap-1">
                    <span className="text-xl sm:text-2xl text-slate-400 font-bold">R$</span>
                    {price}
                </div>
                
                {/* Breakdown Logic (Aparece apenas se adicionou notas fiscais) */}
                {fiscalPrice > 0 && (
                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 mt-2 flex-wrap bg-cyan-500/10 border border-cyan-500/20 py-1 px-3 rounded-lg">
                        <span>Plano: R$ {basePrice.toFixed(2).replace('.', ',')}</span>
                        <span>+</span>
                        <span className="text-cyan-300 font-bold">Fiscal: R$ {fiscalPrice.toFixed(2).replace('.', ',')}/mês</span>
                    </div>
                )}
            </div>

            {cycle === 'semestral' && (
                <div className="text-xs sm:text-sm text-cyan-300 font-semibold bg-cyan-500/10 border border-cyan-500/20 py-1.5 px-4 rounded-full inline-block">
                   Total: R$ {totalSix} à vista
                </div>
            )}
        </div>

        <div className="w-full h-px bg-white/10 mb-6" />

        <ul className="space-y-3.5 mb-8 flex-1">
            {features.map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-200 text-xs sm:text-sm">
                    <Check size={16} className="text-emerald-400 flex-shrink-0" />
                    <span>{feat}</span>
                </li>
            ))}
        </ul>

        <a 
            href={`https://app.kryonsystems.com.br/trial?plan=${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-sm sm:text-base text-center transition-all flex items-center justify-center gap-2 no-underline active:scale-[0.98] ${
                highlight 
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-xl shadow-cyan-500/30' 
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-cyan-400/50 shadow-lg'
            }`}
        >
            TESTAR 30 DIAS GRÁTIS
        </a>
    </motion.div>
);

export default Pricing;

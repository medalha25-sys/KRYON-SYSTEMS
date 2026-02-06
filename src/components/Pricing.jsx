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

    // Base Prices (Semestral referenced from print, Monthly simulated as ~20% higher)
    const basePrices = {
        semestral: { basic: 38.32, essential: 59.92, pro: 77.59 },
        monthly: { basic: 47.90, essential: 74.90, pro: 96.99 }
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
        <section className="section" id="precos" style={{ background: 'var(--bg-secondary)', position: 'relative' }}>
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

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 className="title">Planos e Preços</h2>
                    <p className="subtitle" style={{ margin: '0 auto 2rem auto' }}>
                        Transparência total. Sem custos escondidos.
                    </p>

                    {/* Controls Container */}
                    <div style={{ 
                        background: 'var(--glass)', 
                        border: '1px solid var(--glass-border)',
                        borderRadius: '20px',
                        padding: '2rem',
                        maxWidth: '900px',
                        margin: '0 auto 3rem auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2rem'
                    }}>
                        {/* 1. Cycle Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ color: billingCycle === 'monthly' ? '#fff' : 'var(--text-muted)', fontWeight: billingCycle === 'monthly' ? 'bold' : 'normal', cursor: 'pointer' }} onClick={() => setBillingCycle('monthly')}>
                                Mensal
                            </span>
                            <div 
                                onClick={() => setBillingCycle(billingCycle === 'semestral' ? 'monthly' : 'semestral')}
                                style={{
                                    width: '60px',
                                    height: '32px',
                                    background: billingCycle === 'semestral' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                    borderRadius: '32px',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    transition: '0.3s'
                                }}
                            >
                                <div style={{
                                    width: '26px',
                                    height: '26px',
                                    background: '#fff',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '3px',
                                    left: billingCycle === 'semestral' ? '31px' : '3px',
                                    transition: '0.3s',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }} />
                            </div>
                            <span style={{ color: billingCycle === 'semestral' ? '#fff' : 'var(--text-muted)', fontWeight: billingCycle === 'semestral' ? 'bold' : 'normal', cursor: 'pointer' }} onClick={() => setBillingCycle('semestral')}>
                                Semestral <span style={{ fontSize: '0.7em', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>-20% OFF</span>
                            </span>
                        </div>

                        {/* Divider */}
                        <div style={{ width: '100%', height: '1px', background: 'var(--glass-border)' }} />

                        {/* 2. Fiscal Controls */}
                        <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            gap: '2rem',
                            width: '100%'
                        }}>
                            {/* Toggle Fiscal */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div 
                                    onClick={() => setWantsFiscal(!wantsFiscal)}
                                    style={{
                                        width: '50px',
                                        height: '26px',
                                        background: wantsFiscal ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                        borderRadius: '26px',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        transition: '0.3s'
                                    }}
                                >
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        background: wantsFiscal ? '#000' : '#fff',
                                        borderRadius: '50%',
                                        position: 'absolute',
                                        top: '3px',
                                        left: wantsFiscal ? '27px' : '3px',
                                        transition: '0.3s'
                                    }} />
                                </div>
                                <span style={{ color: '#fff', fontWeight: '500' }}>Desejo emitir notas (NF-e/NFC-e)</span>
                            </div>

                            {/* Note Packs */}
                            <AnimatePresence>
                                {wantsFiscal && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        style={{ display: 'flex', gap: '10px' }}
                                    >
                                        {fiscalOptions.map((opt, idx) => (
                                            <div 
                                                key={idx}
                                                onClick={() => setFiscalTier(idx)}
                                                style={{
                                                    border: fiscalTier === idx ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                                                    background: fiscalTier === idx ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                                                    borderRadius: '8px',
                                                    padding: '8px 16px',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    transition: '0.3s'
                                                }}
                                            >
                                                <div style={{ fontWeight: 'bold', color: fiscalTier === idx ? 'var(--primary)' : 'var(--text-muted)' }}>{opt.count} Notas</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>R$ {opt.price}/mês</div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
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

// Subcomponent for cleaner code
const PlanCard = ({ name, cycle, price, basePrice, fiscalPrice, totalSix, features, highlight }) => (
    <motion.div
        whileHover={{ y: -5 }}
        style={{
            background: highlight ? 'linear-gradient(145deg, rgba(112,0,255,0.1), rgba(0,0,0,0.4))' : 'var(--glass)',
            border: highlight ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '2rem',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
        }}
    >
        {highlight && (
            <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--primary)',
                color: '#000',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
            }}>MAIS VENDIDO</div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                PLANO {name} {cycle === 'semestral' ? 'SEMESTRAL' : 'MENSAL'}
            </h3>
            {cycle === 'semestral' && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>(COBRADO A CADA 6 MESES)</p>
            )}

            <div style={{ margin: '1.5rem 0' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {cycle === 'semestral' ? 'Por apenas 6x' : 'Mensalidade'}
                </span>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: highlight ? 'var(--primary)' : '#fff', lineHeight: 1 }}>
                    <span style={{ fontSize: '1.5rem', verticalAlign: 'top', marginRight: '4px' }}>R$</span>
                    {price}
                </div>
                
                {/* Breakdown Logic */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    <span>Plano: R$ {basePrice.toFixed(2).replace('.', ',')}</span>
                    {fiscalPrice > 0 && (
                        <>
                            <span>+</span>
                            <span style={{ color: 'var(--primary)' }}>Fiscal: R$ {fiscalPrice.toFixed(2).replace('.', ',')}/mês</span>
                        </>
                    )}
                </div>
            </div>

            {cycle === 'semestral' && (
                <div style={{ fontSize: '0.9rem', color: '#fff' }}>
                   Ou R$ {totalSix} à vista
                </div>
            )}
        </div>

        <div style={{ height: '1px', background: 'var(--glass-border)', width: '100%', marginBottom: '2rem' }} />

        <ul style={{ listStyle: 'none', marginBottom: '2rem', flex: 1 }}>
            {features.map((feat, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc', marginBottom: '12px', fontSize: '0.95rem' }}>
                    <Check size={16} color={highlight ? 'var(--primary)' : 'var(--text-muted)'} />
                    {feat}
                </li>
            ))}
        </ul>

        <a 
            href="https://app.kryonsystems.com.br/register"
            className="btn btn-primary"
            style={{ 
                width: '100%', 
                justifyContent: 'center', 
                background: highlight ? 'var(--primary)' : 'transparent',
                color: highlight ? '#000' : '#fff',
                border: highlight ? 'none' : '1px solid var(--glass-border)'
            }}
        >
            ASSINAR AGORA
        </a>
    </motion.div>
);

export default Pricing;

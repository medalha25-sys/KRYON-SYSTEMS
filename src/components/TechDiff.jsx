import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Lock, Coins } from 'lucide-react';

const TechDiff = () => {
    return (
        <section id="diferenciais" className="section py-12 sm:py-16 md:py-24" style={{ background: 'linear-gradient(180deg, var(--bg-color) 0%, var(--bg-secondary) 100%)' }}>
            <div className="container-custom">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
                    {/* Left: Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="title text-2xl sm:text-3xl md:text-5xl">
                            Tecnologia Preparada para o <span className="gradient-text">Futuro</span>
                        </h2>
                        <p className="subtitle text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-slate-400">
                            Nossas plataformas não resolvem apenas os problemas de hoje. Elas são desenhadas para acompanhar a evolução do mercado e as mudanças regulatórias.
                        </p>

                        <ul className="space-y-4 sm:space-y-5">
                            {[
                                { icon: <Coins size={22} color="#00f0ff" />, title: "Integração DREX", text: "Preparados para a nova moeda digital brasileira." },
                                { icon: <TrendingUp size={22} color="#7000ff" />, title: "Reforma Tributária", text: "Adequação automática às novas regras fiscais." },
                                { icon: <Lock size={22} color="#00ff88" />, title: "Segurança de Dados", text: "Criptografia avançada e proteção contra falhas." },
                            ].map((item, idx) => (
                                <li key={idx} className="flex gap-3.5 sm:gap-4 items-start">
                                    <div className="mt-1 flex-shrink-0 p-2 rounded-xl bg-white/5 border border-white/5">{item.icon}</div>
                                    <div>
                                        <h4 className="text-sm sm:text-base font-bold text-white mb-0.5">{item.title}</h4>
                                        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{item.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Right: Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative w-full max-w-lg mx-auto"
                    >
                        <div className="glass-card p-4 sm:p-6 border-white/10 relative z-10 overflow-hidden shadow-2xl">
                            <div className="flex justify-between items-center mb-4 sm:mb-6 border-b border-white/10 pb-3 text-xs sm:text-sm">
                                <span className="text-slate-400 font-medium">System Health</span>
                                <span className="text-emerald-400 font-bold flex items-center gap-1.5">● Operacional</span>
                            </div>

                            {/* Fake Code / Metrics */}
                            <div className="font-mono text-slate-300 text-xs sm:text-sm leading-relaxed space-y-1.5 bg-black/40 p-4 rounded-xl border border-white/5">
                                <p><span className="text-purple-400">const</span> status = <span className="text-amber-300">"optimized"</span>;</p>
                                <p><span className="text-blue-400">checkCompliance</span>(TaxRules.<span className="text-yellow-400">NEW</span>);</p>
                                <p><span className="text-cyan-400">await</span> DREX.integrate();</p>
                                
                                <div className="pt-2">
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="w-[92%] h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Glow effect simplified */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(112,0,255,0.1)_0%,rgba(0,0,0,0)_70%)] blur-[40px] pointer-events-none" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default TechDiff;

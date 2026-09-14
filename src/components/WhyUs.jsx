import React from 'react';
import { motion } from 'framer-motion';
import { MousePointerClick, Zap, Shield, RefreshCw } from 'lucide-react';

const reasons = [
    {
        icon: <MousePointerClick size={32} />,
        title: "Usabilidade Simples",
        text: "Interfaces intuitivas que não exigem treinamento complexo."
    },
    {
        icon: <Zap size={32} />,
        title: "Tecnologia Moderna",
        text: "Utilizamos as stacks mais atuais do mercado (React, Node, Cloud)."
    },
    {
        icon: <Shield size={32} />,
        title: "Segurança Total",
        text: "Seus dados protegidos com os melhores padrões de segurança."
    },
    {
        icon: <RefreshCw size={32} />,
        title: "Evolução Contínua",
        text: "Sistemas que recebem atualizações constantes e melhorias."
    }
];

const WhyUs = () => {
    return (
        <section className="section py-12 sm:py-16 md:py-24 bg-[#08080c] relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_10%,rgba(112,0,255,0.05)_0%,rgba(0,0,0,0)_50%)] pointer-events-none" />

            <div className="container-custom relative z-10">
                <div className="text-center mb-8 sm:mb-16">
                    <h2 className="title text-2xl sm:text-3xl md:text-5xl">
                        Por que a <span className="gradient-text">Kryon Systems</span>?
                    </h2>
                    <p className="subtitle mx-auto text-sm sm:text-base md:text-lg mt-2 sm:mt-3 text-slate-400">
                        Não entregamos apenas código. Entregamos resultados.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {reasons.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="card p-5 sm:p-6 text-center flex flex-col items-center justify-start hover:-translate-y-1 transition-all"
                        >
                            <div className="text-cyan-400 mb-4 bg-cyan-500/10 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                {item.icon}
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{item.text}</p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default WhyUs;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
    {
        question: "Eu pago todo mês?",
        answer: "Sim, nossos planos funcionam no modelo de assinatura mensal ou semestral. Isso garante que você tenha sempre o sistema atualizado, suporte incluso e backups automáticos na nuvem, sem taxas surpresas."
    },
    {
        question: "Posso usar sem internet?",
        answer: "O sistema foi desenhado para ser 100% online para garantir que seus dados estejam seguros na nuvem (Amazon AWS). Isso permite que você acesse de qualquer lugar. Uma internet básica de celular já é suficiente para operá-lo com fluidez."
    },
    {
        question: "Preciso instalar algo?",
        answer: "Não! O sistema é 100% Web. Você acessa pelo navegador do seu computador, tablet ou celular, igual a acessar um site ou email. Sem instalações complicadas."
    },
    {
        question: "Tem fidelidade?",
        answer: "Não exigimos fidelidade no plano mensal. Você pode cancelar a qualquer momento. No plano semestral, você ganha desconto em troca do compromisso de 6 meses."
    },
    {
        question: "O sistema emite Nota Fiscal?",
        answer: "Sim! Nos planos Essencial e Pro, você conta com emissor de NFC-e (Cupom Fiscal) e NF-e (Nota Grande), homologado em todos os estados."
    }
];

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="section py-12 sm:py-16 md:py-24 bg-[#08080c] relative">
            <div className="container-custom">
                <div className="text-center mb-8 sm:mb-16">
                    <h2 className="title text-2xl sm:text-3xl md:text-5xl">
                        Perguntas <span className="gradient-text">Frequentes</span>
                    </h2>
                    <p className="subtitle mx-auto text-sm sm:text-base md:text-lg mt-2 sm:mt-3 text-slate-400">
                        Tire suas dúvidas sobre a Kryon Systems.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
                    {faqs.map((item, index) => (
                        <div key={index} className="overflow-hidden">
                            <motion.div
                                onClick={() => toggleAccordion(index)}
                                className={`p-4 sm:p-5 rounded-2xl cursor-pointer flex justify-between items-center transition-all border ${
                                    activeIndex === index 
                                        ? 'bg-white/10 border-cyan-500/30' 
                                        : 'card hover:border-white/20'
                                }`}
                                whileHover={{ scale: 1.005 }}
                            >
                                <div className="flex items-center gap-3 font-semibold text-xs sm:text-base text-white pr-2">
                                    <HelpCircle size={18} className={`flex-shrink-0 ${activeIndex === index ? 'text-cyan-400' : 'text-slate-400'}`} />
                                    {item.question}
                                </div>
                                {activeIndex === index ? (
                                    <ChevronUp size={18} className="text-cyan-400 flex-shrink-0" />
                                ) : (
                                    <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />
                                )}
                            </motion.div>

                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 sm:p-5 text-slate-300 text-xs sm:text-sm leading-relaxed border-l-2 border-cyan-400 ml-4 sm:ml-5 mt-2 bg-white/[0.02] rounded-r-xl">
                                            {item.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;

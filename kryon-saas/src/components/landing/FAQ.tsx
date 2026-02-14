'use client'

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
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="py-24 bg-[#050507] relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Perguntas <span className="text-blue-500">Frequentes</span></h2>
                    <p className="text-gray-400">
                        Tire suas dúvidas sobre a Kryon Systems.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((item, index) => (
                        <div key={index}>
                            <motion.div
                                onClick={() => toggleAccordion(index)}
                                className={`rounded-xl px-6 py-5 cursor-pointer flex justify-between items-center transition-colors ${
                                    activeIndex === index ? 'bg-white/10 border border-blue-500/50' : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                }`}
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="flex items-center gap-3 font-semibold text-lg text-white">
                                    <HelpCircle size={20} className={activeIndex === index ? 'text-blue-400' : 'text-gray-500'} />
                                    {item.question}
                                </div>
                                {activeIndex === index ? <ChevronUp size={20} className="text-white" /> : <ChevronDown size={20} className="text-gray-400" />}
                            </motion.div>

                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div className="p-6 text-gray-300 leading-relaxed border-l-2 border-blue-500 ml-4 mt-2 bg-gradient-to-r from-blue-900/10 to-transparent">
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

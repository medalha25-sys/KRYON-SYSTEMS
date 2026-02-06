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
        <section className="section" style={{ background: 'var(--bg-secondary)', position: 'relative' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 className="title">Perguntas <span className="gradient-text">Frequentes</span></h2>
                    <p className="subtitle" style={{ margin: '0 auto' }}>
                        Tire suas dúvidas sobre a Kryon Systems.
                    </p>
                </div>

                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {faqs.map((item, index) => (
                        <div key={index} style={{ marginBottom: '1rem' }}>
                            <motion.div
                                onClick={() => toggleAccordion(index)}
                                style={{
                                    background: activeIndex === index ? 'rgba(255,255,255,0.08)' : 'var(--glass)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    padding: '1.2rem 1.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.3s'
                                }}
                                whileHover={{ scale: 1.01 }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600', fontSize: '1.05rem' }}>
                                    <HelpCircle size={20} color={activeIndex === index ? 'var(--primary)' : 'var(--text-muted)'} />
                                    {item.question}
                                </div>
                                {activeIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </motion.div>

                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{
                                            padding: '1.5rem',
                                            color: '#ccc',
                                            lineHeight: '1.6',
                                            borderLeft: '2px solid var(--primary)',
                                            marginLeft: '1rem',
                                            marginTop: '0.5rem'
                                        }}>
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

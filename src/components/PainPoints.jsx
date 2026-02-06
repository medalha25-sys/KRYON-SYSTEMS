import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, XCircle, TrendingDown, FileWarning } from 'lucide-react';

const problems = [
    {
        icon: <TrendingDown size={32} />,
        title: "Falhas no controle de caixa",
        description: "Os números do caixa não traduzem a realidade do seu negócio e você acaba no prejuízo sem saber para onde o dinheiro foi."
    },
    {
        icon: <XCircle size={32} />,
        title: "Estoque Desorganizado",
        description: "Perde vendas por não achar o produto? Mercadoria sumindo ou vencendo na prateleira? Falta de organização custa caro."
    },
    {
        icon: <AlertTriangle size={32} />,
        title: "Gestão no 'Achismo'",
        description: "Você não sabe exatamente quanto lucrou, quais os produtos campeões de venda ou quem são seus melhores clientes."
    },
    {
        icon: <FileWarning size={32} />,
        title: "Dados Inseguros",
        description: "Caderninhos que somem, planilhas que corrompem e anotações soltas colocam a história e a segurança do seu negócio em risco."
    }
];

const PainPoints = () => {
    return (
        <section className="section" style={{ background: '#050507', position: 'relative' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 className="title" style={{ fontSize: '2rem' }}>
                        Esses <span style={{ color: '#ff4d4d' }}>problemas</span> impedem o seu crescimento?
                    </h2>
                    <p className="subtitle" style={{ margin: '0 auto' }}>
                        Identifique o que está travando o seu potencial.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {problems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                background: 'rgba(255, 30, 30, 0.03)', // Subtle red tint
                                border: '1px solid rgba(255, 30, 30, 0.1)',
                                borderRadius: '16px',
                                padding: '2rem',
                                textAlign: 'left',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '4px',
                                height: '100%',
                                background: '#ff4d4d'
                            }} />
                            
                            <div style={{
                                color: '#ff4d4d',
                                marginBottom: '1.5rem',
                                background: 'rgba(255, 77, 77, 0.1)',
                                width: '60px',
                                height: '60px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {item.icon}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#fff' }}>{item.title}</h3>
                            <p style={{ color: '#a0a0b0', fontSize: '0.95rem', lineHeight: '1.6' }}>{item.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PainPoints;

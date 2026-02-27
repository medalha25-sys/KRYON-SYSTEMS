'use client'

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
        <section className="py-24 bg-[#050507] relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Esses <span className="text-red-500">problemas</span> impedem o seu crescimento?
                    </h2>
                    <p className="text-gray-400">
                        Identifique o que está travando o seu potencial.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {problems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-red-500/5 border border-red-500/10 rounded-2xl p-8 relative overflow-hidden hover:bg-red-500/10 transition-colors"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                            
                            <div className="w-16 h-16 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-white">{item.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PainPoints;

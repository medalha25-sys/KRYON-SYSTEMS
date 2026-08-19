import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, XCircle, TrendingDown, FileWarning, Clock, DollarSign } from 'lucide-react';

const problems = [
    {
        icon: <TrendingDown size={30} />,
        title: "Falhas no controle de caixa",
        description: "Os números do caixa não traduzem a realidade do seu negócio e você acaba no prejuízo sem saber para onde o dinheiro foi."
    },
    {
        icon: <XCircle size={30} />,
        title: "Estoque Desorganizado",
        description: "Perde vendas por não achar o produto? Mercadoria sumindo ou vencendo na prateleira? Falta de organização custa caro."
    },
    {
        icon: <AlertTriangle size={30} />,
        title: "Gestão no 'Achismo'",
        description: "Você não sabe exatamente quanto lucrou, quais os produtos campeões de venda ou quem são seus melhores clientes."
    },
    {
        icon: <FileWarning size={30} />,
        title: "Dados Inseguros",
        description: "Caderninhos que somem, planilhas que corrompem e anotações soltas colocam a história e a segurança do seu negócio em risco."
    },
    {
        icon: <Clock size={30} />,
        title: "Tempo Perdido com Processos Manuais",
        description: "Filas no balcão, demora para registrar vendas e retrabalho diário que roubam o tempo que você deveria usar para faturar mais."
    },
    {
        icon: <DollarSign size={30} />,
        title: "Cobranças e Fiados Esquecidos",
        description: "Vendas a prazo ou fiados anotados em papel que ninguém cobra, gerando inadimplência e buracos no fluxo financeiro da sua empresa."
    }
];

const PainPoints = () => {
    return (
        <section className="section py-16 md:py-24 bg-[#050507] relative overflow-hidden">
            {/* Background Accent Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-red-600/[0.03] rounded-full blur-[140px] pointer-events-none" />

            <div className="container-custom relative z-10">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="title text-3xl sm:text-4xl md:text-5xl">
                        Esses <span className="text-red-500">problemas</span> impedem o seu crescimento?
                    </h2>
                    <p className="subtitle mx-auto text-base sm:text-lg mt-3 text-slate-400 max-w-2xl">
                        Identifique o que está travando o potencial e os lucros da sua empresa.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {problems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.08 }}
                            className="relative flex flex-col justify-start overflow-hidden rounded-2xl p-6 sm:p-8 bg-red-500/[0.03] border border-red-500/10 hover:border-red-500/30 transition-all hover:-translate-y-1"
                        >
                            {/* Left Red Accent Bar */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-rose-600 shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
                            
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-red-500/10 text-red-400 border border-red-500/20 mb-6 flex-shrink-0">
                                {item.icon}
                            </div>
                            
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 tracking-tight">
                                {item.title}
                            </h3>
                            
                            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PainPoints;

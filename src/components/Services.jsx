import React from 'react';
import { Monitor, Calendar, BarChart3, Layers, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
    {
        icon: <Monitor size={32} className="text-cyan-400" />,
        bgColor: "bg-cyan-500/10 border-cyan-500/20",
        title: "Sistemas Web e SaaS",
        description: "Desenvolvimento de plataformas completas, robustas e acessíveis de qualquer computador, tablet ou celular."
    },
    {
        icon: <Calendar size={32} className="text-blue-400" />,
        bgColor: "bg-blue-500/10 border-blue-500/20",
        title: "Agendamento Online",
        description: "Soluções automáticas para organizar horários, confirmar atendimentos e otimizar o tempo de profissionais."
    },
    {
        icon: <BarChart3 size={32} className="text-purple-400" />,
        bgColor: "bg-purple-500/10 border-purple-500/20",
        title: "Gestão e Estoque",
        description: "Controle total de entradas e saídas de mercadorias, vendas, lucratividade e relatórios em tempo real."
    },
    {
        icon: <Layers size={32} className="text-amber-400" />,
        bgColor: "bg-amber-500/10 border-amber-500/20",
        title: "Soluções Sob Medida",
        description: "Software desenvolvido estrategicamente para atender a dinâmica e os desafios específicos da sua empresa."
    },
    {
        icon: <ShieldCheck size={32} className="text-emerald-400" />,
        bgColor: "bg-emerald-500/10 border-emerald-500/20",
        title: "DREX e Tax Reform",
        description: "Adequação automática às novas regras fiscais, emissão de notas e integração com a nova economia digital."
    },
    {
        icon: <Zap size={32} className="text-rose-400" />,
        bgColor: "bg-rose-500/10 border-rose-500/20",
        title: "Automação & PDV Rápido",
        description: "Frente de caixa ágil, compatível com leitor de código de barras, PIX QR Code instantâneo e fechamento diário."
    }
];

const Services = () => {
    return (
        <section className="section py-16 md:py-24 bg-[#08080c] relative overflow-hidden" id="soluções">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[400px] bg-blue-600/[0.03] rounded-full blur-[140px] pointer-events-none" />

            <div className="container-custom relative z-10">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="title text-3xl sm:text-4xl md:text-5xl">
                        O Que <span className="gradient-text">Fazemos</span>
                    </h2>
                    <p className="subtitle mx-auto text-base sm:text-lg mt-3 text-slate-400 max-w-2xl">
                        Transformamos complexidade em simplicidade através da mais alta tecnologia.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            className="card flex flex-col items-center text-center p-6 sm:p-8 hover:-translate-y-1 transition-all"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.08 }}
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border mb-6 ${service.bgColor}`}>
                                {service.icon}
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 tracking-tight">
                                {service.title}
                            </h3>
                            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                                {service.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;

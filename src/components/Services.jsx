import React from 'react';
import { Monitor, Calendar, BarChart3, Layers, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
    {
        icon: <Monitor size={32} color="var(--primary)" />,
        title: "Sistemas Web e SaaS",
        description: "Desenvolvimento de plataformas completas, acessíveis de qualquer lugar."
    },
    {
        icon: <Calendar size={32} color="var(--secondary)" />,
        title: "Agendamento Online",
        description: "Soluções para organizar agendas e otimizar o tempo de profissionais."
    },
    {
        icon: <BarChart3 size={32} color="var(--primary)" />,
        title: "Gestão e Estoque",
        description: "Controle total de ordens de serviço, vendas e produtos."
    },
    {
        icon: <Layers size={32} color="var(--secondary)" />,
        title: "Soluções Sob Medida",
        description: "Software desenhado especificamente para a dor do seu negócio."
    },
    {
        icon: <ShieldCheck size={32} color="#00ff88" />,
        title: "DREX e Tax Reform",
        description: "Preparação para a nova economia digital e realidade tributária."
    }
];

const Services = () => {
    return (
        <section className="section" id="soluções" style={{ background: 'var(--bg-secondary)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 className="title">O Que Fazemos</h2>
                    <p className="subtitle" style={{ margin: '0 auto' }}>
                        Transformamos complexidade em simplicidade através da tecnologia.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            className="card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem auto'
                            }}>
                                {service.icon}
                            </div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>{service.title}</h3>
                            <p style={{ color: 'var(--text-muted)' }}>{service.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;

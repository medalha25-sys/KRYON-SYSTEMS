import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Shield, CheckCircle, BarChart, Users, Zap, Lock, Layers } from 'lucide-react';
import SystemShowcase from '../components/SystemShowcase';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import Segments from '../components/Segments';
import TechDiff from '../components/TechDiff';
import WhyUs from '../components/WhyUs';
import PainPoints from '../components/PainPoints';
import CreativeCalendar from '../components/CreativeCalendar';

const Section = ({ children, id, className = "" }) => (
  <section id={id} className={`py-24 ${className}`}>
    <div className="container-custom">
      {children}
    </div>
  </section>
);

const Home = () => {
    // Ensure we scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <div className="bg-[#050507] text-white font-sans selection:bg-blue-500 selection:text-white overflow-hidden">
            
            {/* 1. HERO INSTITUCIONAL */}
            <Hero />

            {/* 2. QUEM SOMOS */}
            <Section id="quem-somos" className="bg-[#08080a]">
                <motion.div {...fadeIn} className="max-w-4xl mx-auto text-center">
                    <h2 className="text-sm font-bold tracking-[0.2em] text-blue-500 mb-6 uppercase">Sobre a Kryon</h2>
                    <h3 className="text-4xl md:text-5xl font-extrabold mb-10 tracking-tight">Tecnologia criada a partir de problemas reais</h3>
                    <p className="text-gray-400 text-xl leading-relaxed mb-12">
                        A Kryon Systems nasce da necessidade de negócios que sofrem com sistemas lentos e complexos. 
                        Nossa missão é simplificar a gestão através de plataformas SaaS de alta performance, 
                        focadas no que realmente importa: o crescimento do seu negócio.
                    </p>
                    <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-3xl inline-block text-left backdrop-blur-sm">
                        <p className="text-2xl text-blue-100 font-medium italic leading-snug">
                            “Não criamos apenas software. Entregamos a liberdade <br className="hidden md:block" /> para você focar no que é essencial.”
                        </p>
                    </div>
                </motion.div>
            </Section>

            {/* 3. NOSSOS SISTEMAS */}
            <Section id="sistemas">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Soluções <span className="text-gradient">Integradas</span></h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">Ecossistema completo de ferramentas desenhadas para escalar sua operação.</p>
                </div>
                
                <SystemShowcase />
            </Section>

            <Segments />
            <PainPoints />
            <WhyUs />
            
            <div className="relative">
                <div className="absolute inset-0 bg-blue-600/5 blur-[150px] -z-10" />
                <TechDiff />
            </div>

            <CreativeCalendar />
            <Services />
            <Testimonials />
            <Pricing />
            <FAQ />

            {/* 4. PARA QUEM É */}
            <Section className="bg-[#08080a] relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                <div className="max-w-5xl mx-auto">
                    <motion.h2 {...fadeIn} className="text-4xl font-extrabold text-center mb-16 tracking-tight">Universo de possibilidades</motion.h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {[
                            'Lojas Físicas e Digitais', 
                            'Clínicas e Consultórios', 
                            'Estúdios e Ateliês', 
                            'Oficinas e Manutenção', 
                            'Empresas de Serviço',
                            'Negócios em Escala'
                        ].map((item, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-8 text-center text-lg font-semibold hover:border-blue-500/40"
                            >
                                <span className="text-gradient uppercase tracking-widest text-sm">{item}</span>
                            </motion.div>
                        ))}
                    </div>
                    <div className="text-center">
                         <p className="text-2xl text-gray-300 font-medium max-w-2xl mx-auto">
                            “Se o seu sistema atual consome seu tempo em vez de poupá-lo, você precisa da Kryon.”
                        </p>
                    </div>
                </div>
            </Section>

            {/* CTA FINAL */}
            <Contact />
        </div>
    );
};

export default Home;

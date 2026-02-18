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
  <section id={id} className={`py-20 ${className}`}>
    <div className="container mx-auto px-4">
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
        <div className="bg-[#050507] text-white font-sans selection:bg-blue-500 selection:text-white">
            
            {/* 1. HERO INSTITUCIONAL */}
            <Hero />

            {/* 2. QUEM SOMOS */}
            <Section id="quem-somos" className="bg-[#0a0a0f]">
                <motion.div {...fadeIn} className="max-w-4xl mx-auto text-center">
                    <h2 className="text-sm font-bold tracking-widest text-blue-500 mb-4 uppercase">Quem Somos</h2>
                    <h3 className="text-3xl md:text-4xl font-bold mb-8">Tecnologia criada a partir de problemas reais</h3>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                        A Kryon Systems nasce da necessidade de negócios que sofrem com sistemas lentos, confusos e cheios de limitações.
                        Criamos plataformas SaaS simples, eficientes e em constante evolução, pensadas para o uso real de empresas que querem crescer com organização e controle.
                    </p>
                    <div className="p-6 bg-blue-900/10 border-l-4 border-blue-500 rounded-r-lg inline-block text-left">
                        <p className="text-xl text-blue-100 italic">
                            “Não criamos sistemas genéricos. Criamos soluções que acompanham o ritmo do seu negócio.”
                        </p>
                    </div>
                </motion.div>
            </Section>

            {/* 3. NOSSOS SISTEMAS */}
            <Section id="sistemas">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossas Soluções</h2>
                    <p className="text-gray-400">Plataformas dedicadas para cada necessidade</p>
                </div>
                
                <SystemShowcase />
            </Section>

            <Segments />
            <PainPoints />
            <WhyUs />
            <TechDiff />

            <CreativeCalendar />
            <Services />
            <Testimonials />
            <Pricing />
            <FAQ />

            {/* 4. PARA QUEM É */}
            <Section className="bg-[#0a0a0f]">
                <div className="max-w-4xl mx-auto">
                    <motion.h2 {...fadeIn} className="text-3xl font-bold text-center mb-12">Para quem nossas soluções foram criadas</motion.h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                        {['Lojas físicas e virtuais', 'Prestadores de serviço', 'Pequenas e médias empresas', 'Negócios em crescimento', 'Empreendedores'].map((item, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-[#15151f] p-6 rounded-xl text-center border border-white/5"
                            >
                                <span className="text-blue-400 font-medium">{item}</span>
                            </motion.div>
                        ))}
                    </div>
                    <p className="text-center text-xl text-gray-300 font-medium">
                        “Se o seu sistema atual mais atrapalha do que ajuda, você está no lugar certo.”
                    </p>
                </div>
            </Section>

            {/* 5. DIFERENCIAIS */}
            <Section>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div {...fadeIn}>
                        <h2 className="text-3xl font-bold mb-8">Por que escolher a Kryon?</h2>
                        <div className="space-y-6">
                            {[
                                { title: 'Sistemas rápidos e estáveis', desc: 'Performance otimizada para não travar sua operação.' },
                                { title: 'Interface simples e intuitiva', desc: 'Treinamento rápido e fácil adoção pela equipe.' },
                                { title: 'Atualizações constantes', desc: 'Sua ferramenta evolui junto com o mercado.' },
                                { title: 'Suporte humano e próximo', desc: 'Nada de robôs infinitos. Falamos a sua língua.' },
                                { title: 'Tecnologia pensada para uso real', desc: 'Funcionalidades que você realmente vai usar.' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                                        <CheckCircle size={14} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{item.title}</h4>
                                        <p className="text-gray-400 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-8 text-center"
                    >
                        <Zap size={64} className="mx-auto text-blue-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">Foco no Resultado</h3>
                        <p className="text-lg text-gray-300 italic">
                            “Aqui a tecnologia trabalha por você — não o contrário.”
                        </p>
                    </motion.div>
                </div>
            </Section>

            {/* 6. COMO FUNCIONA */}
            <Section className="bg-[#0a0a0f]">
                <h2 className="text-3xl font-bold text-center mb-16">Como funciona</h2>
                <div className="grid md:grid-cols-5 gap-4 relative">
                    {[
                        { step: '1', title: 'Escolha', text: 'o sistema ideal' },
                        { step: '2', title: 'Solicite', text: 'uma demonstração' },
                        { step: '3', title: 'Teste', text: 'na prática' },
                        { step: '4', title: 'Implante', text: 'com facilidade' },
                        { step: '5', title: 'Evolua', text: 'com melhorias' },
                    ].map((item, i) => (
                        <div key={i} className="text-center relative z-10">
                            <div className="w-12 h-12 mx-auto bg-blue-600 rounded-full flex items-center justify-center font-bold text-xl mb-4 shadow-lg shadow-blue-900/50">
                                {item.step}
                            </div>
                            <h4 className="font-bold mb-1">{item.title}</h4>
                            <p className="text-sm text-gray-400">{item.text}</p>
                        </div>
                    ))}
                    {/* Line connector */}
                    <div className="hidden md:block absolute top-6 left-10 right-10 h-0.5 bg-blue-900/30 -z-0" />
                </div>
                <p className="text-center text-gray-500 mt-12 text-sm uppercase tracking-wider">
                    Sem contratos engessados. Sem burocracia.
                </p>
            </Section>

            {/* 7. SEGURANÇA */}
            <Section>
                <div className="bg-[#12121a] rounded-2xl p-10 border border-white/5 text-center max-w-4xl mx-auto">
                    <Shield size={48} className="mx-auto text-green-400 mb-6" />
                    <h2 className="text-2xl font-bold mb-6">Segurança e Confiança</h2>
                    <div className="flex flex-wrap justify-center gap-8 mb-8 text-gray-300">
                        <span className="flex items-center gap-2"><Lock size={16} /> Segurança de dados</span>
                        <span className="flex items-center gap-2"><CheckCircle size={16} /> Estabilidade</span>
                        <span className="flex items-center gap-2"><Users size={16} /> Disponibilidade</span>
                        <span className="flex items-center gap-2"><BarChart size={16} /> Escalabilidade</span>
                    </div>
                    <p className="text-gray-400">“Sua empresa precisa de tecnologia confiável — e nós levamos isso a sério.”</p>
                </div>
            </Section>

            {/* 8. CTA FINAL */}
            <Contact />
        </div>
    );
};

export default Home;

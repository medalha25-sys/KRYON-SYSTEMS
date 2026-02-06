import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Shield, CheckCircle, BarChart, Users, Zap, Lock, Layers } from 'lucide-react';

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
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="container mx-auto px-4 text-center z-10 relative">
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight"
                    >
                        Sistemas inteligentes para <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                            gestão, automação e crescimento
                        </span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed"
                    >
                        Desenvolvemos soluções SaaS modernas para empresas que precisam de controle, agilidade e resultados reais no dia a dia.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="flex flex-col md:flex-row gap-4 justify-center items-center"
                    >
                        <a href="#sistemas" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2">
                            Conhecer os sistemas <ChevronRight size={18} />
                        </a>
                        <a href="#contato" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-semibold transition-all">
                            Solicitar demonstração
                        </a>
                    </motion.div>
                </div>
            </section>

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
                
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Sistema 1 */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#12121a] border border-white/5 rounded-2xl p-8 hover:border-blue-500/50 transition-colors group"
                    >
                        <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 text-blue-400 group-hover:text-blue-300">
                            <Layers size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Sistema de Gestão Comercial</h3>
                        <p className="text-gray-400 mb-6 min-h-[60px]">Plataforma completa para controle de vendas, clientes e operações do dia a dia.</p>
                        <ul className="space-y-3 mb-8">
                            {['Organização total das vendas', 'Controle de clientes', 'Interface simples', 'Acesso rápido às informações'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-300">
                                    <CheckCircle size={18} className="text-green-500 flex-shrink-0" /> {item}
                                </li>
                            ))}
                        </ul>
                        <div className="flex gap-4">
                            <a href="/assinar" className="flex-1 py-3 text-center bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
                                Ver detalhes
                            </a>
                            <a href="#contato" className="flex-1 py-3 text-center border border-white/10 hover:bg-white/5 rounded-lg font-medium transition-colors">
                                Solicitar demo
                            </a>
                        </div>
                    </motion.div>

                    {/* Sistema 2 */}
                    <motion.div 
                         initial={{ opacity: 0, x: 30 }}
                         whileInView={{ opacity: 1, x: 0 }}
                         viewport={{ once: true }}
                        className="bg-[#12121a] border border-white/5 rounded-2xl p-8 hover:border-purple-500/50 transition-colors group"
                    >
                        <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6 text-purple-400 group-hover:text-purple-300">
                            <BarChart size={28} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Sistema de Automação e Relatórios</h3>
                        <p className="text-gray-400 mb-6 min-h-[60px]">Solução focada em automação de processos e relatórios inteligentes para tomada de decisão.</p>
                        <ul className="space-y-3 mb-8">
                            {['Relatórios claros', 'Automação de tarefas', 'Dados em tempo real', 'Mais produtividade'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-300">
                                    <CheckCircle size={18} className="text-purple-500 flex-shrink-0" /> {item}
                                </li>
                            ))}
                        </ul>
                        <div className="flex gap-4">
                            <a href="/assinar" className="w-full py-3 text-center bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors">
                                Ver detalhes
                            </a>
                        </div>
                    </motion.div>
                </div>
            </Section>

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
            <Section id="contato" className="bg-gradient-to-t from-blue-900/20 to-[#050507]">
                <motion.div {...fadeIn} className="text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold mb-6">Pronto para conhecer sistemas que realmente funcionam?</h2>
                    <p className="text-xl text-gray-400 mb-10">
                        Descubra como as soluções da Kryon Systems podem transformar a gestão do seu negócio.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="https://wa.me/5538997269019" target="_blank" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-all shadow-lg shadow-blue-600/30">
                            Solicitar demonstração
                        </a>
                        <a href="https://wa.me/5538997269019" target="_blank" className="px-8 py-4 bg-[#1a1a2e] hover:bg-[#252540] border border-white/10 text-white rounded-lg font-bold text-lg transition-all">
                            Falar com um especialista
                        </a>
                    </div>
                </motion.div>
            </Section>
        </div>
    );
};

export default Home;

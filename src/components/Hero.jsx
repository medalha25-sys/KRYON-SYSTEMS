import React from 'react';
import { Rocket, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden" id="início">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse-slow" />
            
            <div className="container-custom relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Content Left */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-semibold mb-8 backdrop-blur-md">
                            <Sparkles size={16} className="animate-pulse" />
                            <span>Transformação Digital de Ponta a Ponta</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-8">
                            Sistemas <span className="text-gradient">inteligentes</span> <br />
                            para <span className="text-white">gestão, automação</span> <br />
                            e <span className="text-blue-400">crescimento.</span>
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-gray-400 mb-10 leading-relaxed max-w-xl">
                            Desenvolvemos plataformas SaaS sob medida que organizam seu negócio e escalam sua operação com tecnologia de última geração.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-5">
                            <a 
                                href="https://app.kryonsystems.com.br/trial" 
                                className="btn-premium no-underline shadow-2xl shadow-blue-500/30"
                            >
                                <span className="flex items-center gap-3">
                                    Começar Teste Grátis <Rocket size={20} />
                                </span>
                            </a>
                            <a 
                                href="#sistemas" 
                                className="inline-flex items-center justify-center px-8 py-4 font-bold text-white glass-card no-underline hover:shadow-white/5 active:scale-95"
                            >
                                Ver Soluções
                            </a>
                        </div>
                        
                        {/* Trust Badges */}
                        <div className="mt-16 flex items-center gap-6 text-gray-500">
                             <div className="flex -space-x-3">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050507] bg-gray-800 flex items-center justify-center text-[10px] font-bold">
                                        UA
                                    </div>
                                ))}
                             </div>
                             <p className="text-sm font-medium italic">
                                Junte-se a <span className="text-white font-bold">100+ empresas</span> que já escalam com a Kryon.
                             </p>
                        </div>
                    </motion.div>

                    {/* Visual Right - Premium Mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                        transition={{ duration: 1.2, delay: 0.2 }}
                        className="relative hidden lg:block perspective-3000"
                    >
                        <div className="relative z-20 transform -rotate-2 hover:rotate-0 transition-transform duration-700">
                             {/* The "Glass" Monitor */}
                             <div className="w-[600px] h-[380px] glass-card p-4 border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.1)] overflow-hidden">
                                 <div className="flex flex-col h-full bg-[#0a0a12]/50 rounded-2xl border border-white/5 overflow-hidden">
                                     {/* Mockup Header */}
                                     <div className="h-12 border-b border-white/5 flex items-center px-6 justify-between bg-white/5">
                                         <div className="flex gap-2">
                                             <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                             <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                             <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                         </div>
                                         <div className="w-40 h-2 bg-white/10 rounded-full" />
                                         <div className="w-6 h-6 rounded-lg bg-blue-500/20" />
                                     </div>
                                     {/* Mockup Grid Body */}
                                     <div className="flex-1 p-6 grid grid-cols-3 gap-4">
                                         <div className="col-span-2 space-y-4">
                                             <div className="h-32 bg-gradient-to-br from-blue-500/20 to-purple-600/10 rounded-2xl border border-blue-500/20" />
                                             <div className="grid grid-cols-2 gap-4">
                                                 <div className="h-20 bg-white/5 rounded-2xl border border-white/5" />
                                                 <div className="h-20 bg-white/5 rounded-2xl border border-white/5" />
                                             </div>
                                         </div>
                                         <div className="h-full bg-white/5 rounded-2xl border border-white/5" />
                                     </div>
                                 </div>
                             </div>
                        </div>
                        
                        {/* Floating elements */}
                        <motion.div 
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-10 -right-6 w-32 h-32 glass-card p-4 border-blue-500/30 flex flex-col items-center justify-center gap-2"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 flex items-center justify-center">
                                <Rocket className="text-white" size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-blue-400">SPEED UP</span>
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default Hero;

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Smartphone, Monitor } from 'lucide-react';

const features = [
    {
        title: "Vendas Rápidas e Completas",
        description: "Faça vendas rapidamente, controle as comissões dos vendedores, recebimentos e muito mais!"
    },
    {
        title: "PDV com Leitor de Código de Barras",
        description: "PDV rápido compatível com leitores de códigos de barras para agilizar suas vendas."
    },
    {
        title: "Orçamentos e Pré-Vendas",
        description: "Opção de orçamento e pré-vendas com observação nas vendas ou individualmente nos produtos."
    },
    {
        title: "Pagamento via PIX",
        description: "Ofereça aos seus clientes maior comodidade e facilidade com pagamentos via QR Code PIX."
    }
];

const SystemShowcase = () => {
    return (
        <div className="relative py-12 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
                
                {/* Visual Section */}
                <div className="relative">
                    {/* Background Glow */}
                    <div className="absolute -inset-10 bg-blue-500/10 blur-[100px] rounded-full" />
                    
                    <div className="relative flex items-center justify-center min-h-[500px]">
                        {/* Desktop Mockup */}
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="w-full max-w-[500px] glass-card p-3 border-white/10 shadow-2xl z-10"
                        >
                            <div className="bg-[#0f172a] rounded-xl overflow-hidden border border-white/5">
                                <div className="h-8 bg-white/5 border-b border-white/5 px-4 flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-white">Dashboard Vendas</h4>
                                            <p className="text-[10px] text-gray-500">Hoje: +24% em relação a ontem</p>
                                        </div>
                                        <div className="p-2 bg-blue-500/20 rounded-lg">
                                            <Monitor size={20} className="text-blue-400" />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl border border-blue-500/20 p-4">
                                            <div className="w-8 h-1 bg-blue-500/40 rounded-full mb-3" />
                                            <div className="h-10 w-full bg-white/5 rounded-lg" />
                                        </div>
                                        <div className="h-24 bg-white/5 rounded-xl border border-white/5 p-4">
                                            <div className="w-8 h-1 bg-white/10 rounded-full mb-3" />
                                            <div className="h-10 w-full bg-white/5 rounded-lg" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Mobile Mockup Overlay */}
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="absolute -bottom-10 -right-4 w-[180px] h-[360px] bg-[#000] border-[6px] border-gray-800 rounded-[40px] shadow-2xl overflow-hidden z-20 hidden md:block"
                        >
                            <div className="h-full bg-[#0f172a] p-4 flex flex-col gap-4">
                                <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-4" />
                                <div className="h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                                    <Smartphone size={24} className="text-white" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-white/5 rounded-full" />
                                    <div className="h-2 w-3/4 bg-white/5 rounded-full" />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <div className="h-16 bg-white/5 rounded-xl" />
                                    <div className="h-16 bg-white/5 rounded-xl" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="space-y-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card group p-6 hover:border-blue-500/30 transition-all cursor-default"
                        >
                            <div className="flex gap-6 items-start">
                                <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                    <Check size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SystemShowcase;

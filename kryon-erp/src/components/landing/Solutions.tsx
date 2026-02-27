'use client'

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Dog, Calculator, Wrench, Car, ShoppingBag, Scale, Camera, Palette, Droplets } from 'lucide-react';

const Solutions = () => {
    return (
        <section id="sistemas" className="py-24 relative overflow-hidden">
            {/* Background elements */}
             <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, rgba(0,0,0,0) 70%)',
                zIndex: -1
            }} />

            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Soluções por <span className="text-blue-500">Segmento</span></h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Ferramentas especializadas para impulsionar o seu nicho.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    
                    {/* Agenda Fácil */}
                    <ProductCard 
                        title="Agenda Fácil"
                        subtitle="SAÚDE E ATENDIMENTO"
                        icon={<Calendar className="w-8 h-8 text-cyan-400" />}
                        desc="Sistema de agendamento online simples e eficiente para terapeutas e profissionais da saúde."
                        features={[]}
                        link="/trial?product=agenda-facil"
                        color="cyan"
                        cta="Teste Grátis"
                    />

                    {/* Gestão Pet */}
                    <ProductCard 
                        title="Sistema Gestão Pet"
                        subtitle="PET SHOP"
                        icon={<Dog className="w-8 h-8 text-pink-500" />}
                        desc="Agendamento de serviços, controle de clientes e organização completa dos atendimentos."
                        features={[]}
                        link="/trial?product=gestao-pet"
                        color="pink"
                        cta="Teste Grátis"
                    />

                    {/* Systems Celulares (Loja de Celular) */}
                    <ProductCard 
                        title="Systems Celulares"
                        subtitle="ASSISTÊNCIA E ELETRÔNICOS"
                        icon={<Wrench className="w-8 h-8 text-purple-500" />}
                        desc="Controle de estoque, ordens de serviço e gestão completa da assistência técnica."
                        features={[]}
                        link="/trial?product=tech-assist"
                        color="purple"
                        cta="Teste Grátis"
                    />

                    {/* Sistema de Loja de Roupas e Calçados com IA */}
                    <ProductCard 
                        title="Sistema de Loja de Roupas e Calçados com IA"
                        subtitle="LOJA DE ROUPAS"
                        icon={<ShoppingBag className="w-8 h-8 text-yellow-400" />}
                        desc="Controle de produtos, vendas e organização do negócio."
                        features={[]}
                        link="/trial?product=fashion-manager"
                        color="yellow"
                        cta="Teste Grátis"
                    />

                     {/* Systems Fotos (Fotógrafos) */}
                     <ProductCard 
                        title="Systems Fotos"
                        subtitle="FOTÓGRAFOS"
                        icon={<Camera className="w-8 h-8 text-green-500" />}
                        desc="Galeria online segura com marca d'água automática e seleção de fotos sem download."
                        features={[]}
                        link="/trial?product=galeria-pro"
                        color="green"
                        cta="Teste Grátis"
                    />


                    {/* Sistema para Loja de Decoração */}
                     <ProductCard 
                        title="Sistema para Loja de Decoração (Em Breve)"
                        subtitle="LOJA DE DECORAÇÃO"
                        icon={<Palette className="w-8 h-8 text-orange-500" />}
                        desc="Controle de estoque, orçamentos personalizados e gestão de entregas."
                        features={[]}
                        badge="Em Breve"
                        cta="Teste Grátis"
                        disabled
                        color="orange"
                        link="#"
                    />

                    {/* Agendamento Online (Lava Rápido) */}
                    <ProductCard 
                        title="Agendamento Online (Em Breve)"
                        subtitle="LAVA RÁPIDO"
                        icon={<Droplets className="w-8 h-8 text-blue-600" />}
                        desc="Gestão de filas, agendamento de lavagens e controle financeiro."
                        features={[]}
                        link="#"
                        disabled
                        color="blue"
                        cta="Teste Grátis"
                    />

                    {/* Auto Gestor */}
                    <ProductCard 
                        title="Auto Gestor (Em Breve)"
                        subtitle="OFICINA MECÂNICA"
                        icon={<Car className="w-8 h-8 text-orange-600" />}
                        desc="Ordens de serviço, controle de peças e histórico de manutenção veicular."
                        features={[]}
                        link="#"
                        disabled
                        color="orange" // Reusing orange or reddish orange
                        cta="Teste Grátis"
                    />

                    {/* Systems Jurídico */}
                    <ProductCard 
                        title="Sistema de Gestão Jurídica (LegalTech)"
                        subtitle="ADVOGADOS"
                        icon={<Scale className="w-8 h-8 text-purple-400" />}
                        desc="Gestão de processos, agenda de audiências e controle de prazos."
                        features={[]}
                        link="#"
                        disabled
                        color="purple"
                        cta="Teste Grátis"
                    />


                </div>
            </div>
        </section>
    );
};


// Reused ProductCard with slight tweaks for dark compatibility if needed
function ProductCard({ title, subtitle, icon, desc, features, link, disabled, color, cta, badge }: any) {
  const colors: Record<string, string> = {
      blue: 'hover:border-blue-500/40 hover:shadow-blue-900/10',
      orange: 'hover:border-orange-500/40 hover:shadow-orange-900/10',
      cyan: 'hover:border-cyan-500/40 hover:shadow-cyan-900/10',
      red: 'hover:border-red-500/40 hover:shadow-red-900/10',
      purple: 'hover:border-purple-500/40 hover:shadow-purple-900/10',
      yellow: 'hover:border-yellow-500/40 hover:shadow-yellow-900/10',
      indigo: 'hover:border-indigo-500/40 hover:shadow-indigo-900/10',
      teal: 'hover:border-teal-500/40 hover:shadow-teal-900/10',
      sky: 'hover:border-sky-500/40 hover:shadow-sky-900/10',
      pink: 'hover:border-pink-500/40 hover:shadow-pink-900/10',
      green: 'hover:border-green-500/40 hover:shadow-green-900/10',
  }
  
  const btnColors: Record<string, string> = {
      blue: 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20',
      orange: 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/20',
      cyan: 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/20',
      red: 'bg-red-600 hover:bg-red-500 shadow-red-900/20',
      purple: 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20',
      yellow: 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-900/20',
      indigo: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20',
      teal: 'bg-teal-600 hover:bg-teal-500 shadow-teal-900/20',
      sky: 'bg-sky-600 hover:bg-sky-500 shadow-sky-900/20',
      pink: 'bg-pink-600 hover:bg-pink-500 shadow-pink-900/20',
      green: 'bg-green-600 hover:bg-green-500 shadow-green-900/20',
  }

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      viewport={{ once: true }}
      className={`relative bg-[#0f172a] rounded-3xl p-6 border border-gray-800 transition-all duration-300 shadow-xl flex flex-col ${colors[color] || ''} ${disabled ? 'opacity-80' : ''}`}
    >
      <div className="flex gap-4 items-center mb-6">
        <div className="bg-gray-800/50 w-12 h-12 rounded-xl flex items-center justify-center border border-gray-700/50">
            {icon}
        </div>
        <div>
            {subtitle && <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{subtitle}</div>}
             <h3 className="text-xl font-bold text-white leading-tight">{title}</h3>
        </div>
      </div>
      
      <p className="text-gray-400 mb-8 flex-grow leading-relaxed text-xs">
        {desc}
      </p>

      {/* Hide features list as per new screenshot seemingly having cleaner cards, but keeping existing structure if needed. 
          Actually screenshot shows buttons. 
      */}

      {disabled ? (
          <button disabled className={`w-full py-2.5 rounded-lg font-bold cursor-not-allowed border border-dashed border-gray-700 hover:bg-gray-800 text-${color}-500 text-xs uppercase tracking-wider`}>
              {title.includes('Em Breve') ? 'Em Breve' : 'Em Construção'}
          </button>
      ) : (
          <Link 
            href={link}
            target="_blank"
            className={`w-full py-2.5 rounded-lg ${btnColors[color]} text-white font-bold text-center transition flex items-center justify-center gap-2 group shadow-lg text-sm`}
          >
            {cta || 'Acessar'}
          </Link>
      )}
    </motion.div>
  )
}

export default Solutions;

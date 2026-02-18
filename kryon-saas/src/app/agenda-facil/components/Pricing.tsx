'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { fadeSoft, staggerSoft, buttonElegant } from '../utils/animations'

export default function Pricing({ onOpenModal }: { onOpenModal: () => void }) {
  const plans = [
    {
      name: "Plano Profissional",
      price: "R$ 97/mês",
      description: "Ideal para psicólogos que desejam organização completa da agenda e prontuários.",
      features: [
        "Agenda inteligente",
        "Prontuário digital",
        "Controle financeiro básico",
        "Relatórios essenciais",
        "Acesso multiplataforma (PWA)"
      ],
      highlight: false,
      button_text: "Solicitar Acesso"
    },
    {
      name: "Clínica Avançada",
      price: "R$ 197/mês",
      description: "Para profissionais que buscam gestão estratégica e controle avançado do consultório.",
      features: [
        "Tudo do Plano Profissional",
        "Relatórios financeiros avançados",
        "Gestão estratégica de faturamento",
        "Prioridade em suporte",
        "Atualizações exclusivas"
      ],
      highlight: true,
      button_text: "Solicitar Acesso Premium"
    }
  ]

  return (
    <motion.section 
      id="planos" 
      className="py-32 px-6 bg-[#f9fafb]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerSoft}
    >
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2 
          className="text-4xl md:text-5xl font-semibold tracking-tight mb-16 text-gray-900"
          variants={fadeSoft}
        >
          Planos para Consultórios Organizados
        </motion.h2>
        
        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div 
              key={index} 
              className={`bg-white p-10 rounded-2xl border ${plan.highlight ? 'border-emerald-600 shadow-md ring-1 ring-emerald-600' : 'border-gray-100 shadow-sm'} transition duration-300 hover:shadow-lg flex flex-col`}
              variants={fadeSoft}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-500 mb-6 h-12">{plan.description}</p>
              
              <div className="text-3xl font-bold my-6 text-gray-900">{plan.price}</div>
              
              <ul className="text-left mb-8 space-y-3 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="text-gray-600 flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.button 
                onClick={onOpenModal}
                className={`w-full py-3 px-6 rounded-xl font-medium transition ${
                  plan.highlight 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
                variants={buttonElegant}
                whileHover="hover"
              >
                {plan.button_text}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

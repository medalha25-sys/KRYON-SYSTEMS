'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { fadeSoft, staggerSoft } from '../utils/animations'

export default function Benefits() {
  const benefits = [
    {
      title: "Gestão de Agenda Estruturada",
      description: "Visualize seus atendimentos de forma simples, reduza faltas e organize seus horários com eficiência."
    },
    {
      title: "Prontuário Clínico Profissional",
      description: "Registre evoluções do paciente de forma prática e mantenha tudo armazenado com segurança."
    },
    {
      title: "Controle Financeiro Estratégico",
      description: "Acompanhe pagamentos, visualize relatórios e tenha clareza total sobre seu faturamento."
    },
    {
      title: "Calendário de Consultas",
      description: "Gerencie compromissos em smartphones, tablets e computadores com sistema PWA."
    },
    {
      title: "Relatórios Automáticos",
      description: "Tenha visão estratégica do seu consultório com poucos cliques."
    },
    {
      title: "Acesso Multiplataforma",
      description: "Use no celular, tablet ou computador sem precisar instalar nada."
    }
  ]

  return (
    <motion.section 
      id="beneficios" 
      className="py-24 px-6 bg-gray-50"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerSoft}
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900"
          variants={fadeSoft}
        >
          Organização, controle e crescimento em um só lugar
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-10">
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              variants={fadeSoft}
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

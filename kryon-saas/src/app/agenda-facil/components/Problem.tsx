'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { fadeSoft, staggerSoft } from '../utils/animations'

export default function Problem() {
  const problems = [
    "Pacientes esquecem consultas e você perde faturamento?",
    "Cancelamentos em cima da hora atrapalham sua organização?",
    "Você controla seu financeiro em planilhas confusas?",
    "Prontuário e agenda ficam espalhados em vários lugares?"
  ]

  return (
    <motion.section 
      id="problemas" 
      className="py-20 px-6 bg-white text-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerSoft}
    >
      <div className="max-w-5xl mx-auto">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-12 text-gray-900"
          variants={fadeSoft}
        >
          Você enfrenta esses problemas no dia a dia?
        </motion.h2>
        
        <div className="grid md:grid-cols-2 gap-8 text-left">
          {problems.map((problem, index) => (
            <motion.div 
              key={index} 
              className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100 flex items-start gap-4 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              variants={fadeSoft}
            >
              <span className="text-red-500 text-xl font-bold">✕</span>
              <p className="text-lg text-gray-700">{problem}</p>
            </motion.div>
          ))}
        </div>

        <motion.p 
          className="mt-12 text-lg font-medium text-gray-700"
          variants={fadeSoft}
        >
          Se você respondeu sim para alguma dessas perguntas, o Agenda Fácil foi criado para você.
        </motion.p>
      </div>
    </motion.section>
  )
}

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { fadeSoft, staggerSoft } from '../utils/animations'

export default function FAQ() {
  const faqItems = [
    {
      question: "Preciso instalar algum aplicativo?",
      answer: "Não. O Agenda Fácil é um sistema PWA que funciona direto no navegador, podendo ser usado em celulares, tablets e computadores."
    },
    {
      question: "Meus dados e os dados dos pacientes ficam seguros?",
      answer: "Sim. O sistema foi desenvolvido com tecnologia moderna e foco em organização e responsabilidade no tratamento das informações."
    },
    {
      question: "Consigo usar pelo celular?",
      answer: "Sim. O sistema é totalmente responsivo e pode ser utilizado normalmente pelo smartphone."
    },
    {
      question: "O sistema é complicado de usar?",
      answer: "Não. O Agenda Fácil foi criado para ser simples, intuitivo e prático para o dia a dia do profissional."
    },
    {
      question: "Posso testar antes de contratar?",
      answer: "Sim. Você pode acessar e testar para entender como o sistema funciona na prática."
    }
  ]

  return (
    <motion.section 
      id="faq" 
      className="py-24 px-6 bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerSoft}
    >
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900"
          variants={fadeSoft}
        >
          Perguntas Frequentes
        </motion.h2>
        
        <div className="space-y-6">
          {faqItems.map((item, index) => (
            <motion.div 
              key={index} 
              className="mb-6 border-b border-gray-100 pb-6 last:border-0 transition duration-300 hover:-translate-y-1 hover:shadow-sm"
              variants={fadeSoft}
            >
              <h3 className="font-semibold text-lg text-gray-800">{item.question}</h3>
              <p className="text-gray-600 mt-2">{item.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

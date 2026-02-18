'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { fadeSoft, staggerSoft } from '../utils/animations'

export default function Testimonials() {
  const testimonials = [
    {
      name: "Dra. Mariana Souza",
      role: "Psicóloga Clínica",
      text: "Depois que comecei a usar o Agenda Fácil, minha rotina ficou muito mais organizada. Hoje tenho controle total da agenda e do financeiro."
    },
    {
      name: "Dr. Rafael Lima",
      role: "Psicólogo",
      text: "O sistema é simples, rápido e funciona perfeitamente no celular. Isso facilitou muito meus atendimentos."
    },
    {
      name: "Dra. Camila Torres",
      role: "Psicóloga Infantil",
      text: "Ter prontuário e agenda no mesmo lugar trouxe mais segurança e profissionalismo para o meu consultório."
    }
  ]

  return (
    <motion.section 
      id="depoimentos" 
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
          Profissionais que já utilizam o Agenda Fácil
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-10">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-md flex flex-col justify-between transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              variants={fadeSoft}
            >
              <p className="text-gray-700 italic mb-6">"{testimonial.text}"</p>
              <div>
                <p className="font-bold mt-4 text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

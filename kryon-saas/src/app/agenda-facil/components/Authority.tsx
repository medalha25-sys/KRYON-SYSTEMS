'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { fadeSoft, staggerSoft } from '../utils/animations'

export default function Authority() {
  return (
    <motion.section 
      id="autoridade" 
      className="py-24 px-6 bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerSoft}
    >
      <div className="max-w-5xl mx-auto text-center">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-10 text-gray-900"
          variants={fadeSoft}
        >
          Tecnologia segura e pensada para profissionais da saúde
        </motion.h2>
        
        <motion.p className="text-lg text-gray-700 mb-6" variants={fadeSoft}>
          O Agenda Fácil foi desenvolvido com tecnologia moderna utilizando React 19 e Next.js 15, garantindo performance, estabilidade e escalabilidade.
        </motion.p>

        <motion.p className="text-lg text-gray-700 mb-6" variants={fadeSoft}>
          Seus dados e os dados dos seus pacientes são tratados com responsabilidade e organização.
        </motion.p>

        <motion.p className="text-lg text-gray-700 mb-6" variants={fadeSoft}>
          Desenvolvido para profissionais que levam a organização do consultório a sério e desejam elevar o nível da sua prática clínica.
        </motion.p>

        <motion.p className="text-lg text-gray-700 mb-6" variants={fadeSoft}>
          Sistema desenvolvido especialmente para psicólogos e profissionais que precisam de controle, segurança e praticidade no dia a dia.
        </motion.p>

        <motion.div 
          className="mt-10 bg-gray-100 p-6 rounded-xl font-semibold text-gray-800 inline-block transition duration-300 hover:-translate-y-1 hover:shadow-lg"
          variants={fadeSoft}
        >
          Seu consultório organizado. Seus dados protegidos. Sua rotina simplificada.
        </motion.div>
      </div>
    </motion.section>
  )
}

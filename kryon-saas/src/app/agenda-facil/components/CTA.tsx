'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { buttonElegant, fadeSoft, staggerSoft } from '../utils/animations'

export default function CTA() {
  return (
    <motion.section 
      id="cta" 
      className="py-24 px-6 bg-black text-white text-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerSoft}
    >
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-6"
          variants={fadeSoft}
        >
          Eleve o nível da gestão do seu consultório
        </motion.h2>
        
        <motion.p 
          className="text-lg mb-10 text-gray-300"
          variants={fadeSoft}
        >
          Teste o Agenda Fácil e veja na prática como sua rotina pode se tornar mais simples e profissional.
        </motion.p>

        <Link 
          href="/login" 
        >
          <motion.button
            className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition shadow-lg"
            variants={buttonElegant}
            whileHover="hover"
          >
            Solicitar Acesso
          </motion.button>
        </Link>

        <motion.p 
          className="mt-6 text-sm text-gray-400"
          variants={fadeSoft}
        >
          Sem burocracia. Acesso imediato.
        </motion.p>
      </div>
    </motion.section>
  )
}

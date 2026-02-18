'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeSoft, staggerSoft, buttonElegant } from '../utils/animations'

interface ButtonProps {
  text: string
  href: string
  style: string
}

const heroData = {
  section_style: "py-24 px-6 text-center bg-gray-50",
  container_style: "max-w-4xl mx-auto",
  title: "Gestão Clínica Premium para Psicólogos Organizados",
  subtitle: "Organize agenda, prontuários e financeiro com estrutura profissional e segurança.",
  buttons: [
    {
      text: "Começar teste grátis de 15 dias",
      href: "/register",
      style: "bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-emerald-500 transition shadow-lg"
    },
    {
      text: "Ver como funciona",
      href: "#como-funciona",
      style: "border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:bg-emerald-50 hover:text-emerald-700 transition"
    }
  ]
}

export default function Hero() {
  return (
    <motion.section 
      className={heroData.section_style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerSoft}
    >
      <div className={heroData.container_style}>
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight"
          variants={fadeSoft}
        >
          {heroData.title}
        </motion.h1>
        
        <motion.p 
          className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          variants={fadeSoft}
        >
          {heroData.subtitle}
        </motion.p>

        <motion.div 
          className={`flex flex-col md:flex-row gap-4 justify-center`}
          variants={fadeSoft}
        >
          {heroData.buttons.map((btn: ButtonProps, index: number) => (
             <Link 
                key={index} 
                href={btn.href} 
             >
                <motion.div
                  className={`${btn.style} inline-flex items-center justify-center`}
                  variants={buttonElegant}
                  whileHover="hover"
                >
                  {btn.text}
                </motion.div>
             </Link>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}

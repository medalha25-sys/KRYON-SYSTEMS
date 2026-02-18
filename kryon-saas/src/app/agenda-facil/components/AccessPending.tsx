'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

export default function AccessPending() {
  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-[#f9fafb] to-white z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-white p-12 rounded-2xl border border-gray-100 shadow-xl max-w-xl text-center relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex justify-center mb-6">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
            className="text-emerald-500"
          >
            <CheckCircle size={64} />
          </motion.div>
        </div>

        <h2 className="text-3xl font-semibold mb-6 text-gray-900">
          Solicitação Recebida
        </h2>

        <p className="text-gray-600 leading-relaxed mb-8 text-lg">
          Sua solicitação está em análise. Em breve você receberá um e-mail com as instruções de acesso ao sistema.
        </p>

        <p className="text-emerald-600 font-medium">
          Equipe Agenda Fácil
        </p>
      </motion.div>
    </motion.div>
  )
}

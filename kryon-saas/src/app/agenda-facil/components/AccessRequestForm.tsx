'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeSoft, staggerSoft, buttonElegant } from '../utils/animations'
import AccessPending from './AccessPending'

export default function AccessRequestForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    crp: '',
    cidade: ''
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/solicitar-acesso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        alert(data.error || 'Ocorreu um erro. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro no envio:', error)
      alert('Erro de conexão. Verifique sua internet.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return <AccessPending />
  }

  return (
    <div className="w-full">
      <motion.h2 
        className="text-3xl font-bold text-center mb-8 text-gray-900"
        variants={fadeSoft}
      >
        Solicite seu Acesso
      </motion.h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.div variants={fadeSoft}>
          <label className="block text-gray-700 font-medium mb-1" htmlFor="nome">
            Nome Completo
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition disabled:opacity-50"
            placeholder="Dr(a). Seu Nome"
          />
        </motion.div>

        <motion.div variants={fadeSoft}>
          <label className="block text-gray-700 font-medium mb-1" htmlFor="email">
            E-mail Profissional
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition disabled:opacity-50"
            placeholder="seuemail@exemplo.com"
          />
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div variants={fadeSoft}>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="crp">
              CRP
            </label>
            <input
              type="text"
              id="crp"
              name="crp"
              value={formData.crp}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition disabled:opacity-50"
              placeholder="00/00000"
            />
          </motion.div>

          <motion.div variants={fadeSoft}>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="cidade">
              Cidade
            </label>
            <input
              type="text"
              id="cidade"
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition disabled:opacity-50"
              placeholder="Sua cidade"
            />
          </motion.div>
        </div>

        <motion.button
          type="submit"
          className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-medium transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          variants={buttonElegant}
          whileHover={isLoading ? {} : "hover"}
          disabled={isLoading}
        >
          {isLoading ? 'Processando solicitação...' : 'Solicitar Acesso'}
        </motion.button>

        <motion.p 
          className="text-center text-xs text-gray-500 mt-4"
          variants={fadeSoft}
        >
          Seus dados serão utilizados apenas para liberar o acesso ao sistema.
        </motion.p>
      </form>
    </div>
  )
}

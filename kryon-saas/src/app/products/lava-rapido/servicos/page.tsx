'use client'

import { useState } from 'react'
import { Plus, Search, Car, DollarSign, Clock, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Serviços</h1>
          <p className="text-gray-400">Gerencie o catálogo de lavagens e serviços adicionais.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all">
          <Plus className="w-5 h-5" />
          Novo Serviço
        </button>
      </header>

      {/* Filter Bar */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou descrição..."
            className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
            <select className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500">
                <option>Todos os tipos</option>
                <option>Lavagem</option>
                <option>Estética</option>
                <option>Adicional</option>
            </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ServiceCard 
            name="Lavagem Completa"
            description="Lavagem externa, interna e enceramento básico."
            prices={{ small: 50, medium: 70, large: 90 }}
            duration={60}
        />
        <ServiceCard 
            name="Higienização Interna"
            description="Limpeza profunda de bancos, carpetes e teto."
            prices={{ small: 250, medium: 300, large: 350 }}
            duration={240}
        />
        <ServiceCard 
            name="Polimento Técnico"
            description="Remoção de riscos e restauração do brilho."
            prices={{ small: 400, medium: 500, large: 650 }}
            duration={480}
        />
      </div>
    </div>
  )
}

function ServiceCard({ name, description, prices, duration }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="bg-blue-900/20 p-3 rounded-xl">
          <Car className="w-6 h-6 text-blue-500" />
        </div>
        <button className="text-gray-500 hover:text-white">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition">{name}</h3>
      <p className="text-gray-400 text-sm mb-6 line-clamp-2">{description}</p>

      <div className="space-y-3 pt-6 border-t border-gray-800">
        <PriceRow label="Pequeno" price={prices.small} />
        <PriceRow label="Médio" price={prices.medium} />
        <PriceRow label="Grande" price={prices.large} />
      </div>

      <div className="mt-6 flex items-center gap-2 text-gray-500 text-sm">
        <Clock className="w-4 h-4" />
        <span>~{duration} min</span>
      </div>
    </motion.div>
  )
}

function PriceRow({ label, price }: { label: string; price: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs font-medium uppercase text-gray-500">{label}</span>
      <span className="font-bold text-blue-400">R$ {price.toFixed(2)}</span>
    </div>
  )
}

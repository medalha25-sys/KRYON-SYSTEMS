'use client'

import { useState } from 'react'
import { Plus, Search, Filter, MoreVertical, Car, Clock, CheckCircle2, AlertTriangle, ChevronRight, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Ordens de Serviço</h1>
          <p className="text-gray-400">Gerencie as lavagens em andamento e o histórico de vendas.</p>
        </div>
        <Link 
          href="/products/lava-rapido/vendas/novo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-5 h-5" />
          Nova OS
        </Link>
      </header>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-800">
        <TabItem label="Ativas" count={6} active />
        <TabItem label="Finalizadas" count={124} />
        <TabItem label="Canceladas" count={2} />
      </div>

      {/* Filter Bar */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar por placa, cliente ou serviço..."
            className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-400 hover:text-white transition flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtrar
            </button>
        </div>
      </div>

      {/* Orders Grid/List */}
      <div className="grid grid-cols-1 gap-4">
        <OrderCard 
            id="OS-2024-001"
            plate="ABC-1234"
            client="João Silva"
            vehicle="Honda Civic (Prata)"
            service="Lavagem Completa"
            price={70.00}
            status="in_progress"
            startTime="há 45 min"
        />
        <OrderCard 
            id="OS-2024-002"
            plate="XYZ-9876"
            client="Maria Oliveira"
            vehicle="Jeep Compass (Preto)"
            service="Higienização Interna"
            price={300.00}
            status="pending"
            startTime="há 10 min"
        />
        <OrderCard 
            id="OS-2024-003"
            plate="KRY-2024"
            client="Carlos Santos"
            vehicle="Toyota Corolla (Azul)"
            service="Lavagem Simples"
            price={50.00}
            status="completed"
            startTime="há 2h"
            endTime="14:30"
        />
      </div>
    </div>
  )
}

function TabItem({ label, count, active }: { label: string; count: number; active?: boolean }) {
  return (
    <button className={`pb-4 px-2 text-sm font-medium transition-all relative ${active ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>
      {label}
      <span className="ml-2 bg-gray-800 px-2 py-0.5 rounded-full text-[10px]">{count}</span>
      {active && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />}
    </button>
  )
}

function OrderCard({ id, plate, client, vehicle, service, price, status, startTime, endTime }: any) {
  const statusConfig: any = {
    pending: { label: 'Aguardando', icon: <Clock className="w-4 h-4" />, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    in_progress: { label: 'Em lavagem', icon: <Car className="w-4 h-4" />, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    completed: { label: 'Finalizado', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-500 bg-green-500/10 border-green-500/20' },
    canceled: { label: 'Cancelado', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-500 bg-red-500/10 border-red-500/20' }
  }

  const currentStatus = statusConfig[status]

  return (
    <motion.div 
      whileHover={{ scale: 1.005 }}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-gray-700 transition-all"
    >
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
           <span className="font-mono font-bold text-xs text-blue-400">{plate}</span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-500">{id}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${currentStatus.color} flex items-center gap-1 font-bold uppercase`}>
              {currentStatus.icon}
              {currentStatus.label}
            </span>
          </div>
          <h3 className="font-bold text-lg">{vehicle}</h3>
          <p className="text-sm text-gray-400">{client} • <span className="text-blue-400/80">{service}</span></p>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 border-gray-800 pt-4 md:pt-0">
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Valor</p>
          <p className="text-xl font-bold text-white">R$ {price.toFixed(2)}</p>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Início</p>
          <p className="text-sm text-gray-300">{startTime}</p>
        </div>

        <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition">
           <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </motion.div>
  )
}

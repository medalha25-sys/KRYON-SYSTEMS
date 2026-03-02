'use client'

import React, { useState, useEffect } from 'react'
import { getFullOrders } from '../actions'
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Calendar
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function PedidosPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'hoje' | 'andamento' | 'concluidos'>('andamento')
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const data = await getFullOrders()
      setOrders(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filteredOrders = orders.filter(order => {
    const today = new Date().toISOString().split('T')[0]
    const orderDate = order.created_at?.split('T')[0]

    if (filter === 'hoje') return orderDate === today
    if (filter === 'concluidos') return order.status === 'entregue' || order.status === 'pago'
    return order.status !== 'entregue' && order.status !== 'pago' && order.status !== 'cancelado'
  })

  if (loading) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 pb-32">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pt-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Pedidos</h1>
          <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest">Gestão de Vendas</p>
        </div>
        <button 
          onClick={() => router.push('/concrete/pedidos/novo')}
          className="bg-orange-600 text-black p-4 rounded-2xl shadow-lg shadow-orange-600/20 active:scale-90 transition-transform"
        >
          <Plus className="w-6 h-6 stroke-[3px]" />
        </button>
      </header>

      {/* Quick Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        <FilterButton 
          active={filter === 'hoje'} 
          onClick={() => setFilter('hoje')} 
          label="Hoje" 
          icon={<Calendar size={14} />} 
        />
        <FilterButton 
          active={filter === 'andamento'} 
          onClick={() => setFilter('andamento')} 
          label="Em Aberto" 
          icon={<Clock size={14} />} 
        />
        <FilterButton 
          active={filter === 'concluidos'} 
          onClick={() => setFilter('concluidos')} 
          label="Concluídos" 
          icon={<CheckCircle2 size={14} />} 
        />
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredOrders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-neutral-950/50 border border-dashed border-neutral-800 rounded-[2rem]"
            >
              <AlertCircle className="w-12 h-12 text-neutral-800 mx-auto mb-4" />
              <p className="text-neutral-600 font-bold uppercase text-[10px] tracking-widest">Nenhum pedido encontrado</p>
            </motion.div>
          ) : (
            filteredOrders.map((order, idx) => (
              <OrderCard key={order.id} order={order} delay={idx * 0.05} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function FilterButton({ active, onClick, label, icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
        active 
        ? 'bg-neutral-100 text-black shadow-lg' 
        : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function OrderCard({ order, delay }: any) {
  const router = useRouter()
  
  const getStatusInfo = (status: string) => {
    switch(status) {
      case 'pendente': return { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' }
      case 'em_producao': return { label: 'Produção', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' }
      case 'entregue': return { label: 'Entregue', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' }
      case 'cancelado': return { label: 'Cancelado', color: 'bg-red-500/10 text-red-500 border-red-500/20' }
      default: return { label: status, color: 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20' }
    }
  }

  const status = getStatusInfo(order.status)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/concrete/pedidos/${order.id}`)}
      className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-[2rem] hover:bg-neutral-900/80 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-neutral-600 tracking-wider uppercase">Pedido #{order.numero_pedido || idx}</p>
          <h3 className="text-lg font-bold leading-tight group-hover:text-orange-500 transition-colors">{order.erp_clients?.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${status.color}`}>
              {status.label}
            </span>
            <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-tighter">
              {new Date(order.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-white tracking-tighter">
            R$ {Number(order.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </p>
          <div className="flex items-center justify-end gap-1 mt-1 text-neutral-500 group-hover:text-white transition-colors">
            <span className="text-[9px] font-black uppercase">Ver</span>
            <ChevronRight size={14} strokeWidth={3} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

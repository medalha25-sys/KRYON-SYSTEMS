'use client'

import React, { useState } from 'react'
import { 
    Search, 
    DollarSign, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    ChevronRight,
    TrendingUp
} from 'lucide-react'
import { markAsPaidAction } from '../../actions'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export default function AccountsReceivableClient({ initialData, metrics }: { initialData: any[], metrics: any }) {
    const [data, setData] = useState(initialData)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('pendente')
    const [loading, setLoading] = useState<string | null>(null)

    const filteredData = data.filter(item => {
        const matchesSearch = item.erp_clients?.name?.toLowerCase().includes(search.toLowerCase())
        const matchesFilter = filter === 'todos' || item.status === filter
        return matchesSearch && matchesFilter
    })

    const handleMarkAsPaid = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (!confirm('Confirmar recebimento?')) return
        setLoading(id)
        try {
            const res = await markAsPaidAction(id)
            if (res.success) {
                toast.success('Recebido com sucesso!')
                setData(data.map(item => item.id === id ? { ...item, status: 'pago', data_pagamento: new Date().toISOString() } : item))
            } else {
                toast.error(res.error)
            }
        } catch (err) {
            toast.error('Erro ao processar')
        } finally {
            setLoading(null)
        }
    }

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pago': return { label: 'Recebido', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: <CheckCircle2 size={12} /> }
            case 'vencido': return { label: 'Vencido', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: <AlertCircle size={12} /> }
            default: return { label: 'A receber', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: <Clock size={12} /> }
        }
    }

    return (
        <div className="space-y-8">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-[2rem]">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">A Receber</p>
                    <h3 className="text-xl font-black font-mono text-orange-500 tracking-tighter">
                        R$ {metrics.total_a_receber.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </h3>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-[2rem]">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">Recebido</p>
                    <h3 className="text-xl font-black font-mono text-emerald-500 tracking-tighter">
                        R$ {metrics.total_recebido.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </h3>
                </div>
            </div>

            {/* Monthly Summary Strip */}
            <div className="bg-orange-600 p-6 rounded-[2.5rem] flex items-center justify-between shadow-xl shadow-orange-600/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-black/10 rounded-xl">
                        <TrendingUp className="text-black" size={20} />
                    </div>
                    <div>
                        <p className="text-black/60 text-[9px] font-black uppercase tracking-widest leading-none mb-1">Total do Mês</p>
                        <h4 className="text-2xl font-black text-black leading-none">
                            R$ {(metrics.total_a_receber + metrics.total_recebido).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </h4>
                    </div>
                </div>
                <ChevronRight className="text-black/40" size={24} />
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input 
                        type="text"
                        placeholder="Buscar por cliente..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-neutral-900/50 border border-neutral-800 p-4 pl-12 rounded-2xl text-white outline-none focus:border-orange-500 transition-all text-sm"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {['todos', 'pendente', 'pago', 'vencido'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                filter === s 
                                ? 'bg-neutral-100 text-black shadow-lg' 
                                : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredData.map((item, idx) => {
                        const status = getStatusInfo(item.status)
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.03 }}
                                className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-[2rem] flex flex-col gap-4 active:bg-neutral-900/80 transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black text-neutral-600 tracking-[0.2em] uppercase mb-1">#{item.id.slice(0, 8)}</p>
                                        <h3 className="font-bold text-white truncate text-base leading-tight group-hover:text-orange-500 transition-colors">{item.erp_clients?.name}</h3>
                                        <div className="flex items-center gap-2 mt-3">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${status.color}`}>
                                                {status.icon}
                                                {status.label}
                                            </span>
                                            <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">
                                                VENC: {new Date(item.data_vencimento).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-white tracking-tighter">
                                            R$ {Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                                        </p>
                                        {item.status !== 'pago' ? (
                                            <button 
                                                onClick={(e) => handleMarkAsPaid(e, item.id)}
                                                disabled={loading === item.id}
                                                className="mt-3 bg-orange-600 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-orange-600/10 flex items-center gap-2 ml-auto"
                                            >
                                                <DollarSign size={12} strokeWidth={3} />
                                                {loading === item.id ? '...' : 'Receber'}
                                            </button>
                                        ) : (
                                            <div className="mt-3 flex items-center gap-1 justify-end text-emerald-500/50">
                                                <CheckCircle2 size={12} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Liquidado</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {filteredData.length === 0 && (
                    <div className="py-20 text-center bg-neutral-950/50 border border-dashed border-neutral-900 rounded-[2rem]">
                        <DollarSign className="w-12 h-12 text-neutral-800 mx-auto mb-4" />
                        <p className="text-neutral-600 font-bold uppercase text-[10px] tracking-widest">Nenhum título encontrado</p>
                    </div>
                )}
            </div>
        </div>
    )
}

'use client'

import React, { useState } from 'react'
import { 
    Search, 
    Filter, 
    DollarSign, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Calendar,
    ArrowRight,
    MoreHorizontal,
    CreditCard
} from 'lucide-react'
import { markAsPaidAction } from '../../actions'
import { toast } from 'sonner'

export default function AccountsReceivableClient({ initialData, metrics }: { initialData: any[], metrics: any }) {
    const [data, setData] = useState(initialData)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('todos')
    const [loading, setLoading] = useState<string | null>(null)

    const filteredData = data.filter(item => {
        const matchesSearch = item.erp_clients?.name?.toLowerCase().includes(search.toLowerCase()) ||
                             item.pedido_id?.toLowerCase().includes(search.toLowerCase())
        const matchesFilter = filter === 'todos' || item.status === filter
        return matchesSearch && matchesFilter
    })

    const handleMarkAsPaid = async (id: string) => {
        if (!confirm('Deseja confirmar o recebimento deste título?')) return
        setLoading(id)
        try {
            const res = await markAsPaidAction(id)
            if (res.success) {
                toast.success('Título liquidado com sucesso!')
                setData(data.map(item => item.id === id ? { ...item, status: 'pago', data_pagamento: new Date().toISOString() } : item))
            } else {
                toast.error(res.error)
            }
        } catch (err) {
            toast.error('Erro ao processar pagamento')
        } finally {
            setLoading(null)
        }
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'pago': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            case 'vencido': return 'bg-red-500/10 text-red-400 border-red-500/20'
            default: return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pago': return <CheckCircle2 className="w-3 h-3" />
            case 'vencido': return <AlertCircle className="w-3 h-3" />
            default: return <Clock className="w-3 h-3" />
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Financial Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-16 h-16 text-orange-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Total Pendente</p>
                    <h3 className="text-3xl font-black font-mono text-orange-500 tracking-tighter">
                        R$ {metrics.total_a_receber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Total Recebido</p>
                    <h3 className="text-3xl font-black font-mono text-emerald-500 tracking-tighter">
                        R$ {metrics.total_recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group border-red-500/20 shadow-lg shadow-red-500/5">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertCircle className="w-16 h-16 text-red-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Total Vencido</p>
                    <h3 className="text-3xl font-black font-mono text-red-500 tracking-tighter">
                        R$ {metrics.total_vencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text"
                        placeholder="Buscar por cliente ou pedido..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-3 pl-10 rounded-xl text-white outline-none focus:border-blue-500 transition-all text-sm"
                    />
                </div>

                <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 w-full md:w-auto overflow-x-auto">
                    {['todos', 'pendente', 'pago', 'vencido'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                filter === s 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800/50 bg-slate-950/50">
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Info Título</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Cliente</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Vencimento</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Valor</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-mono text-slate-400">#{item.id.slice(0, 8)}</span>
                                            <span className="text-[9px] text-slate-600 uppercase">Ref: Pedido #{item.pedido_id?.slice(0, 8)}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                                                {item.erp_clients?.name?.charAt(0)}
                                            </div>
                                            <span className="font-bold text-white uppercase text-xs tracking-tight">{item.erp_clients?.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(item.data_vencimento).toLocaleDateString('pt-BR')}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-sm font-black font-mono ${item.status === 'vencido' ? 'text-red-400' : 'text-emerald-400'}`}>
                                            R$ {Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(item.status)}`}>
                                            {getStatusIcon(item.status)}
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {item.status !== 'pago' ? (
                                            <button 
                                                onClick={() => handleMarkAsPaid(item.id)}
                                                disabled={loading === item.id}
                                                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg shadow-emerald-600/20 flex items-center gap-2 ml-auto"
                                            >
                                                <DollarSign className="w-3 h-3" />
                                                {loading === item.id ? '...' : 'Receber'}
                                            </button>
                                        ) : (
                                            <div className="text-[9px] text-slate-500 uppercase font-bold flex flex-col items-end">
                                                <span>Pago em: {new Date(item.data_pagamento).toLocaleDateString('pt-BR')}</span>
                                                <span className="text-emerald-500/50 flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> LIQUIDADO</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredData.length === 0 && (
                    <div className="p-20 text-center">
                        <DollarSign className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                        <h4 className="text-slate-400 font-bold uppercase tracking-widest">Nenhum título encontrado</h4>
                        <p className="text-slate-600 text-[10px] mt-2">Ajuste os filtros ou aguarde novas entregas.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

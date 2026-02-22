'use client'

import React, { useState } from 'react'
import { updateFullOrderStatus } from '../../actions'
import { 
    ArrowLeft, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    Truck,
    Box,
    User,
    Calendar,
    Hash,
    TrendingUp,
    Printer,
    Package
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
    order: any
}

export default function OrderDetailsClient({ order }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleStatusChange = async (newStatus: any) => {
        setLoading(true)
        const res = await updateFullOrderStatus(order.id, newStatus)
        setLoading(false)

        if (res.success) {
            toast.success(`Status do pedido alterado para ${newStatus.replace('_', ' ')}`)
            router.refresh()
        } else {
            toast.error(res.error || 'Erro ao alterar status')
        }
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6 md:p-10 font-sans">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/concrete/pedidos" 
                            className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-orange-500 transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white">Pedido #{order.numero_pedido}</h1>
                                <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                    {order.status.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase">Fluxo Operacional de Produção</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {['pendente', 'em_producao', 'pronto', 'entregue', 'cancelado'].map(st => (
                            <button
                                key={st}
                                onClick={() => handleStatusChange(st)}
                                disabled={loading || order.status === st}
                                className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                                    order.status === st 
                                    ? 'bg-neutral-800 border-neutral-700 text-neutral-500 cursor-not-allowed shadow-inner'
                                    : 'bg-neutral-900 border-neutral-800 hover:border-blue-500 text-neutral-300'
                                }`}
                            >
                                {st.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Informações do Cliente e Pedido */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between gap-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-black rounded-lg border border-neutral-800">
                                        <User className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Cliente / Destino</p>
                                        <p className="text-xl font-black text-white">{order.erp_clients?.name}</p>
                                        <p className="text-xs text-neutral-400 mt-1 uppercase font-mono tracking-tight">{order.erp_clients?.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-black rounded-lg border border-neutral-800">
                                        <Calendar className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Data de Emissão</p>
                                        <p className="text-xl font-black text-white">{new Date(order.created_at).toLocaleDateString('pt-BR', { dateStyle: 'long' })}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-black/40 p-6 rounded-xl border border-neutral-800 flex flex-col justify-center min-w-[200px]">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2 flex items-center gap-2 tracking-widest">
                                    <Hash className="w-3 h-3 text-orange-500" /> Orçamento Origem
                                </p>
                                <p className="text-sm font-black text-white uppercase italic">
                                    {order.orcamento_id ? `Budget #${order.orcamento_id.slice(0, 8)}` : 'Venda Direta'}
                                </p>
                            </div>
                        </div>

                        {/* Tabela de Itens do Pedido */}
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                            <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-orange-500" />
                                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Itens para Carregamento</h3>
                                </div>
                                <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-tighter">Total de {order.erp_order_items?.length} sku's</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-black/50 text-[10px] font-black uppercase tracking-widest text-neutral-500 border-b border-neutral-800">
                                        <tr>
                                            <th className="px-6 py-4">Especificação Técnica</th>
                                            <th className="px-6 py-4 text-center">Volume (m³)</th>
                                            <th className="px-6 py-4 text-right">Subtotal Venda</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800">
                                        {order.erp_order_items?.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-black/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-white uppercase text-sm">{item.erp_products?.name}</p>
                                                    <p className="text-[10px] text-neutral-500 italic uppercase">Cód: {item.produto_id.slice(0, 8)}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="bg-orange-950/30 text-orange-500 px-3 py-1 rounded font-mono font-bold border border-orange-500/20">
                                                        {Number(item.quantidade_m3).toFixed(3)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono font-black text-white/70">
                                                    R$ {Number(item.subtotal).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Lado Direito: Resumo Financeiro e Ações */}
                    <div className="space-y-6">
                        <div className="bg-blue-600 rounded-2xl p-8 text-black shadow-2xl relative overflow-hidden flex flex-col h-full border border-blue-400/20">
                            <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-2 leading-none">Valor Comercial do Pedido</p>
                            <h3 className="text-5xl font-black italic tracking-tighter mb-auto">
                                R$ {Number(order.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                            
                            <div className="space-y-4 mt-8 pt-8 border-t border-black/10">
                                <div className="bg-black/10 rounded-xl p-4 flex items-center justify-between border border-black/5">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase shrink-0">Impacto no Dashboard</span>
                                    </div>
                                    <span className="text-xs font-black uppercase italic">Operacional</span>
                                </div>
                            </div>

                            <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-white/10 rounded-full blur-3xl invisible md:visible" />
                        </div>

                        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-lg">
                             <h4 className="text-[10px] font-black uppercase text-neutral-500 mb-4 tracking-widest border-b border-neutral-800 pb-2">Logística e Produção</h4>
                             
                             <button className="w-full bg-neutral-800 hover:bg-neutral-700 text-white p-4 rounded-xl text-xs font-black flex items-center justify-center gap-3 transition mb-3 uppercase tracking-widest border border-neutral-700">
                                <Printer className="w-4 h-4" /> Imprimir Guia de Carga
                             </button>
                             
                             <div className="mt-6 p-4 bg-black/50 rounded-xl border border-neutral-800">
                                <p className="text-[9px] text-neutral-500 uppercase font-black mb-3 tracking-widest">Informação do Sistema</p>
                                <p className="text-[10px] text-neutral-400 leading-relaxed italic">
                                    Este pedido foi gerado automaticamente a partir de um orçamento aprovado. Qualquer alteração técnica deve ser validada pelo setor de engenharia.
                                </p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function getStatusColor(status: string) {
    switch (status) {
        case 'entregue': return 'bg-emerald-900 text-emerald-200'
        case 'cancelado': return 'bg-red-900 text-red-200'
        case 'em_producao': return 'bg-blue-900 text-blue-200'
        case 'pronto': return 'bg-orange-900 text-orange-200'
        default: return 'bg-neutral-800 text-neutral-400'
    }
}

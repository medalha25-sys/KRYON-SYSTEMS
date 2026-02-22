'use client'

import React, { useState } from 'react'
import { updateFullBudgetStatus, convertBudgetToOrderAction } from '../../actions'
import { 
    ArrowLeft, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    DollarSign,
    Box,
    User,
    Calendar,
    Hash,
    TrendingUp,
    Download,
    ShoppingCart
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
    budget: any
}

export default function BudgetDetailsClient({ budget }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleStatusChange = async (newStatus: any) => {
        setLoading(true)
        const res = await updateFullBudgetStatus(budget.id, newStatus)
        setLoading(false)

        if (res.success) {
            toast.success(`Status alterado para ${newStatus}`)
            router.refresh()
        } else {
            toast.error(res.error || 'Erro ao alterar status')
        }
    }

    const handleGenerateOrder = async () => {
        setLoading(true)
        const res = await convertBudgetToOrderAction(budget.id)
        setLoading(false)

        if (res.success) {
            toast.success('Pedido gerado com sucesso! Redirecionando...')
            router.push(`/concrete/pedidos/${res.orderId}`)
        } else {
            toast.error(res.error || 'Erro ao gerar pedido')
        }
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6 md:p-10 font-sans">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/concrete/orcamentos" 
                            className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-orange-500 transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white">Orçamento #{budget.numero_orcamento}</h1>
                                <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${getStatusColor(budget.status)}`}>
                                    {budget.status}
                                </span>
                            </div>
                            <p className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase">Visualização de Detalhes Técnica</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {['enviado', 'aprovado', 'cancelado'].map(st => (
                            <button
                                key={st}
                                onClick={() => handleStatusChange(st)}
                                disabled={loading || budget.status === st}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                                    budget.status === st 
                                    ? 'bg-neutral-800 border-neutral-700 text-neutral-500 cursor-not-allowed'
                                    : 'bg-neutral-900 border-neutral-800 hover:border-orange-500 text-neutral-300'
                                }`}
                            >
                                Marcar como {st}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Resumo Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between gap-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-3">
                                    <User className="w-5 h-5 text-orange-500 mt-1" />
                                    <div>
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Cliente Solicitante</p>
                                        <p className="text-xl font-black text-white">{budget.erp_clients?.name}</p>
                                        <p className="text-xs text-neutral-400 mt-1">{budget.erp_clients?.email} | {budget.erp_clients?.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-orange-500 mt-1" />
                                    <div>
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Data da Emissão</p>
                                        <p className="text-xl font-black text-white">{new Date(budget.data).toLocaleDateString('pt-BR', { dateStyle: 'long' })}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-black/40 p-6 rounded-xl border border-neutral-800 flex flex-col justify-center min-w-[200px]">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2 flex items-center gap-2">
                                    <Hash className="w-3 h-3" /> Identificador UUID
                                </p>
                                <p className="text-[9px] font-mono text-neutral-600 break-all">{budget.id}</p>
                            </div>
                        </div>

                        {/* Tabela de Itens */}
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                            <div className="p-6 border-b border-neutral-800 flex items-center gap-2">
                                <Box className="w-4 h-4 text-orange-500" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Composição do Orçamento</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-black/50 text-[10px] font-black uppercase tracking-widest text-neutral-500 border-b border-neutral-800">
                                        <tr>
                                            <th className="px-6 py-4">Produto</th>
                                            <th className="px-6 py-4 text-center">Volume</th>
                                            <th className="px-6 py-4 text-right">Preço Unit.</th>
                                            <th className="px-6 py-4 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800">
                                        {budget.erp_budget_items?.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-black/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-white uppercase text-sm">{item.erp_products?.name}</p>
                                                    <p className="text-[10px] text-neutral-500 italic uppercase">{item.erp_products?.categoria}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center font-mono font-bold text-orange-500">
                                                    {Number(item.quantidade_m3).toFixed(3)} m³
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-xs">
                                                    R$ {Number(item.preco_unitario).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono font-black text-white">
                                                    R$ {Number(item.subtotal).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Lado Direito: Financeiro */}
                    <div className="space-y-6">
                        <div className="bg-orange-600 rounded-2xl p-8 text-black shadow-2xl relative overflow-hidden flex flex-col h-full">
                            <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-2 leading-none">VGV da Obra (Global)</p>
                            <h3 className="text-5xl font-black italic tracking-tighter mb-auto">
                                R$ {Number(budget.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                            
                            <div className="space-y-4 mt-8 pt-8 border-t border-black/10">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold uppercase opacity-60 italic">Margem Operacional</span>
                                    <span className="text-lg font-black font-mono">
                                        R$ {Number(budget.lucro_total).toFixed(2)}
                                    </span>
                                </div>
                                <div className="bg-black/10 rounded-xl p-4 flex items-center justify-between border border-black/5">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase shrink-0">Mark-up Bruto</span>
                                    </div>
                                    <span className="text-base font-black font-mono">
                                        {((Number(budget.lucro_total) / (Number(budget.custo_total) || 1)) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-white/10 rounded-full blur-3xl invisible md:visible" />
                        </div>

                        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                             <h4 className="text-[10px] font-black uppercase text-neutral-500 mb-4 tracking-widest border-b border-neutral-800 pb-2">Ações Administrativas</h4>
                             
                             {budget.status === 'aprovado' && (
                                <button 
                                    onClick={handleGenerateOrder}
                                    disabled={loading}
                                    className="w-full bg-orange-500 hover:bg-orange-400 text-black p-4 rounded-xl text-xs font-black flex items-center justify-center gap-3 transition mb-4 shadow-xl shadow-orange-500/10 uppercase tracking-widest"
                                >
                                    <ShoppingCart className="w-5 h-5" /> Gerar Pedido Operacional
                                </button>
                             )}

                             <button className="w-full bg-neutral-800 hover:bg-neutral-700 text-white p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition mb-3">
                                <Download className="w-4 h-4" /> Exportar em PDF
                             </button>
                             <p className="text-[9px] text-neutral-600 text-center uppercase font-bold tracking-tight px-4 leading-relaxed">
                                Este registro impactará diretamente os índices de conversão e faturamento projetado do dashboard.
                             </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'aprovado': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        case 'cancelado': return <XCircle className="w-5 h-5 text-red-500" />
        case 'enviado': return <Clock className="w-5 h-5 text-blue-500" />
        default: return <AlertCircle className="w-5 h-5 text-neutral-500" />
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case 'aprovado': return 'bg-emerald-900 text-emerald-200'
        case 'cancelado': return 'bg-red-900 text-red-200'
        case 'enviado': return 'bg-blue-900 text-blue-200'
        default: return 'bg-neutral-800 text-neutral-400'
    }
}

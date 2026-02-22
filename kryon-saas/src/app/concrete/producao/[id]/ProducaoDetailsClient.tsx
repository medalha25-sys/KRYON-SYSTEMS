'use client'

import React, { useState } from 'react'
import { updateProductionOrderStatus } from '../../actions'
import { 
    ArrowLeft, 
    Factory, 
    CheckCircle2, 
    Play, 
    Clock, 
    Box, 
    LayoutDashboard,
    AlertCircle,
    RotateCcw,
    Navigation
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface Props {
    order: any
}

export default function ProducaoDetailsClient({ order }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleStatusUpdate = async (newStatus: 'aguardando' | 'produzindo' | 'finalizado') => {
        setLoading(true)
        const res = await updateProductionOrderStatus(order.id, newStatus)
        setLoading(false)

        if (res.success) {
            toast.success(`Ordem de produção marcada como ${newStatus}`)
            router.refresh()
        } else {
            toast.error(res.error || 'Erro ao atualizar status')
        }
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6 md:p-10 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 flex items-center gap-6">
                    <Link 
                        href="/concrete/producao" 
                        className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-blue-500 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">Controle de Produção</h1>
                            <span className="text-[10px] font-mono text-neutral-500">OP #{order.id.slice(0, 8)}</span>
                        </div>
                        <p className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase">Gestão Operacional de Usina de Concreto</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl space-y-8">
                             <div>
                                <h2 className="text-sm font-black text-neutral-500 uppercase tracking-widest mb-4">Especificação do Item</h2>
                                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
                                    {order.erp_products?.name}
                                </h3>
                                <p className="text-xs text-blue-500 font-bold uppercase tracking-widest">
                                    Categoria: {order.erp_products?.categoria}
                                </p>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/50 p-6 rounded-2xl border border-neutral-800">
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">Volume Total</p>
                                    <p className="text-3xl font-black text-blue-500 font-mono italic">
                                        {Number(order.quantidade_m3).toFixed(3)} <span className="text-sm opacity-50">m³</span>
                                    </p>
                                </div>
                                <div className="bg-black/50 p-6 rounded-2xl border border-neutral-800">
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">Pedido Origem</p>
                                    <p className="text-3xl font-black text-orange-500 font-mono italic">
                                        #{order.erp_orders?.numero_pedido}
                                    </p>
                                </div>
                             </div>

                             <div className="pt-6 border-t border-neutral-800 flex flex-col gap-4">
                                {order.status === 'finalizado' && (
                                    <Link 
                                        href={`/concrete/entregas/novo?op_id=${order.id}`}
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-black p-4 rounded-xl text-xs font-black flex items-center justify-center gap-3 transition uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                                    >
                                        <Navigation className="w-4 h-4 fill-black" /> Despachar para Entrega
                                    </Link>
                                )}
                                <div className="flex items-center justify-between text-xs font-bold text-neutral-500 italic">
                                    <span>Início do Processo: {new Date(order.created_at).toLocaleString()}</span>
                                    <Box className="w-4 h-4 opacity-30" />
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl h-full flex flex-col justify-between">
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-neutral-500 mb-8 tracking-[0.2em] border-b border-neutral-800 pb-4">Controles do Operador</h4>
                                
                                <div className="space-y-4">
                                    <StatusButton 
                                        label="Aguardando" 
                                        status="aguardando" 
                                        active={order.status === 'aguardando'} 
                                        icon={<Clock className="w-5 h-5" />}
                                        onClick={() => handleStatusUpdate('aguardando')}
                                        loading={loading}
                                    />
                                    <StatusButton 
                                        label="Em Produção" 
                                        status="produzindo" 
                                        active={order.status === 'produzindo'} 
                                        icon={<Play className="w-5 h-5" />}
                                        onClick={() => handleStatusUpdate('produzindo')}
                                        loading={loading}
                                        pulse
                                    />
                                    <StatusButton 
                                        label="Finalizar Lote" 
                                        status="finalizado" 
                                        active={order.status === 'finalizado'} 
                                        icon={<CheckCircle2 className="w-5 h-5" />}
                                        onClick={() => handleStatusUpdate('finalizado')}
                                        loading={loading}
                                        variant="emerald"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-blue-900/10 rounded-xl border border-blue-500/20 flex gap-4">
                                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                                <p className="text-[10px] text-blue-300 leading-relaxed uppercase font-bold tracking-tight">
                                    A finalização deste item atualizará automaticamente os indicadores de produtividade da usina no dashboard executivo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatusButton({ label, status, active, icon, onClick, loading, pulse, variant = 'blue' }: any) {
    const activeStyles = {
        blue: 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20',
        emerald: 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20',
    }

    const inactiveStyles = 'bg-black/40 border-neutral-800 text-neutral-500 hover:border-neutral-600'

    return (
        <button
            onClick={onClick}
            disabled={loading || active}
            className={`w-full p-6 rounded-2xl border flex items-center justify-between transition-all group ${
                active ? activeStyles[variant as keyof typeof activeStyles] : inactiveStyles
            }`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${active ? 'bg-white/10' : 'bg-neutral-800'} transition-colors`}>
                    {icon}
                </div>
                <span className="text-sm font-black uppercase tracking-widest">{label}</span>
            </div>
            {active && pulse && (
                <div className="flex gap-1">
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
            )}
            {!active && <div className="w-2 h-2 rounded-full border border-neutral-700" />}
        </button>
    )
}

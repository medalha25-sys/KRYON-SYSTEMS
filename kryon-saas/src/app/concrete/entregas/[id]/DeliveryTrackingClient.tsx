'use client'

import React, { useState } from 'react'
import { updateDeliveryStatus } from '../../actions'
import { 
    ArrowLeft, 
    Navigation, 
    Truck, 
    User, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    Calendar,
    MapPin,
    Package
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface Props {
    delivery: any
}

export default function DeliveryTrackingClient({ delivery }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleStatusUpdate = async (newStatus: string) => {
        setLoading(true)
        const res = await updateDeliveryStatus(delivery.id, newStatus)
        setLoading(false)

        if (res.success) {
            toast.success(`Status da entrega atualizado para ${newStatus}`)
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
                        href="/concrete/entregas" 
                        className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-emerald-500 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">Rastreamento de Carga</h1>
                            <span className="text-[10px] font-mono text-neutral-500">Log ID: #{delivery.id.slice(0, 8)}</span>
                        </div>
                        <p className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase">Operação de Transporte e Logística</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        {/* Status da Entrega */}
                        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl">
                             <h2 className="text-[10px] font-black uppercase text-neutral-500 mb-8 tracking-widest border-b border-neutral-800 pb-4">Status do Transporte</h2>
                             
                             <div className="relative space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-800">
                                <StatusStep 
                                    label="Carga Agendada" 
                                    active={delivery.status === 'agendada'} 
                                    done={['em_transporte', 'entregue'].includes(delivery.status)}
                                    time={new Date(delivery.data_saida).toLocaleTimeString()}
                                />
                                <StatusStep 
                                    label="Em Transporte" 
                                    active={delivery.status === 'em_transporte'} 
                                    done={delivery.status === 'entregue'}
                                    pulse
                                />
                                <StatusStep 
                                    label="Entrega Concluída" 
                                    active={delivery.status === 'entregue'} 
                                    done={delivery.status === 'entregue'}
                                    isLast
                                />
                             </div>
                        </div>

                        {/* Detalhes Técnicos */}
                        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-neutral-500 uppercase">Caminhão</p>
                                <p className="text-lg font-black text-white italic">{delivery.erp_trucks?.placa}</p>
                                <p className="text-[10px] text-neutral-500 uppercase">{delivery.erp_trucks?.modelo}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[9px] font-bold text-neutral-500 uppercase">Motorista</p>
                                <p className="text-lg font-black text-white italic uppercase">{delivery.erp_drivers?.nome}</p>
                            </div>
                            <div className="col-span-2 pt-4 border-t border-neutral-800">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Volume Transportado</span>
                                    </div>
                                    <span className="text-xl font-black text-white font-mono">{Number(delivery.volume_transportado_m3).toFixed(3)} m³</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Ações do Operador */}
                        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl h-full flex flex-col justify-between">
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-neutral-500 mb-8 tracking-[0.2em] border-b border-neutral-800 pb-4">Controles Logísticos</h4>
                                
                                <div className="space-y-4">
                                    <ActionButton 
                                        label="Iniciar Transporte" 
                                        active={delivery.status === 'em_transporte'} 
                                        disabled={loading || delivery.status !== 'agendada'}
                                        icon={<Navigation className="w-5 h-5" />}
                                        onClick={() => handleStatusUpdate('em_transporte')}
                                    />
                                    <ActionButton 
                                        label="Confirmar Entrega" 
                                        active={delivery.status === 'entregue'} 
                                        disabled={loading || delivery.status !== 'em_transporte'}
                                        icon={<CheckCircle2 className="w-5 h-5" />}
                                        onClick={() => handleStatusUpdate('entregue')}
                                        variant="emerald"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-emerald-900/10 rounded-xl border border-emerald-500/20 flex gap-4">
                                <AlertCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                <p className="text-[10px] text-emerald-300 leading-relaxed uppercase font-bold tracking-tight">
                                    As atualizações de status são sincronizadas em tempo real com o dashboard de vendas e faturamento da empresa.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatusStep({ label, active, done, time, pulse, isLast }: any) {
    return (
        <div className="flex items-center gap-4 relative">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
                done ? 'bg-emerald-600 border-emerald-500' : 
                active ? 'bg-blue-600 border-blue-500' : 'bg-black border-neutral-800'
            }`}>
                {done ? <CheckCircle2 className="w-3 h-3 text-white" /> : 
                 active ? <div className="w-1.5 h-1.5 bg-white rounded-full" /> : null}
            </div>
            <div className="flex-1 border-b border-neutral-800 pb-4">
                <div className="flex justify-between items-center">
                    <span className={`text-xs font-black uppercase tracking-widest ${
                        active || done ? 'text-white' : 'text-neutral-600'
                    }`}>
                        {label}
                    </span>
                    {time && <span className="text-[9px] font-mono text-neutral-500 italic">{time}</span>}
                </div>
            </div>
            {active && pulse && (
                <motion.div 
                    animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute left-[7px] w-3 h-3 bg-blue-500 rounded-full blur-[2px]"
                />
            )}
        </div>
    )
}

function ActionButton({ label, active, disabled, icon, onClick, variant = 'blue' }: any) {
    const activeStyles = {
        blue: 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 opacity-50 cursor-not-allowed',
        emerald: 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 opacity-50 cursor-not-allowed',
    }

    const inactiveStyles = 'bg-black/40 border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-white transition-all'

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full p-6 rounded-2xl border flex items-center gap-4 transition-all group ${
                active ? activeStyles[variant as keyof typeof activeStyles] : 
                disabled ? 'opacity-20 cursor-not-allowed' : inactiveStyles
            }`}
        >
            <div className={`p-2 rounded-lg ${active ? 'bg-white/10' : 'bg-neutral-800'} transition-colors`}>
                {icon}
            </div>
            <span className="text-sm font-black uppercase tracking-widest">{label}</span>
        </button>
    )
}

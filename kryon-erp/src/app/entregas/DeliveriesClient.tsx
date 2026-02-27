'use client'

import React, { useState } from 'react'
import { Navigation, Calendar, Package, Clock, CheckCircle2, MapPin, XCircle, ArrowRight } from 'lucide-react'
import { updateDeliveryStatusAction, emitirNFeAction } from '../actions'
import { toast } from 'sonner'

interface Props {
    deliveries: any[]
}

export default function DeliveriesClient({ deliveries: initialDeliveries }: Props) {
    const [deliveries, setDeliveries] = useState(initialDeliveries)
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleNextStatus = async (id: string, currentStatus: string) => {
        let nextStatus = ''
        switch (currentStatus) {
            case 'programada': nextStatus = 'transporte'; break
            case 'transporte': nextStatus = 'entregue'; break
            default: return
        }

        setLoadingId(id)
        try {
            const res = await updateDeliveryStatusAction(id, nextStatus)
            if (res.success) {
                toast.success(`Status atualizado para ${nextStatus.toUpperCase()}`)
                setDeliveries(deliveries.map(d => d.id === id ? { ...d, status: nextStatus } : d))
            } else {
                toast.error(res.error)
            }
        } catch (err) {
            toast.error('Erro ao atualizar status')
        } finally {
            setLoadingId(null)
        }
    }

    const handleEmitirNFe = async (id: string) => {
        setLoadingId(id)
        try {
            const res = await emitirNFeAction(id)
            if (res.success) {
                toast.success(`NF-e nº ${res.numero} emitida com sucesso!`)
            } else {
                toast.error(res.error)
            }
        } catch (err) {
            toast.error('Erro ao emitir NF-e')
        } finally {
            setLoadingId(null)
        }
    }

    const handleCancel = async (id: string) => {
        if (!confirm('Deseja realmente cancelar esta entrega?')) return

        setLoadingId(id)
        try {
            const res = await updateDeliveryStatusAction(id, 'cancelada')
            if (res.success) {
                toast.success('Entrega cancelada')
                setDeliveries(deliveries.map(d => d.id === id ? { ...d, status: 'cancelada' } : d))
            } else {
                toast.error(res.error)
            }
        } catch (err) {
            toast.error('Erro ao cancelar entrega')
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-8">
                <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500">Programação de Expedição</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {deliveries.length > 0 ? deliveries.map((delivery) => (
                    <div key={delivery.id} className={`bg-neutral-900 border-l-4 ${getStatusBorder(delivery.status)} p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-neutral-800 transition`}>
                        <div className="flex items-center gap-8">
                            <div className="text-center min-w-[80px]">
                                <div className="p-2 bg-black rounded border border-neutral-800 mb-2">
                                    <Calendar className="w-5 h-5 text-neutral-500 mx-auto" />
                                </div>
                                <p className="text-[10px] font-mono text-neutral-500 uppercase">
                                    {delivery.delivery_date ? new Date(delivery.delivery_date).toLocaleDateString() : 'A DEFINIR'}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-black italic uppercase">{(delivery.erp_quotes as any)?.erp_clients?.name}</h3>
                                <div className="flex flex-wrap gap-4 mt-2">
                                    <span className="flex items-center gap-1 text-xs text-neutral-400 font-mono">
                                        <Package className="w-3 h-3 text-orange-500" /> {(delivery.erp_quotes as any)?.erp_products?.name}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-neutral-400 font-mono">
                                        <Clock className="w-3 h-3 text-orange-500" /> {(delivery.erp_quotes as any)?.volume_m3.toFixed(2)} m³
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-neutral-500 font-mono">
                                        <MapPin className="w-3 h-3" /> {(delivery.erp_quotes as any)?.delivery_address || 'Endereço no Contrato'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded ${getStatusColor(delivery.status)}`}>
                                    {delivery.status}
                                </span>
                            </div>
                            <div className="h-10 w-px bg-neutral-800 hidden md:block" />
                            
                            <div className="flex gap-2">
                                {(delivery.status === 'programada' || delivery.status === 'transporte') && (
                                    <button 
                                        onClick={() => handleNextStatus(delivery.id, delivery.status)}
                                        disabled={loadingId === delivery.id}
                                        className="bg-white text-black text-[10px] font-black uppercase px-4 py-2 rounded hover:bg-orange-500 hover:text-white transition flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {delivery.status === 'programada' ? 'Check-out' : 'Entregue'}
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                )}
                                {(delivery.status !== 'entregue' && delivery.status !== 'cancelada') && (
                                    <button 
                                        onClick={() => handleCancel(delivery.id)}
                                        disabled={loadingId === delivery.id}
                                        className="bg-neutral-800 text-neutral-400 text-[10px] font-black uppercase px-4 py-2 rounded hover:bg-red-900 hover:text-white transition disabled:opacity-50"
                                        title="Cancelar Entrega"
                                    >
                                        <XCircle className="w-3 h-3" />
                                    </button>
                                )}
                                {delivery.status === 'entregue' && (
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-emerald-500">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase">Finalizado</span>
                                        </div>
                                        <button 
                                            onClick={() => handleEmitirNFe(delivery.id)}
                                            disabled={loadingId === delivery.id}
                                            className="bg-blue-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded hover:bg-blue-500 transition flex items-center gap-2"
                                        >
                                            Gerar NF-e
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="border border-dashed border-neutral-800 p-16 text-center rounded-lg bg-neutral-900/30">
                        <p className="text-neutral-500 font-mono italic">Nenhuma entrega programada no momento.</p>
                        <p className="text-[10px] text-neutral-700 mt-2 uppercase">Entregas são geradas automaticamente ao fechar orçamentos.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function getStatusColor(status: string) {
    switch (status) {
        case 'programada': return 'bg-neutral-800 text-neutral-400'
        case 'transporte': return 'bg-orange-900/40 text-orange-200 animate-pulse'
        case 'entregue': return 'bg-emerald-900/40 text-emerald-200'
        case 'cancelada': return 'bg-red-900/40 text-red-200'
        default: return 'bg-neutral-800 text-neutral-400'
    }
}

function getStatusBorder(status: string) {
    switch (status) {
        case 'programada': return 'border-neutral-700'
        case 'transporte': return 'border-orange-600'
        case 'entregue': return 'border-emerald-600'
        case 'cancelada': return 'border-red-600'
        default: return 'border-neutral-700'
    }
}

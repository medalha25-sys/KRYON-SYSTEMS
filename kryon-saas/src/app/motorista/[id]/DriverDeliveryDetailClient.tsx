'use client'

import React, { useState } from 'react'
import { 
    ArrowLeft, 
    MapPin, 
    Truck, 
    CheckCircle2, 
    Camera, 
    Clock, 
    Navigation,
    Calendar,
    Phone,
    User,
    Info
} from 'lucide-react'
import Link from 'next/link'
import { updateDeliveryMobileAction } from '../../concrete/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function DriverDeliveryDetailClient({ delivery }: { delivery: any }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    
    const client = delivery.erp_production_orders?.erp_orders?.erp_clients
    const product = delivery.erp_production_orders?.erp_products
    
    const hangleUpdateStatus = async (newStatus: string) => {
        setLoading(true)
        try {
            // Optional: Get Geolocation
            let geolocalizacao = null
            if (newStatus === 'entregue' && navigator.geolocation) {
                try {
                    const pos = await new Promise<GeolocationPosition>((res, rej) => 
                        navigator.geolocation.getCurrentPosition(res, rej)
                    )
                    geolocalizacao = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                } catch (err) {
                    console.warn('Geolocation failed', err)
                }
            }

            const res = await updateDeliveryMobileAction(delivery.id, newStatus, { geolocalizacao })
            if (res.success) {
                toast.success(`Carga marcada como ${newStatus}!`)
                router.refresh()
            } else {
                toast.error(res.error)
            }
        } catch (err) {
            toast.error('Erro ao atualizar status')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Nav */}
            <div className="flex items-center gap-4">
                <Link href="/motorista" className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-transform">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h2 className="text-white font-black uppercase tracking-tight italic">Carga #{delivery.id.slice(0, 8)}</h2>
            </div>

            {/* Status Card */}
            <div className={`p-8 rounded-[3rem] border shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center ${
                delivery.status === 'entregue' ? 'bg-emerald-500/10 border-emerald-500/20' : 
                delivery.status === 'em_transporte' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-orange-500/10 border-orange-500/20'
            }`}>
               <div className="absolute top-0 left-0 w-full h-1 bg-current opacity-20" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Status Atual</p>
               <h3 className={`text-2xl font-black uppercase italic ${
                   delivery.status === 'entregue' ? 'text-emerald-400' : 
                   delivery.status === 'em_transporte' ? 'text-blue-400' : 'text-orange-400'
               }`}>{delivery.status}</h3>
               
               {delivery.status === 'entregue' && (
                   <p className="text-[9px] text-emerald-500/50 mt-2 font-bold uppercase tracking-widest">Entrega Finalizada com Sucesso</p>
               )}
            </div>

            {/* Info Cards */}
            <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] space-y-4 shadow-xl">
                    <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-500">Cliente</p>
                            <h4 className="text-white font-bold uppercase tracking-tight">{client?.name}</h4>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center mt-1 shrink-0">
                            <MapPin className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-500">Destino</p>
                            <p className="text-slate-300 text-sm font-medium leading-relaxed">
                                {client?.address || 'Endereço não informado'}
                            </p>
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client?.address || '')}`}
                                target="_blank"
                                className="inline-flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest mt-3 bg-blue-500/5 px-4 py-2 rounded-lg border border-blue-500/20"
                            >
                                <Navigation className="w-3 h-3" /> Abrir no GPS
                            </a>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl">
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-4 flex items-center gap-2">
                        <Info className="w-3 h-3" /> Especificações da Carga
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-[9px] font-black uppercase text-slate-600 mb-1">Volume</p>
                            <p className="text-xl font-black text-white font-mono">{delivery.erp_production_orders?.quantidade_m3} <span className="text-xs">m³</span></p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-slate-600 mb-1">Produto</p>
                            <p className="text-sm font-bold text-blue-400 uppercase tracking-tighter">{product?.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 grid grid-cols-1 gap-4">
                {delivery.status === 'agendada' && (
                    <button 
                        onClick={() => hangleUpdateStatus('em_transporte')}
                        disabled={loading}
                        className="w-full bg-blue-600 active:bg-blue-500 text-white font-black uppercase italic tracking-widest h-20 rounded-[2rem] shadow-2xl shadow-blue-600/20 active:scale-95 transition-all text-lg flex items-center justify-center gap-3"
                    >
                        <Navigation className="w-6 h-6" />
                        Sair para entrega
                    </button>
                )}

                {delivery.status === 'em_transporte' && (
                    <button 
                        onClick={() => hangleUpdateStatus('entregue')}
                        disabled={loading}
                        className="w-full bg-emerald-600 active:bg-emerald-500 text-white font-black uppercase italic tracking-widest h-20 rounded-[2rem] shadow-2xl shadow-emerald-600/20 active:scale-95 transition-all text-lg flex items-center justify-center gap-3"
                    >
                        <CheckCircle2 className="w-6 h-6" />
                        Confirmar Entrega
                    </button>
                )}

                {delivery.status === 'entregue' && (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[2rem] text-center">
                         <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                             <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                         </div>
                         <h4 className="text-emerald-400 font-black uppercase italic tracking-widest">Entrega Finalizada</h4>
                         <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase">Tudo certo! Volte para a base para nova carga.</p>
                         <Link href="/motorista" className="inline-block mt-4 text-[10px] font-black text-blue-500 uppercase border-b border-blue-500">Voltar para lista</Link>
                    </div>
                )}
            </div>

            {/* Photo Section */}
            {delivery.status === 'em_transporte' && (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] text-center">
                    <input 
                        type="file" 
                        id="photo-upload" 
                        accept="image/*" 
                        capture="environment" 
                        className="hidden" 
                        onChange={() => toast.success('Foto capturada com sucesso!')}
                    />
                    <label 
                        htmlFor="photo-upload"
                        className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                    >
                        <Camera className="w-8 h-8 text-blue-500" />
                        <p className="text-[10px] font-black uppercase text-blue-500">Tirar Foto do Comprovante</p>
                    </label>
                </div>
            )}
        </div>
    )
}

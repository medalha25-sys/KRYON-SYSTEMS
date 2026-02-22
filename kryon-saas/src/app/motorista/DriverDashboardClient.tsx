'use client'

import React, { useState } from 'react'
import { 
    Truck, 
    Navigation, 
    CheckCircle2, 
    Clock, 
    ArrowRight,
    MapPin,
    Calendar,
    ChevronRight,
    LogOut
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function DriverDashboardClient({ initialData, driverName }: { initialData: any[], driverName: string }) {
    const [deliveries] = useState(initialData)
    const supabase = createClient()

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'entregue': return 'bg-emerald-500/20 text-emerald-400'
            case 'em_transporte': return 'bg-blue-500/20 text-blue-400'
            case 'agendada': return 'bg-orange-500/20 text-orange-400'
            default: return 'bg-slate-800 text-slate-400'
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    return (
        <div className="max-w-md mx-auto space-y-6 pb-20">
            {/* Header Mobile */}
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-3xl border border-slate-800 shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20">
                        {driverName.charAt(0)}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Motorista</p>
                        <h2 className="text-white font-bold uppercase tracking-tight">{driverName}</h2>
                    </div>
                </div>
                <button onClick={handleLogout} className="p-3 bg-slate-800 rounded-2xl text-slate-400 active:bg-red-500/20 active:text-red-400 transition-colors">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800">
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Hoje</p>
                    <h3 className="text-2xl font-black text-white">{deliveries.length}</h3>
                    <p className="text-[9px] text-slate-600 uppercase font-bold">Cargas</p>
                </div>
                <div className="bg-emerald-600/5 border border-emerald-500/10 p-6 rounded-[2.5rem]">
                    <p className="text-[10px] font-black uppercase text-emerald-500/60 mb-1">Concluídas</p>
                    <h3 className="text-2xl font-black text-emerald-400">
                        {deliveries.filter(d => d.status === 'entregue').length}
                    </h3>
                    <p className="text-[9px] text-emerald-900 uppercase font-bold tracking-tighter">100% Eficiência</p>
                </div>
            </div>

            {/* Delivery List */}
            <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 px-2">
                    <Clock className="w-3 h-3" /> Entregas Designadas
                </h4>
                
                {deliveries.length === 0 ? (
                    <div className="p-12 text-center bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl">
                        <Truck className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-bold text-slate-600 uppercase">Nenhuma entrega para hoje</p>
                    </div>
                ) : (
                    deliveries.map((delivery) => (
                        <Link 
                            key={delivery.id} 
                            href={`/motorista/${delivery.id}`}
                            className="block bg-slate-900 border border-slate-800 p-5 rounded-[2.5rem] active:scale-[0.98] transition-transform relative overflow-hidden group shadow-lg"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${getStatusColor(delivery.status)}`}>
                                    {delivery.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center">
                                    <Navigation className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <h5 className="font-bold text-white uppercase text-base tracking-tight leading-tight">
                                        {delivery.erp_production_orders?.erp_orders?.erp_clients?.name}
                                    </h5>
                                    <p className="text-[10px] text-slate-500 font-mono">#{delivery.id.slice(0, 8)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 border-t border-slate-800/50 pt-4">
                                <div className="flex items-center gap-2">
                                    <Truck className="w-3 h-3 text-slate-500" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase">{delivery.erp_trucks?.placa}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-slate-500" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase">
                                        {delivery.erp_production_orders?.quantidade_m3} m³ {delivery.erp_production_orders?.erp_products?.name}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="absolute bottom-5 right-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                <ArrowRight className="w-5 h-5 text-blue-500" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}

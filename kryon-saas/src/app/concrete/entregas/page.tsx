import { getDeliveries, getProductionOrders } from '../actions'
import { Truck, Navigation, Clock, CheckCircle2, AlertCircle, Filter, Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EntregasPage({ searchParams }: { searchParams: { status?: string } }) {
    const status = searchParams.status
    const deliveries = await getDeliveries(status)

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight uppercase italic flex items-center gap-3 text-white">
                            <span className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg"><Navigation className="w-6 h-6 text-emerald-500" /></span>
                            Controle de Entregas
                        </h1>
                        <p className="text-neutral-400 font-mono text-[10px] mt-2 tracking-widest uppercase">Logística de Transporte // Rastreamento de Carga</p>
                    </div>
                </header>

                <div className="flex flex-wrap gap-3 mb-8">
                    <Filter className="w-4 h-4 text-neutral-500 mt-2" />
                    {[
                        { label: 'Todas', value: '' },
                        { label: 'Agendada', value: 'agendada' },
                        { label: 'Em Transporte', value: 'em_transporte' },
                        { label: 'Entregue', value: 'entregue' },
                    ].map(f => (
                        <Link 
                            key={f.label}
                            href={`/concrete/entregas${f.value ? `?status=${f.value}` : ''}`}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                (status || '') === f.value 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-neutral-900 text-neutral-500 border border-neutral-800 hover:border-neutral-700'
                            }`}
                        >
                            {f.label}
                        </Link>
                    ))}
                    
                    <div className="flex-grow" />
                    
                    <Link 
                        href="/concrete/producao?status=finalizado" 
                        className="bg-orange-600 hover:bg-orange-500 text-black px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-lg shadow-orange-500/20 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Despachar Nova Carga
                    </Link>
                </div>

                <div className="space-y-4">
                    {deliveries.length > 0 ? deliveries.map((delivery: any) => (
                        <div 
                            key={delivery.id} 
                            className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-emerald-500/50 transition-all shadow-xl"
                        >
                            <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
                                <div className={`p-4 rounded-xl border ${getStatusIconColor(delivery.status)}`}>
                                    {getStatusIcon(delivery.status)}
                                </div>
                                
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-black text-white uppercase italic">{delivery.erp_production_orders?.erp_products?.name}</h3>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${getStatusColor(delivery.status)}`}>
                                            {delivery.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-[10px] font-bold text-neutral-500 uppercase tracking-tight">
                                        <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> {delivery.erp_trucks?.placa}</span>
                                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {delivery.erp_drivers?.nome}</span>
                                        <span className="font-mono text-emerald-500">{Number(delivery.volume_transportado_m3).toFixed(3)} m³</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 text-right min-w-[200px]">
                                <div>
                                    <p className="text-[9px] text-neutral-500 font-bold uppercase mb-1">Data Saída</p>
                                    <p className="text-sm font-black text-white font-mono">{new Date(delivery.data_saida).toLocaleString()}</p>
                                </div>
                                {delivery.status !== 'entregue' && (
                                    <Link 
                                        href={`/concrete/entregas/${delivery.id}`}
                                        className="p-3 bg-black hover:bg-neutral-800 border border-neutral-800 rounded-lg text-emerald-500 transition-colors"
                                    >
                                        <Navigation className="w-5 h-5" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="border border-dashed border-neutral-800 p-12 text-center rounded-3xl">
                            <p className="text-neutral-500 font-mono italic">Nenhuma entrega ativa encontrada.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'entregue': return <CheckCircle2 className="w-6 h-6" />
        case 'em_transporte': return <Navigation className="w-6 h-6 animate-pulse" />
        case 'cancelada': return <AlertCircle className="w-6 h-6" />
        default: return <Clock className="w-6 h-6" />
    }
}

function getStatusIconColor(status: string) {
    switch (status) {
        case 'entregue': return 'bg-emerald-900/30 text-emerald-500 border-emerald-500/20'
        case 'em_transporte': return 'bg-blue-900/30 text-blue-500 border-blue-500/20'
        case 'cancelada': return 'bg-red-900/30 text-red-500 border-red-500/20'
        default: return 'bg-neutral-800 text-neutral-500 border-neutral-700'
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case 'entregue': return 'bg-emerald-900 text-emerald-300 border-emerald-500/20'
        case 'em_transporte': return 'bg-blue-900 text-blue-300 border-blue-500/20'
        case 'cancelada': return 'bg-red-900 text-red-300 border-red-500/20'
        default: return 'bg-neutral-800 text-neutral-400 border-neutral-700'
    }
}

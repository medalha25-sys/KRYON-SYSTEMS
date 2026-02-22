import { getProductionOrders } from '../actions'
import { Factory, Clock, CheckCircle2, AlertCircle, Filter, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProducaoPage({ searchParams }: { searchParams: { status?: string } }) {
    const status = searchParams.status
    const orders = await getProductionOrders(status)

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight uppercase italic flex items-center gap-3 text-white">
                            <span className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg"><Factory className="w-6 h-6 text-blue-500" /></span>
                            Controle de Produção
                        </h1>
                        <p className="text-neutral-400 font-mono text-[10px] mt-2 tracking-widest uppercase">Operação de Usina // Gestão de Misturadores</p>
                    </div>
                </header>

                <div className="flex flex-wrap gap-3 mb-8">
                    <Filter className="w-4 h-4 text-neutral-500 mt-2" />
                    {[
                        { label: 'Todas', value: '' },
                        { label: 'Aguardando', value: 'aguardando' },
                        { label: 'Produzindo', value: 'produzindo' },
                        { label: 'Finalizado', value: 'finalizado' },
                    ].map(f => (
                        <Link 
                            key={f.label}
                            href={`/concrete/producao${f.value ? `?status=${f.value}` : ''}`}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                (status || '') === f.value 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                : 'bg-neutral-900 text-neutral-500 border border-neutral-800 hover:border-neutral-700'
                            }`}
                        >
                            {f.label}
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.length > 0 ? orders.map((order: any) => (
                        <Link 
                            key={order.id} 
                            href={`/concrete/producao/${order.id}`}
                            className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl group hover:border-blue-500/50 transition-all flex flex-col justify-between gap-6 shadow-xl"
                        >
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                    <span className="text-[10px] font-mono text-neutral-500">#{order.id.slice(0, 8)}</span>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-tight">{order.erp_products?.name}</h3>
                                    <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">{order.erp_products?.categoria}</p>
                                </div>

                                <div className="bg-black/40 p-4 rounded-xl border border-neutral-800">
                                    <p className="text-[9px] font-bold text-neutral-500 uppercase mb-1">Volume Programado</p>
                                    <p className="text-2xl font-black text-blue-500 font-mono italic">{Number(order.quantidade_m3).toFixed(3)} m³</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-neutral-800 flex justify-between items-center text-[10px] font-bold text-neutral-400">
                                <span className="uppercase flex items-center gap-2">
                                    <LayoutDashboard className="w-3 h-3 text-orange-500" />
                                    Pedido #{order.erp_orders?.numero_pedido}
                                </span>
                                <span className="font-mono">{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                        </Link>
                    )) : (
                        <div className="col-span-full border border-dashed border-neutral-800 p-12 text-center rounded-2xl">
                            <p className="text-neutral-500 font-mono italic">Nenhuma ordem de produção ativa para estes filtros.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function getStatusColor(status: string) {
    switch (status) {
        case 'finalizado': return 'bg-emerald-900/30 text-emerald-500 border-emerald-500/20'
        case 'produzindo': return 'bg-blue-900/30 text-blue-400 border-blue-400/20'
        default: return 'bg-neutral-800 text-neutral-400 border-neutral-700'
    }
}

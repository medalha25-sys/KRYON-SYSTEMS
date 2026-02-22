import { getFullOrders } from '../actions'
import { Truck, Clock, CheckCircle2, XCircle, AlertCircle, Plus, Filter, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PedidosPage({ searchParams }: { searchParams: { status?: string } }) {
    const status = searchParams.status
    const orders = await getFullOrders(status)

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight uppercase italic flex items-center gap-3 text-white">
                            <span className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg"><ShoppingBag className="w-6 h-6 text-orange-500" /></span>
                            Pedidos Operacionais
                        </h1>
                        <p className="text-neutral-400 font-mono text-[10px] mt-2 tracking-widest uppercase">Controle de Produção // Logística de Entrega</p>
                    </div>
                </header>

                <div className="flex flex-wrap gap-3 mb-8">
                    <Filter className="w-4 h-4 text-neutral-500 mt-2" />
                    {[
                        { label: 'Todos', value: '' },
                        { label: 'Pendente', value: 'pendente' },
                        { label: 'Produção', value: 'em_producao' },
                        { label: 'Pronto', value: 'pronto' },
                        { label: 'Entregue', value: 'entregue' },
                        { label: 'Cancelado', value: 'cancelado' },
                    ].map(f => (
                        <Link 
                            key={f.label}
                            href={`/concrete/pedidos${f.value ? `?status=${f.value}` : ''}`}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                (status || '') === f.value 
                                ? 'bg-orange-500 text-black' 
                                : 'bg-neutral-900 text-neutral-500 border border-neutral-800 hover:border-neutral-700'
                            }`}
                        >
                            {f.label}
                        </Link>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        {orders.length > 0 ? orders.map((order: any) => (
                            <Link 
                                key={order.id} 
                                href={`/concrete/pedidos/${order.id}`}
                                className="bg-neutral-900 border border-neutral-800 p-6 rounded group hover:border-orange-500/50 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="p-3 bg-black rounded border border-neutral-800">
                                        {getStatusIcon(order.status)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold">Pedido #{order.numero_pedido} - {order.erp_clients?.name}</h3>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${getStatusColor(order.status)}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex gap-4">
                                            <p className="text-xs text-neutral-500 uppercase font-bold">DATA: <span className="text-neutral-300">{new Date(order.created_at).toLocaleDateString()}</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 text-right">
                                    <div>
                                        <p className="text-[10px] text-neutral-500 font-bold uppercase mb-1">Valor do Pedido</p>
                                        <p className="text-2xl font-black font-mono text-white">R$ {Number(order.valor_total).toFixed(2)}</p>
                                    </div>
                                    <div className="min-w-[40px]">
                                        <Truck className="w-5 h-5 text-neutral-700 group-hover:text-orange-500 transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="border border-dashed border-neutral-800 p-12 text-center rounded-lg">
                                <p className="text-neutral-500 font-mono italic">Nenhum pedido operacional encontrado.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'entregue': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        case 'cancelado': return <XCircle className="w-5 h-5 text-red-500" />
        case 'em_producao': return <Clock className="w-5 h-5 text-blue-500" />
        case 'pronto': return <Truck className="w-5 h-5 text-orange-500" />
        default: return <AlertCircle className="w-5 h-5 text-neutral-500" />
    }
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

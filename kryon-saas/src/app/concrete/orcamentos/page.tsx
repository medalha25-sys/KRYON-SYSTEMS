import { getFullBudgets, getClients, getProducts } from '../actions'
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, Plus, Zap, Filter } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OrcamentosPage({ searchParams }: { searchParams: { status?: string } }) {
    const status = searchParams.status
    const budgets = await getFullBudgets(status)
    const clients = await getClients()
    const products = await getProducts()

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight uppercase italic flex items-center gap-3 text-white">
                            <span className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg"><FileText className="w-6 h-6 text-orange-500" /></span>
                            Gestão de Orçamentos
                        </h1>
                        <p className="text-neutral-400 font-mono text-[10px] mt-2 tracking-widest uppercase">Motor Multi-Produtos // Integração Dashboard</p>
                    </div>

                    <Link 
                        href="/concrete/orcamentos/novo"
                        className="bg-orange-500 text-black px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:bg-orange-400 transition-all flex items-center gap-3 shadow-2xl shadow-orange-500/20 group scale-105"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        + NOVO ORÇAMENTO COMPLETO
                    </Link>
                </header>

                <div className="flex flex-wrap gap-3 mb-8">
                    <Filter className="w-4 h-4 text-neutral-500 mt-2" />
                    {[
                        { label: 'Todos', value: '' },
                        { label: 'Rascunho', value: 'rascunho' },
                        { label: 'Enviado', value: 'enviado' },
                        { label: 'Aprovado', value: 'aprovado' },
                        { label: 'Cancelado', value: 'cancelado' },
                    ].map(f => (
                        <Link 
                            key={f.label}
                            href={`/concrete/orcamentos${f.value ? `?status=${f.value}` : ''}`}
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
                        {budgets.length > 0 ? budgets.map((budget: any) => (
                            <Link 
                                key={budget.id} 
                                href={`/concrete/orcamentos/${budget.id}`}
                                className="bg-neutral-900 border border-neutral-800 p-6 rounded group hover:border-orange-500/50 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="p-3 bg-black rounded border border-neutral-800">
                                        {getStatusIcon(budget.status)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold">#{budget.numero_orcamento} - {budget.erp_clients?.name || 'Cliente não definido'}</h3>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${getStatusColor(budget.status)}`}>
                                                {budget.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-4">
                                            <p className="text-xs text-neutral-500 uppercase font-bold">DATA: <span className="text-neutral-300">{new Date(budget.data).toLocaleDateString()}</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 text-right">
                                    <div>
                                        <p className="text-[10px] text-neutral-500 font-bold uppercase mb-1">Valor Total</p>
                                        <p className="text-2xl font-black font-mono text-white">R$ {Number(budget.valor_total).toFixed(2)}</p>
                                    </div>
                                    <div className="min-w-[40px]">
                                        <Plus className="w-5 h-5 text-neutral-700 group-hover:text-orange-500 transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="border border-dashed border-neutral-800 p-12 text-center rounded-lg">
                                <p className="text-neutral-500 font-mono italic">Nenhum orçamento encontrado com este status.</p>
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

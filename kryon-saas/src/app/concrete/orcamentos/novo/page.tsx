import { getClients, getProducts } from '../../actions'
import BudgetFormClient from './BudgetFormClient'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NovoOrcamentoPage() {
    const clients = await getClients()
    const products = await getProducts()

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/concrete/orcamentos" 
                            className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-blue-500 transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white">Novo Orçamento Inteligente</h1>
                            <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mt-1">Engenharia de Vendas // Calibragem Técnica</p>
                        </div>
                    </div>
                </header>

                <BudgetFormClient clients={clients} products={products} />
            </div>
        </div>
    )
}

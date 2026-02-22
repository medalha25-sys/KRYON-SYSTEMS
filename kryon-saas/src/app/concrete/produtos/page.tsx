import { getProducts } from '../actions'
import ProductsClient from './ProductsClient'
import { Construction } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProdutosPage() {
    const products = await getProducts()

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white flex items-center gap-3">
                            <span className="p-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl shadow-orange-500/5">
                                <Construction className="w-8 h-8 text-orange-500" />
                            </span>
                            Controle de Mix & Produtos
                        </h1>
                        <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mt-2">Engenharia de Materiais // Gestão de Traços // Custos</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <ProductsClient initialProducts={products} />
                    </div>
                </header>
            </div>
        </div>
    )
}

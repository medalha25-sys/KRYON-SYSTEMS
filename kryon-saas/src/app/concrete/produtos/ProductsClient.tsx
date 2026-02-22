'use client'

import React, { useState } from 'react'
import { Plus, Database, Edit2, Trash2, Search, Box, Tag, TrendingUp, RotateCcw,
    Beaker
} from 'lucide-react'
import ProductModal from './ProductModal'
import { deleteProductAction, popularBancoInicialAction } from '../actions'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ProductsClient({ initialProducts }: { initialProducts: any[] }) {
    const [products, setProducts] = useState(initialProducts)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<any>(null)
    const [search, setSearch] = useState('')
    const [loadingSeed, setLoadingSeed] = useState(false)

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.categoria?.toLowerCase().includes(search.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja remover este produto do catálogo?')) return
        
        try {
            const res = await deleteProductAction(id)
            if (res.success) {
                setProducts(products.filter(p => p.id !== id))
                toast.success('Produto removido')
            } else {
                toast.error(res.error)
            }
        } catch (err) {
            toast.error('Erro ao excluir')
        }
    }

    const handleSeed = async () => {
        setLoadingSeed(true)
        try {
            const res = await popularBancoInicialAction()
            if (res.success) {
                toast.success('Mix de produtos semeado!')
                window.location.reload()
            } else {
                toast.error(res.error || 'Erro no seed')
            }
        } catch (err) {
            toast.error('Erro crítico no seed')
        } finally {
            setLoadingSeed(false)
        }
    }

    const openCreateModal = () => {
        setEditingProduct(null)
        setIsModalOpen(true)
    }

    const openEditModal = (product: any) => {
        setEditingProduct(product)
        setIsModalOpen(true)
    }

    return (
        <div className="space-y-8 w-full max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text"
                        placeholder="Buscar por nome ou categoria..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-3 pl-10 rounded-xl text-white outline-none focus:border-orange-500 transition-all text-sm shadow-inner"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {products.length === 0 && (
                        <button 
                            onClick={handleSeed}
                            disabled={loadingSeed}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-bold uppercase text-xs transition-all border border-slate-700"
                        >
                            <Database className="w-4 h-4" />
                            {loadingSeed ? 'Semeando...' : 'Carregar Mix Inicial'}
                        </button>
                    )}
                    <button 
                        onClick={openCreateModal}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs transition-all shadow-lg shadow-orange-600/20"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Produto
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                    const margin = product.price_m3 - product.cost_m3
                    const marginPercent = product.price_m3 > 0 ? (margin / product.price_m3) * 100 : 0

                    return (
                        <div key={product.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden group hover:border-orange-500/30 transition-all shadow-xl">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 group-hover:border-orange-500/20 transition-colors">
                                        <Box className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditModal(product)} className="p-2 hover:bg-blue-600/20 text-blue-400 rounded-lg transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1 block">
                                        {product.categoria || 'SEM CATEGORIA'}
                                    </span>
                                    <h3 className="text-lg font-black italic tracking-tighter uppercase text-white leading-tight">
                                        {product.name}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 min-h-[30px]">
                                        {product.descricao || 'Nenhuma descrição técnica informada.'}
                                    </p>
                                </div>

                                 <div className="space-y-3 pt-4 border-t border-slate-800/50 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Preço de Venda</span>
                                        <span className="text-xl font-black font-mono text-emerald-400">R$ {product.price_m3.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Margem Operacional</span>
                                        <div className="text-right">
                                            <p className="text-sm font-black font-mono text-white">R$ {margin.toFixed(2)}</p>
                                            <p className={`text-[9px] font-bold ${marginPercent > 30 ? 'text-emerald-500' : 'text-orange-500'}`}>
                                                {marginPercent.toFixed(1)}% de lucro/m³
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-auto">
                                    <Link 
                                        href={`/concrete/produtos/${product.id}`}
                                        className="flex-1 bg-black hover:bg-neutral-800 border border-neutral-800 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2 group"
                                    >
                                        <Search className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" /> Detalhes
                                    </Link>
                                    <Link 
                                        href={`/concrete/produtos/${product.id}/receita`}
                                        className="flex-1 bg-black hover:bg-neutral-800 border border-neutral-800 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2 group border-emerald-500/20"
                                    >
                                        <Beaker className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" /> Traço
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )
                })}

                {filteredProducts.length === 0 && (
                    <div className="col-span-full border-2 border-dashed border-slate-800 rounded-2xl p-20 text-center">
                        <Box className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <h4 className="text-slate-400 font-bold uppercase tracking-widest">Catálogo Vazio</h4>
                        <p className="text-slate-600 text-xs mt-2">Clique em "Novo Produto" ou use o botão de seed.</p>
                    </div>
                )}
            </div>

            <ProductModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                product={editingProduct}
            />
        </div>
    )
}

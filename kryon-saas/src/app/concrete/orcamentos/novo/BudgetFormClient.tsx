'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createFullBudgetAction } from '../../actions'
import { 
    Calculator, 
    Trash2, 
    Plus, 
    Save, 
    User, 
    Box, 
    TrendingUp, 
    DollarSign,
    AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface Props {
    clients: any[]
    products: any[]
}

export default function BudgetFormClient({ clients, products }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [clientId, setClientId] = useState('')
    const [items, setItems] = useState([
        { produto_id: '', quantidade_m3: 1, preco_unitario: 0, custo_unitario: 0 }
    ])

    const [totals, setTotals] = useState({
        valor: 0,
        custo: 0,
        lucro: 0
    })

    useEffect(() => {
        let v = 0
        let c = 0
        let l = 0

        items.forEach(item => {
            const sub = item.quantidade_m3 * item.preco_unitario
            const c_sub = item.quantidade_m3 * item.custo_unitario
            v += sub
            c += c_sub
            l += (sub - c_sub)
        })

        setTotals({ valor: v, custo: c, lucro: l })
    }, [items])

    const addItem = () => {
        setItems([...items, { produto_id: '', quantidade_m3: 1, preco_unitario: 0, custo_unitario: 0 }])
    }

    const removeItem = (index: number) => {
        if (items.length === 1) return
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items]
        const item = newItems[index] as any
        item[field] = value

        if (field === 'produto_id') {
            const product = products.find(p => p.id === value)
            if (product) {
                item.preco_unitario = product.price_m3
                item.custo_unitario = product.cost_m3
            }
        }

        setItems(newItems)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!clientId) return toast.error('Selecione um cliente')
        if (items.some(i => !i.produto_id)) return toast.error('Selecione o produto de todos os itens')

        setLoading(true)
        const res = await createFullBudgetAction({ cliente_id: clientId, items })
        setLoading(false)

        if (res.success) {
            toast.success('Orçamento criado com sucesso!')
            router.push('/concrete/orcamentos')
        } else {
            toast.error(res.error || 'Erro ao criar orçamento')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
                {/* Cliente */}
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl shadow-lg">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase text-neutral-500 mb-2">
                        <User className="w-4 h-4" /> Cliente
                    </label>
                    <select 
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        required
                        className="w-full bg-black border border-neutral-800 p-4 rounded-xl text-white focus:border-orange-500 outline-none transition"
                    >
                        <option value="">Selecione um cliente...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                {/* Itens do Orçamento */}
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase text-neutral-500">
                            <Box className="w-4 h-4" /> Itens do Orçamento
                        </label>
                        <button 
                            type="button" 
                            onClick={addItem}
                            className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition"
                        >
                            <Plus className="w-4 h-4" /> Adicionar Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-black/50 border border-neutral-800 rounded-xl relative group">
                                <div className="md:col-span-5">
                                    <label className="text-[10px] uppercase text-neutral-600 mb-1 block">Produto</label>
                                    <select 
                                        value={item.produto_id}
                                        onChange={(e) => updateItem(index, 'produto_id', e.target.value)}
                                        className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded text-sm text-white"
                                    >
                                        <option value="">Selecione...</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] uppercase text-neutral-600 mb-1 block">Qtd (m³)</label>
                                    <input 
                                        type="number" 
                                        step="0.001"
                                        value={item.quantidade_m3}
                                        onChange={(e) => updateItem(index, 'quantidade_m3', parseFloat(e.target.value) || 0)}
                                        className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded text-sm text-white"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] uppercase text-neutral-600 mb-1 block">Preço Unit.</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={item.preco_unitario}
                                        onChange={(e) => updateItem(index, 'preco_unitario', parseFloat(e.target.value) || 0)}
                                        className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded text-sm text-white"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] uppercase text-neutral-600 mb-1 block">Subtotal</label>
                                    <div className="w-full p-2 text-sm font-mono text-white pt-3">
                                        R$ {(item.quantidade_m3 * item.preco_unitario).toFixed(2)}
                                    </div>
                                </div>
                                <div className="md:col-span-1 flex items-end justify-center pb-2">
                                    <button 
                                        type="button" 
                                        onClick={() => removeItem(index)}
                                        className="text-neutral-700 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl sticky top-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-8 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Resumo Financeiro
                    </h3>

                    <div className="space-y-6">
                        <div className="flex justify-between items-end border-b border-neutral-800 pb-4">
                            <span className="text-xs font-bold text-neutral-400 uppercase">Valor Total</span>
                            <span className="text-3xl font-black italic tracking-tighter text-white">
                                R$ {totals.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-sm font-mono text-neutral-500">
                            <span>Custo Total:</span>
                            <span>R$ {totals.custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2 text-orange-500">
                                <DollarSign className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase">Lucro Estimado</span>
                            </div>
                            <span className="text-xl font-black font-mono text-white">
                                R$ {totals.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full mt-12 bg-white hover:bg-neutral-200 text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest transition flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
                    >
                        {loading ? 'Calculando...' : (
                            <>
                                <Save className="w-4 h-4" /> Salvar Orçamento
                            </>
                        )}
                    </button>

                    <div className="mt-6 p-4 bg-black/40 rounded-lg flex gap-3 items-start border border-neutral-800">
                        <AlertCircle className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-neutral-500 italic leading-relaxed">
                            Este orçamento será salvo com o status de <strong>Rascunho</strong>. Você poderá alterar o status após a revisão das quantidades.
                        </p>
                    </div>
                </div>
            </div>
        </form>
    )
}

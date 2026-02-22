'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ShoppingBag, ArrowLeft, Save, User, Package } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'

export default function NovoPedidoPage() {
    const router = useRouter()
    const supabase = createClient()
    
    const [loading, setLoading] = useState(false)
    const [clients, setClients] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    
    const [selectedClientId, setSelectedClientId] = useState('')
    const [items, setItems] = useState<any[]>([
        { produto_id: '', quantidade_m3: 1, preco_unitario: 0 }
    ])

    useEffect(() => {
        const fetchData = async () => {
            const { data: clientsData } = await supabase.from('erp_clients').select('*').order('name')
            const { data: productsData } = await supabase.from('erp_products').select('*').order('name')
            if (clientsData) setClients(clientsData)
            if (productsData) setProducts(productsData)
        }
        fetchData()
    }, [])

    const addItem = () => {
        setItems([...items, { produto_id: '', quantidade_m3: 1, preco_unitario: 0 }])
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items]
        newItems[index][field] = value
        
        if (field === 'produto_id') {
            const product = products.find(p => p.id === value)
            if (product) {
                newItems[index].preco_unitario = product.price || 0
            }
        }
        
        setItems(newItems)
    }

    const calculateTotal = () => {
        return items.reduce((acc, item) => acc + (item.quantidade_m3 * item.preco_unitario), 0)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedClientId) return toast.error('Selecione um cliente')
        if (items.some(item => !item.produto_id)) return toast.error('Selecione os produtos')
        
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Não autenticado')

            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
            if (!profile?.organization_id) throw new Error('Empresa não encontrada')

            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from('erp_orders')
                .insert({
                    organization_id: profile.organization_id,
                    cliente_id: selectedClientId,
                    valor_total: calculateTotal(),
                    status: 'pendente'
                })
                .select()
                .single()

            if (orderError) throw orderError

            // 2. Create Items
            const orderItems = items.map(item => ({
                pedido_id: order.id,
                produto_id: item.produto_id,
                quantidade_m3: item.quantidade_m3,
                preco_unitario: item.preco_unitario,
                subtotal: item.quantidade_m3 * item.preco_unitario
            }))

            const { error: itemsError } = await supabase.from('erp_order_items').insert(orderItems)
            if (itemsError) throw itemsError

            toast.success('Pedido criado com sucesso!')
            router.push('/concrete/pedidos')
            router.refresh()
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || 'Erro ao criar pedido')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/concrete/pedidos" className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Voltar para Pedidos</span>
                    </Link>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-neutral-800 bg-black/40">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-500/10 rounded-lg">
                                <ShoppingBag className="w-8 h-8 text-orange-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black uppercase italic tracking-tight">Novo Pedido Operacional</h1>
                                <p className="text-xs text-neutral-500 font-mono tracking-widest uppercase mt-1">Ready for Production // Industrial Control</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-10">
                        {/* Cliente Section */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500/80">
                                <User className="w-3 h-3" /> Selecionar Cliente
                            </label>
                            <select 
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                className="w-full bg-black border border-neutral-800 p-4 rounded-lg focus:ring-2 focus:ring-orange-500/50 outline-none transition-all appearance-none text-white font-bold"
                            >
                                <option value="">Escolha um cliente da lista...</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Itens Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500/80">
                                    <Package className="w-3 h-3" /> Itens do Pedido (Concreto)
                                </label>
                                <button 
                                    type="button"
                                    onClick={addItem}
                                    className="text-[10px] font-black uppercase underline hover:text-orange-500 transition-colors"
                                >
                                    + Adicionar Item
                                </button>
                            </div>

                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-black/40 p-4 rounded-lg border border-neutral-800/50 relative group">
                                        <div className="md:col-span-6 space-y-2">
                                            <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-tighter">Produto / Traço</p>
                                            <select 
                                                value={item.produto_id}
                                                onChange={(e) => updateItem(index, 'produto_id', e.target.value)}
                                                className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded text-sm font-bold text-white outline-none"
                                            >
                                                <option value="">Selecionar...</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-tighter">Qtd (m³)</p>
                                            <input 
                                                type="number"
                                                step="0.1"
                                                value={item.quantidade_m3}
                                                onChange={(e) => updateItem(index, 'quantidade_m3', parseFloat(e.target.value))}
                                                className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded text-sm font-bold text-white outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-3 space-y-2">
                                            <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-tighter">Preço / m³</p>
                                            <input 
                                                type="number"
                                                value={item.preco_unitario}
                                                onChange={(e) => updateItem(index, 'preco_unitario', parseFloat(e.target.value))}
                                                className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded text-sm font-bold text-emerald-400 outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-1 flex justify-center pb-3">
                                            {items.length > 1 && (
                                                <button type="button" onClick={() => removeItem(index)} className="text-neutral-700 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Section */}
                        <div className="pt-10 border-t border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div>
                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Valor Total Estimado</p>
                                <p className="text-4xl font-black text-white font-mono leading-none">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-white text-black hover:bg-orange-500 hover:text-white transition-all px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-white/5"
                            >
                                <Save className="w-5 h-5" />
                                {loading ? 'PROCESSANDO...' : 'CRIAR PEDIDO AGORA'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

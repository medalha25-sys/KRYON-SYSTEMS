'use client'

import React, { useState } from 'react'
import { getRawMaterials, updateRecipeAction } from '../../../actions'
import { 
    ArrowLeft, 
    CheckCircle2, 
    Factory, 
    Plus, 
    Trash2, 
    Beaker, 
    Save,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
    product: any
    rawMaterials: any[]
    initialIngredients: any[]
}

export default function RecipeEditorClient({ product, rawMaterials, initialIngredients }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [ingredients, setIngredients] = useState<any[]>(initialIngredients.map(i => ({
        materia_prima_id: i.materia_prima_id,
        quantidade_por_m3: i.quantidade_por_m3,
        nome: i.erp_raw_materials?.nome,
        unidade: i.erp_raw_materials?.unidade
    })))

    const handleAddIngredient = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const matId = formData.get('materia_prima_id') as string
        const amount = parseFloat(formData.get('quantidade_por_m3') as string)

        if (!matId || isNaN(amount)) return

        const material = rawMaterials.find(m => m.id === matId)
        if (!material) return

        if (ingredients.some(i => i.materia_prima_id === matId)) {
            toast.error('Este insumo já está na receita.')
            return
        }

        setIngredients([...ingredients, {
            materia_prima_id: matId,
            quantidade_por_m3: amount,
            nome: material.nome,
            unidade: material.unidade
        }])
        
        e.currentTarget.reset()
    }

    const handleRemoveIngredient = (matId: string) => {
        setIngredients(ingredients.filter(i => i.materia_prima_id !== matId))
    }

    const handleSave = async () => {
        setLoading(true)
        const res = await updateRecipeAction(product.id, ingredients.map(i => ({
            materia_prima_id: i.materia_prima_id,
            quantidade_por_m3: i.quantidade_por_m3
        })))
        setLoading(false)

        if (res.success) {
            toast.success('Receita (Traço) atualizada com sucesso!')
            router.refresh()
        } else {
            toast.error(res.error || 'Erro ao salvar receita')
        }
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6 md:p-10 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <Link 
                            href="/concrete/produtos" 
                            className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-emerald-500 transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">Engenharia de Traço</h1>
                                <span className="px-2 py-0.5 bg-emerald-900/30 border border-emerald-500/30 rounded text-emerald-500 text-[8px] font-black uppercase">Fórmulas</span>
                            </div>
                            <p className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase">Definição de Proporção // {product.name}</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleSave}
                        disabled={loading || ingredients.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-500 text-black px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition shadow-lg shadow-emerald-500/20 flex items-center gap-3 disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" /> {loading ? 'Salvando...' : 'Salvar Receita'}
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Ingredient Form */}
                    <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl h-fit">
                        <div className="flex items-center gap-3 mb-6">
                            <Beaker className="w-5 h-5 text-emerald-500" />
                            <h3 className="text-sm font-black uppercase text-neutral-500 tracking-widest">Adicionar Insumo</h3>
                        </div>

                        <form onSubmit={handleAddIngredient} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-neutral-500 mb-2 block tracking-widest">Matéria-Prima</label>
                                <select 
                                    name="materia_prima_id" 
                                    className="w-full bg-black border border-neutral-800 p-4 rounded-xl text-sm text-white focus:border-emerald-500 outline-none appearance-none" 
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {rawMaterials.map(m => (
                                        <option key={m.id} value={m.id}>{m.nome} ({m.unidade})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-neutral-500 mb-2 block tracking-widest">Quantidade por 1m³</label>
                                <input 
                                    name="quantidade_por_m3" 
                                    type="number" 
                                    step="0.0001" 
                                    className="w-full bg-black border border-neutral-800 p-4 rounded-xl text-sm text-white focus:border-emerald-500 outline-none font-mono" 
                                    placeholder="0.0000"
                                    required 
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="w-full border border-emerald-500/30 bg-emerald-900/10 hover:bg-emerald-900/30 text-emerald-500 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Incluir na Receita
                            </button>
                        </form>
                    </div>

                    {/* Current Ingredients List */}
                    <div className="lg:col-span-2">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
                             <div className="p-8 border-b border-neutral-800 flex justify-between items-center bg-black/20">
                                <div className="flex items-center gap-3">
                                    <Factory className="w-5 h-5 text-orange-500" />
                                    <h3 className="text-sm font-black uppercase text-white tracking-widest italic">Composição do Traço</h3>
                                </div>
                                <span className="text-[10px] font-mono text-neutral-500 uppercase">{ingredients.length} itens</span>
                             </div>

                             <div className="divide-y divide-neutral-800">
                                {ingredients.length > 0 ? ingredients.map((item) => (
                                    <div key={item.materia_prima_id} className="p-6 flex items-center justify-between group hover:bg-black/20 transition-colors">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-black text-white uppercase italic">{item.nome}</h4>
                                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Consumo base por m³</p>
                                        </div>
                                        
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-xl font-black text-emerald-500 font-mono italic">
                                                    {Number(item.quantidade_por_m3).toFixed(4)}
                                                    <span className="text-[10px] opacity-50 ml-1 uppercase">{item.unidade}</span>
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveIngredient(item.materia_prima_id)}
                                                className="p-3 text-neutral-600 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-16 text-center">
                                        <AlertCircle className="w-12 h-12 text-neutral-800 mx-auto mb-4" />
                                        <p className="text-neutral-500 font-mono italic text-sm">Receita vazia. Adicione insumos para possibilitar a baixa de estoque automática.</p>
                                    </div>
                                )}
                             </div>

                             {ingredients.length > 0 && (
                                <div className="p-6 bg-black/40 border-t border-neutral-800">
                                    <p className="text-[9px] text-neutral-600 uppercase font-black tracking-widest text-center">
                                        Nota: Ao finalizar uma produção de 1m³, as quantidades acima serão deduzidas proporcionalmente.
                                    </p>
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

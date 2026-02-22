import { createClient } from '@/utils/supabase/server'
import { addStockAction } from '../../actions'
import { ArrowLeft, Package, Plus, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EntradaEstoquePage({ searchParams }: { searchParams: { id: string } }) {
    if (!searchParams.id) notFound()

    const supabase = await createClient()
    const { data: material } = await supabase
        .from('erp_raw_materials')
        .select('*')
        .eq('id', searchParams.id)
        .single()

    if (!material) notFound()

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6 md:p-10 font-sans">
            <div className="max-w-2xl mx-auto">
                <header className="mb-12 flex items-center gap-6">
                    <Link 
                        href="/concrete/estoque" 
                        className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-emerald-500 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">Entrada de Insumos</h1>
                        <p className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase">Reposição de Matéria-Prima // {material.nome}</p>
                    </div>
                </header>

                <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-black/40 rounded-2xl border border-neutral-800">
                            <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">Estoque em Mãos</p>
                            <p className="text-3xl font-black text-white font-mono italic">
                                {Number(material.estoque_atual).toLocaleString()} <span className="text-sm opacity-50">{material.unidade}</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/40 rounded-2xl border border-neutral-800">
                            <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">Mínimo de Segurança</p>
                            <p className="text-3xl font-black text-neutral-600 font-mono italic">
                                {Number(material.estoque_minimo).toLocaleString()} <span className="text-sm opacity-50">{material.unidade}</span>
                            </p>
                        </div>
                    </div>

                    <form action={async (formData: FormData) => {
                        'use server'
                        const amount = parseFloat(formData.get('quantidade') as string)
                        await addStockAction(material.id, amount)
                    }} className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black uppercase text-neutral-500 mb-2 block tracking-widest flex items-center gap-2">
                                <TrendingUp className="w-3 h-3 text-emerald-500" /> Quantidade a Adicionar ({material.unidade})
                            </label>
                            <input 
                                name="quantidade" 
                                type="number" 
                                step="0.001" 
                                className="w-full bg-black border border-neutral-800 p-5 rounded-2xl text-xl text-white focus:border-emerald-500 outline-none font-mono" 
                                placeholder="0.00"
                                required 
                                autoFocus
                            />
                        </div>

                        <div className="p-4 bg-emerald-900/10 rounded-2xl border border-emerald-500/20 flex gap-4">
                            <AlertCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                            <p className="text-[10px] text-emerald-300 leading-relaxed uppercase font-bold tracking-tight">
                                Esta movimentação será registrada no histórico de auditoria. O saldo será atualizado imediatamente após a confirmação.
                            </p>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-black p-5 rounded-2xl text-xs font-black uppercase tracking-widest transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3"
                        >
                            <Plus className="w-5 h-5" /> Confirmar Entrada de Insumo
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

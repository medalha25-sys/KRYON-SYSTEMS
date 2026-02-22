import { getRawMaterials, createRawMaterialAction } from '../actions'
import { Box, Plus, AlertTriangle, ArrowUpRight, History, Package } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EstoquePage() {
    const materials = await getRawMaterials()

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight uppercase italic flex items-center gap-3 text-white">
                            <span className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg"><Box className="w-6 h-6 text-emerald-500" /></span>
                            Controle de Insumos
                        </h1>
                        <p className="text-neutral-400 font-mono text-[10px] mt-2 tracking-widest uppercase">Gestão de Matérias-Primas // Estoque Industrial</p>
                    </div>
                    <div className="flex gap-4">
                        <Link 
                            href="/concrete/estoque/movimentacoes" 
                            className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2"
                        >
                            <History className="w-4 h-4" /> Histórico
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Lista de Insumos */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {materials.length > 0 ? materials.map((item: any) => (
                                <div key={item.id} className={`bg-neutral-900 border p-6 rounded-2xl flex flex-col justify-between gap-6 shadow-xl transition-all ${
                                    Number(item.estoque_atual) <= Number(item.estoque_minimo) 
                                    ? 'border-red-500/50 shadow-red-500/5' 
                                    : 'border-neutral-800 hover:border-emerald-500/30'
                                }`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-black rounded-lg border border-neutral-800">
                                                <Package className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-white uppercase italic">{item.nome}</h3>
                                                <span className="text-[10px] font-mono text-neutral-500 uppercase">{item.unidade}</span>
                                            </div>
                                        </div>
                                        {Number(item.estoque_atual) <= Number(item.estoque_minimo) && (
                                            <div className="flex items-center gap-1 px-2 py-1 bg-red-900/30 border border-red-500/30 rounded text-red-500 animate-pulse">
                                                <AlertTriangle className="w-3 h-3" />
                                                <span className="text-[8px] font-black uppercase">Crítico</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-black/40 rounded-xl border border-neutral-800">
                                            <p className="text-[8px] font-bold text-neutral-500 uppercase mb-1 tracking-tighter text-wrap">Estoque Atual</p>
                                            <p className={`text-xl font-black font-mono italic ${
                                                Number(item.estoque_atual) <= Number(item.estoque_minimo) ? 'text-red-500' : 'text-emerald-500'
                                            }`}>
                                                {Number(item.estoque_atual).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-black/40 rounded-xl border border-neutral-800">
                                            <p className="text-[8px] font-bold text-neutral-500 uppercase mb-1 tracking-tighter text-wrap">Estoque Mínimo</p>
                                            <p className="text-xl font-black text-white font-mono italic opacity-40">
                                                {Number(item.estoque_minimo).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link 
                                            href={`/concrete/estoque/entrada?id=${item.id}`}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-black py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2"
                                        >
                                            <ArrowUpRight className="w-4 h-4" /> Entrada Manual
                                        </Link>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full border border-dashed border-neutral-800 p-12 text-center rounded-2xl">
                                    <p className="text-neutral-500 font-mono italic">Nenhum insumo cadastrado no estoque.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Novo Insumo */}
                    <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl h-fit">
                        <h2 className="text-sm font-black text-neutral-500 uppercase tracking-widest mb-6 border-b border-neutral-800 pb-4">Novo Insumo</h2>
                        <form action={createRawMaterialAction as any} className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black uppercase text-neutral-500 mb-1 block">Nome do Material</label>
                                <input name="nome" className="w-full bg-black border border-neutral-800 p-3 rounded-lg text-sm text-white focus:border-emerald-500 outline-none transition uppercase" placeholder="CIMENTO CP II" required />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-neutral-500 mb-1 block">Unidade</label>
                                <select name="unidade" className="w-full bg-black border border-neutral-800 p-3 rounded-lg text-sm text-white focus:border-emerald-500 outline-none appearance-none" required>
                                    <option value="kg">QUILOGRAMA (KG)</option>
                                    <option value="m3">METRO CÚBICO (M³)</option>
                                    <option value="litro">LITRO</option>
                                    <option value="unidade">UNIDADE</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-neutral-500 mb-1 block">Estoque Inicial</label>
                                    <input name="estoque_atual" type="number" step="0.001" className="w-full bg-black border border-neutral-800 p-3 rounded-lg text-sm text-white focus:border-emerald-500 outline-none" placeholder="0.00" required />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-neutral-500 mb-1 block">Estoque Mínimo</label>
                                    <input name="estoque_minimo" type="number" step="0.001" className="w-full bg-black border border-neutral-800 p-3 rounded-lg text-sm text-white focus:border-emerald-500 outline-none" placeholder="0.00" required />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-black p-4 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Cadastrar Insumo
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

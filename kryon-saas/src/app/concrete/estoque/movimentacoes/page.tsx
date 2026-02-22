import { getInventoryMovements } from '../../actions'
import { History, ArrowDownLeft, ArrowUpRight, Calendar, Tag } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MovimentacoesPage() {
    const movements = await getInventoryMovements()

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6 md:p-10 font-sans">
            <div className="max-w-5xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight uppercase italic flex items-center gap-3 text-white">
                            <span className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg"><History className="w-6 h-6 text-blue-500" /></span>
                            Histórico de Estoque
                        </h1>
                        <p className="text-neutral-400 font-mono text-[10px] mt-2 tracking-widest uppercase">Rastreabilidade de Insumos // Auditoria Operacional</p>
                    </div>
                </header>

                <div className="space-y-3">
                    {movements.length > 0 ? movements.map((mov: any) => (
                        <div key={mov.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex flex-col md:flex-row items-center gap-6 group hover:border-neutral-600 transition-all shadow-xl">
                            <div className={`p-4 rounded-xl border ${
                                mov.tipo === 'entrada' 
                                ? 'bg-emerald-900/20 text-emerald-500 border-emerald-500/20' 
                                : 'bg-red-900/20 text-red-500 border-red-500/20'
                            }`}>
                                {mov.tipo === 'entrada' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-black text-white uppercase italic">{mov.erp_raw_materials?.nome}</h3>
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                                        mov.tipo === 'entrada' ? 'bg-emerald-900 text-emerald-300 border-emerald-500/20' : 'bg-red-900 text-red-300 border-red-500/20'
                                    }`}>
                                        {mov.tipo}
                                    </span>
                                </div>
                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight flex items-center gap-2">
                                    <Tag className="w-3 h-3" /> {mov.descricao || 'Sem descrição'}
                                </p>
                            </div>

                            <div className="text-right flex items-center gap-8">
                                <div className="min-w-[100px]">
                                    <p className="text-[9px] text-neutral-500 font-bold uppercase mb-1">Quantidade</p>
                                    <p className={`text-xl font-black font-mono italic ${
                                        mov.tipo === 'entrada' ? 'text-emerald-500' : 'text-red-500'
                                    }`}>
                                        {mov.tipo === 'entrada' ? '+' : '-'}{Number(mov.quantidade).toFixed(2)}
                                    </p>
                                </div>
                                <div className="min-w-[140px]">
                                    <p className="text-[9px] text-neutral-500 font-bold uppercase mb-1">Data/Hora</p>
                                    <p className="text-xs font-black text-white font-mono flex items-center justify-end gap-2">
                                        <Calendar className="w-3 h-3 text-neutral-600" />
                                        {new Date(mov.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="border border-dashed border-neutral-800 p-12 text-center rounded-3xl">
                            <p className="text-neutral-500 font-mono italic">Nenhuma movimentação registrada.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

import { getTrucks, createTruckAction } from '../actions'
import { Truck, Plus, CheckCircle2, AlertCircle, Search } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CaminhoesPage() {
    const trucks = await getTrucks()

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight uppercase italic flex items-center gap-3 text-white">
                            <span className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg"><Truck className="w-6 h-6 text-orange-500" /></span>
                            Gestão de Frota
                        </h1>
                        <p className="text-neutral-400 font-mono text-[10px] mt-2 tracking-widest uppercase">Caminhões-Betoneira // Veículos de Carga</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Lista de Caminhões */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {trucks.length > 0 ? trucks.map((truck: any) => (
                                <div key={truck.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 bg-black rounded-lg border border-neutral-800 text-orange-500">
                                            <Truck className="w-5 h-5" />
                                        </div>
                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${getStatusColor(truck.status)}`}>
                                            {truck.status}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase italic">{truck.placa}</h3>
                                        <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest">{truck.modelo}</p>
                                    </div>
                                    <div className="pt-4 border-t border-neutral-800 flex justify-between items-center">
                                        <span className="text-[10px] font-mono text-neutral-500 uppercase">Capacidade</span>
                                        <span className="text-sm font-black text-orange-500 font-mono italic">{Number(truck.capacidade_m3).toFixed(1)} m³</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full border border-dashed border-neutral-800 p-12 text-center rounded-2xl">
                                    <p className="text-neutral-500 font-mono italic">Nenhum caminhão cadastrado na frota.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Formulário de Cadastro (Simplificado para o layout) */}
                    <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl h-fit">
                        <h2 className="text-sm font-black text-neutral-500 uppercase tracking-widest mb-6 border-b border-neutral-800 pb-4">Novo Veículo</h2>
                        <form action={createTruckAction} className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black uppercase text-neutral-500 mb-1 block">Placa</label>
                                <input name="placa" className="w-full bg-black border border-neutral-800 p-3 rounded-lg text-sm text-white focus:border-orange-500 outline-none transition uppercase" placeholder="ABC-1234" required />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-neutral-500 mb-1 block">Modelo</label>
                                <input name="modelo" className="w-full bg-black border border-neutral-800 p-3 rounded-lg text-sm text-white focus:border-orange-500 outline-none transition uppercase" placeholder="VW 24.280" required />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-neutral-500 mb-1 block">Capacidade (m³)</label>
                                <input name="capacidade_m3" type="number" step="0.1" className="w-full bg-black border border-neutral-800 p-3 rounded-lg text-sm text-white focus:border-orange-500 outline-none transition" placeholder="8.0" required />
                            </div>
                            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-black p-4 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Cadastrar Veículo
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

function getStatusColor(status: string) {
    switch (status) {
        case 'ativo': return 'bg-emerald-900/30 text-emerald-500 border-emerald-500/20'
        case 'manutencao': return 'bg-yellow-900/30 text-yellow-500 border-yellow-500/20'
        default: return 'bg-neutral-800 text-neutral-400 border-neutral-700'
    }
}

import { getDrivers, createDriverAction } from '../actions'
import { User, Plus, Phone, CreditCard, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MotoristasPage() {
    const drivers = await getDrivers()

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight uppercase italic flex items-center gap-3 text-white">
                            <span className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg"><User className="w-6 h-6 text-blue-500" /></span>
                            Gestão de Motoristas
                        </h1>
                        <p className="text-neutral-400 font-mono text-[10px] mt-2 tracking-widest uppercase">Equipe Operacional // Condutores de Frota</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {drivers.length > 0 ? drivers.map((driver: any) => (
                                <div key={driver.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between gap-6 shadow-xl group hover:border-blue-500/50 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-black rounded-full border border-neutral-800 text-blue-500">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-white uppercase italic leading-none">{driver.nome}</h3>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border mt-1 inline-block ${getStatusColor(driver.status)}`}>
                                                    {driver.status}
                                                </span>
                                            </div>
                                        </div>
                                        <ShieldCheck className="w-4 h-4 text-neutral-700 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
                                            <Phone className="w-3 h-3 text-neutral-600" /> {driver.telefone}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
                                            <CreditCard className="w-3 h-3 text-neutral-600" /> CNH: {driver.cnh}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full border border-dashed border-neutral-800 p-12 text-center rounded-2xl">
                                    <p className="text-neutral-500 font-mono italic">Nenhum motorista cadastrado no sistema.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl h-fit">
                        <h2 className="text-sm font-black text-neutral-500 uppercase tracking-widest mb-6 border-b border-neutral-800 pb-4">Novo Motorista</h2>
                        <form action={createDriverAction} className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black uppercase text-neutral-500 mb-1 block">Nome Completo</label>
                                <input name="nome" className="w-full bg-black border border-neutral-800 p-3 rounded-lg text-sm text-white focus:border-blue-500 outline-none transition uppercase" placeholder="JOÃO DA SILVA" required />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-neutral-500 mb-1 block">Telefone</label>
                                <input name="telefone" className="w-full bg-black border border-neutral-800 p-3 rounded-lg text-sm text-white focus:border-blue-500 outline-none transition" placeholder="(11) 99999-9999" required />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-neutral-500 mb-1 block">Número CNH</label>
                                <input name="cnh" className="w-full bg-black border border-neutral-800 p-3 rounded-lg text-sm text-white focus:border-blue-500 outline-none transition" placeholder="000.000.000-00" required />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Cadastrar Motorista
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
        default: return 'bg-neutral-800 text-neutral-400 border-neutral-700'
    }
}

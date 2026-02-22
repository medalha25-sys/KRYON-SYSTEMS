import { getClients, seedInitialDataAction } from '../actions'
import ClientsClient from './ClientsClient'
import { Users, UserPlus, Database } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
    const clients = await getClients()

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white flex items-center gap-3">
                            <span className="p-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl shadow-blue-500/5">
                                <Users className="w-8 h-8 text-blue-500" />
                            </span>
                            Gestão de Clientes
                        </h1>
                        <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mt-2">CRM // Engenharia de Vendas // Cadastros Base</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <ClientsClient initialClients={clients} />
                    </div>
                </header>
            </div>
        </div>
    )
}

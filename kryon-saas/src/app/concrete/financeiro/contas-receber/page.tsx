import { getAccountsReceivable, getDashboardMetrics } from '../../actions'
import AccountsReceivableClient from './AccountsReceivableClient'
import { DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AccountsReceivablePage() {
    const data = await getAccountsReceivable()
    const metrics = await getDashboardMetrics()

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white flex items-center gap-3">
                            <span className="p-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl shadow-blue-500/5">
                                <DollarSign className="w-8 h-8 text-blue-500" />
                            </span>
                            Gestão de Recebíveis
                        </h1>
                        <p className="text-[10px] font-mono text-slate-400 tracking-widest uppercase mt-2">Finanças // Faturamento Automático // Fluxo de Caixa</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="hidden md:inline-block text-[10px] font-bold px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 uppercase tracking-widest">
                            Regra de Faturamento: 30 dias ddl
                        </span>
                    </div>
                </header>

                <AccountsReceivableClient initialData={data} metrics={metrics} />
            </div>
        </div>
    )
}

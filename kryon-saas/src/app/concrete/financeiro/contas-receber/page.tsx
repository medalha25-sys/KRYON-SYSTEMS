import { getAccountsReceivable, getDashboardMetrics } from '../../actions'
import AccountsReceivableClient from './AccountsReceivableClient'

export const dynamic = 'force-dynamic'

export default async function AccountsReceivablePage() {
    const data = await getAccountsReceivable()
    const metrics = await getDashboardMetrics()

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-4 pb-32">
            <header className="flex items-center justify-between mb-8 pt-4">
                <div>
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter">Financeiro</h1>
                    <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest">Resumo de Recebíveis</p>
                </div>
            </header>
            
            <AccountsReceivableClient initialData={data} metrics={metrics} />
        </div>
    )
}

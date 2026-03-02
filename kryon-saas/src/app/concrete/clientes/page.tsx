import { getClients } from '../actions'
import ClientsClient from './ClientsClient'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
    const clients = await getClients()

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-4 pb-32">
            <header className="flex items-center justify-between mb-8 pt-4">
                <div>
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter">Clientes</h1>
                    <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest">Base de Contatos</p>
                </div>
            </header>
            
            <ClientsClient initialClients={clients} />
        </div>
    )
}

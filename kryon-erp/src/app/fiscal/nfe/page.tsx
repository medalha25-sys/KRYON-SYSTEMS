import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getInvoices } from '../../actions'
import InvoicesClient from './InvoicesClient'
import { FileText, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FiscalPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const invoices = await getInvoices()

    return (
        <div className="min-h-screen bg-neutral-950 text-slate-200 p-4 md:p-8 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-blue-500" />
                        Módulo Fiscal
                    </h2>
                    <p className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase mt-1">
                        Gestão de Notas Fiscais Eletrônicas // Emissão e Controle de Impostos
                    </p>
                </div>
            </div>

            <InvoicesClient initialData={invoices} />
        </div>
    )
}

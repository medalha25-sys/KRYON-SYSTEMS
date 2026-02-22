import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function BillingPage() {
  const supabase = await createClient()

  // Fetch recent income transactions across all orgs (Founder View)
  // We join organization to see who paid
  const { data: transactions } = await supabase
    .from('financial_transactions')
    .select(`
        *,
        organizations!inner (name, slug)
    `)
    .eq('type', 'income')
    .order('date', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fluxo de Caixa (SaaS Global)</h1>
      <p className="text-slate-400">Monitoramento de entradas financeiras em todas as clínicas.</p>
      
      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-700 text-slate-300 uppercase font-medium">
                <tr>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Clínica</th>
                    <th className="px-6 py-3">Descrição</th>
                    <th className="px-6 py-3">Valor</th>
                    <th className="px-6 py-3">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
                {transactions?.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-700/50">
                        <td className="px-6 py-4 text-slate-300">
                            {format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR })}
                        </td>
                         <td className="px-6 py-4 font-medium text-white">
                            {t.organizations?.name}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                            {t.description}
                        </td>
                        <td className="px-6 py-4 text-emerald-400 font-bold">
                            {Number(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs uppercase">
                                {t.status}
                            </span>
                        </td>
                    </tr>
                ))}
                {!transactions?.length && (
                     <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                            Nenhuma transação registrada recentemente.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  )
}

import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

export default async function SubscriptionsAdminPage() {
  const supabase = await createClient()

  // 1. Fetch all subscriptions
  const { data: rawSubscriptions, error: sError } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })

  // 2. Fetch products and organizations separately to avoid relationship ambiguity
  const { data: products } = await supabase.from('products').select('*')
  const { data: organizations } = await supabase.from('organizations').select('id, name, slug')

  if (sError) {
      return <div className="p-4 bg-red-500/10 text-red-500 rounded-lg">Erro ao carregar assinaturas: {sError.message}</div>
  }

  // 3. Join data manually
  const subscriptions = rawSubscriptions?.map(sub => ({
      ...sub,
      organizations: organizations?.find(o => o.id === sub.organization_id),
      products: products?.find(p => p.id === sub.product_id)
  }))

  // 2. Logic to map products to Landing Page Plans
  const getPlanName = (sub: any) => {
      const slug = sub.products?.slug || ''
      if (slug.includes('enterprise')) return 'Enterprise'
      if (slug.includes('pro')) return 'Pro'
      return 'Starter' // Default
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Gestão de Assinaturas (SaaS)</h1>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700">
            <Link href="/super-admin/financial" className="px-6 py-3 text-slate-400 hover:text-white transition text-sm font-medium">
                Fluxo de Caixa
            </Link>
            <Link href="/super-admin/financial/subscriptions" className="px-6 py-3 border-b-2 border-emerald-500 text-emerald-400 text-sm font-bold">
                Assinaturas Ativas
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total de Assinaturas</h3>
            <p className="text-3xl font-bold text-white">{subscriptions?.length || 0}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Inadimplentes</h3>
            <p className="text-3xl font-bold text-red-400">
                {subscriptions?.filter(s => s.status === 'past_due').length || 0}
            </p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Renovação Mensal</h3>
            <p className="text-3xl font-bold text-emerald-400">
                {(subscriptions?.reduce((acc, s) => acc + (s.products?.price || 97), 0) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-xl">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-700/50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                <tr>
                    <th className="px-6 py-4">Cliente / Org</th>
                    <th className="px-6 py-4">Sistema</th>
                    <th className="px-6 py-4">Plano</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Próxima Renovação</th>
                    <th className="px-6 py-4 text-right">Valor</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
                {subscriptions?.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-slate-700/30 transition">
                        <td className="px-6 py-4 font-medium text-white">
                            {sub.organizations?.name || 'Cliente Avulso'}
                            <div className="text-[10px] text-slate-500 font-normal">{sub.organizations?.slug}</div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="bg-slate-900 px-2 py-1 rounded text-xs border border-slate-700 text-slate-400">
                                {sub.products?.name || sub.product_slug}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`font-bold ${getPlanName(sub) === 'Enterprise' ? 'text-purple-400' : getPlanName(sub) === 'Pro' ? 'text-blue-400' : 'text-slate-400'}`}>
                                {getPlanName(sub)}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sub.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                                {sub.status === 'active' ? 'Ativo' : sub.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                            {sub.current_period_end ? format(new Date(sub.current_period_end), "dd 'de' MMM, yyyy", { locale: ptBR }) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-white">
                            {(sub.products?.price || 97).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  )
}

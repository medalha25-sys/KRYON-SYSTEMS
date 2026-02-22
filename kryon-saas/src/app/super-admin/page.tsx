import { createClient } from '@/utils/supabase/server'
import { getSoftwareMetrics } from '@/lib/saas-metrics'

export default async function SuperAdminDashboard() {
  const supabase = await createClient()
  
  // Fetch real software metrics
  const metrics = await getSoftwareMetrics()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Visão Geral</h1>
        <p className="text-slate-400">Métricas vitais do SaaS.</p>
      </div>

      {/* Financial Row */}
      <h2 className="text-xl font-semibold border-l-4 border-emerald-500 pl-4">Performance Financeira</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* MRR */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500 text-6xl font-black">R$</div>
           <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">MRR (Mensal)</h3>
           <p className="text-3xl font-bold mt-2 text-emerald-400">
             {metrics.mrr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
           </p>
           <p className="text-xs text-slate-500 mt-1">+12% vs mês anterior</p>
        </div>

        {/* ARR */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
           <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">ARR (Projeção Anual)</h3>
           <p className="text-3xl font-bold mt-2 text-slate-200">
             {metrics.arr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
           </p>
        </div>

        {/* LTV */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
           <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">LTV (Lifetime Value)</h3>
           <p className="text-3xl font-bold mt-2 text-blue-400">
             {metrics.ltv.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
           </p>
        </div>

        {/* ARPU */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
           <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">ARPU (Médio/Cliente)</h3>
           <p className="text-3xl font-bold mt-2 text-purple-400">
             {metrics.arpu.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
           </p>
        </div>
      </div>

       {/* Traction Row */}
       <h2 className="text-xl font-semibold border-l-4 border-blue-500 pl-4 mt-8">Tração & Saúde</h2>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Customers */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm flex items-center justify-between">
           <div>
                <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Clientes Ativos</h3>
                <p className="text-4xl font-bold mt-2 text-white">{metrics.activeCustomers}</p>
           </div>
           <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500">
                🏢
           </div>
        </div>
        
         {/* Churn Risk (Placeholder) */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm flex items-center justify-between">
           <div>
                <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Risco de Churn</h3>
                <p className="text-4xl font-bold mt-2 text-orange-400">2</p>
                <p className="text-xs text-slate-500">Clientes com baixa atividade</p>
           </div>
           <div className="h-12 w-12 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500">
                ⚠️
           </div>
        </div>

        {/* System Health */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm flex items-center justify-between">
           <div>
                <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Saúde do Sistema</h3>
                <p className="text-4xl font-bold mt-2 text-green-400">99.9%</p>
                <p className="text-xs text-slate-500">Uptime (Últimos 30d)</p>
           </div>
           <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-500">
                ⚡
           </div>
        </div>
       </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold mb-4">Ações Recentes (Logs)</h3>
            <div className="text-center text-slate-500 py-8">
               Aguardando implementação de logs...
            </div>
         </div>

         <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold mb-4">Crescimento Recente</h3>
             <div className="text-center text-slate-500 py-8">
               [Gráfico MRR Growth]
            </div>
         </div>
      </div>
    </div>
  )
}

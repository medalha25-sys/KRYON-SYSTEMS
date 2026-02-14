'use client'

import { useState, useEffect } from 'react'
import { getSaaSMetrics } from './actions'

export default function AdminFinancePage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getSaaSMetrics()
        setMetrics(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="p-8">Carregando métricas...</div>

  const stats = [
    { label: 'MRR (Receita Recorrente)', value: `R$ ${metrics?.mrr?.toFixed(2)}`, icon: 'attach_money', color: 'text-green-500' },
    { label: 'Clientes Ativos', value: metrics?.activeCustomers, icon: 'group', color: 'text-blue-500' },
    { label: 'Trials em Andamento', value: metrics?.activeTrials, icon: 'hourglass_top', color: 'text-yellow-500' },
    { label: 'Taxa de Conversão', value: `${metrics?.conversionRate}%`, icon: 'trending_up', color: 'text-purple-500' },
    { label: 'Churn Mensal', value: `${metrics?.churnRate}%`, icon: 'trending_down', color: 'text-red-500' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Financeiro</h1>
        <p className="text-slate-500">Visão geral da performance do SaaS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
             </div>
             <p className="text-3xl font-black text-slate-800 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 h-96 flex items-center justify-center text-slate-400">
            Gráfico de Evolução do MRR (Em breve)
         </div>
         <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 h-96 flex items-center justify-center text-slate-400">
            Distribuição de Assinaturas (Em breve)
         </div>
      </div>
    </div>
  )
}

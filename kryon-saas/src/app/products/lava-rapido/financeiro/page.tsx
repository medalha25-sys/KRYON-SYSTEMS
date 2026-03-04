'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Activity, 
  Target,
  ArrowLeft,
  Loader2,
  Layers
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '../../../../utils/supabase/client'

const supabase = createClient()

export default function FinanceDashboard() {
  const [loading, setLoading] = useState(true)
  const [finances, setFinances] = useState<any[]>([])
  const [metrics, setMetrics] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    avgTicket: 0,
    totalBookings: 0,
    progress: 0
  })

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      
      try {
        // 1. Fetch Finances
        const { data: financeData } = await supabase
          .from('lava_rapido_finances')
          .select('*')
          .order('transaction_date', { ascending: false })

        // 2. Fetch Completed Bookings for Ticket Medio
        const { count: bookingsCount } = await supabase
          .from('lava_rapido_bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Concluído')

        if (financeData) {
          setFinances(financeData)
          
          let entries = 0
          let exits = 0
          
          financeData.forEach((item: any) => {
            if (item.transaction_type === 'Entrada') {
              entries += Number(item.amount)
            } else {
              exits += Number(item.amount)
            }
          })

          const balance = entries - exits
          const totalAgendamentos = bookingsCount || 0
          const ticketMedio = totalAgendamentos > 0 ? (entries / totalAgendamentos) : (entries / (financeData.filter((i: any) => i.transaction_type === 'Entrada').length || 1))

          setMetrics({
            balance: balance,
            income: entries,
            expenses: exits,
            avgTicket: ticketMedio,
            totalBookings: totalAgendamentos,
            progress: Math.min(100, Math.round((entries / 10000) * 100))
          })
        }
      } catch (err) {
        console.error('Error fetching finance data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <div className="space-y-8 pb-20">
      <header className="flex items-center gap-4">
        <Link 
          href="/products/lava-rapido"
          className="p-2 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-1">Visão Geral Financeira</h1>
          <p className="text-gray-400">Acompanhe o desempenho e o fluxo de caixa do Papa Léguas.</p>
        </div>
      </header>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              label="Saldo Líquido" 
              value={formatCurrency(metrics.balance)} 
              icon={<DollarSign className="w-5 h-5 text-blue-400" />}
              sub="Balanço total do sistema"
              color="bg-blue-500/10"
            />
            <MetricCard 
              label="Total de Entradas" 
              value={formatCurrency(metrics.income)} 
              icon={<ArrowUpRight className="w-5 h-5 text-green-400" />}
              sub="Faturamento bruto"
              color="bg-green-400/10"
              textColor="text-green-400"
            />
            <MetricCard 
              label="Total de Saídas" 
              value={formatCurrency(metrics.expenses)} 
              icon={<ArrowDownRight className="w-5 h-5 text-red-400" />}
              sub="Despesas e custos"
              color="bg-red-400/10"
              textColor="text-red-400"
            />
            <MetricCard 
              label="Ticket Médio" 
              value={formatCurrency(metrics.avgTicket)} 
              icon={<Activity className="w-5 h-5 text-purple-400" />}
              sub={`Baseado em ${metrics.totalBookings || finances.filter(f => f.transaction_type === 'Entrada').length} serviços`}
              color="bg-purple-400/10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Last Transactions */}
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  Últimas Movimentações
                </h2>
                <Link 
                  href="/products/lava-rapido/vendas"
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 transition uppercase tracking-widest"
                >
                  Ver Todas
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-widest border-b border-gray-800">
                      <th className="pb-4 px-2">Data</th>
                      <th className="pb-4 px-2">Descrição</th>
                      <th className="pb-4 px-2">Tipo</th>
                      <th className="pb-4 px-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {finances.length > 0 ? (
                      finances.slice(0, 10).map((mov) => (
                        <tr key={mov.id} className="group hover:bg-gray-800/30 transition-colors">
                          <td className="py-4 px-2 text-sm text-gray-400">
                            {new Date(mov.transaction_date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-4 px-2 text-sm font-medium text-white group-hover:text-blue-400 transition">
                            {mov.description}
                          </td>
                          <td className="py-4 px-2">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              mov.transaction_type === 'Entrada' 
                                ? 'bg-green-500/10 text-green-500' 
                                : 'bg-red-500/10 text-red-500'
                            }`}>
                              {mov.transaction_type}
                            </span>
                          </td>
                          <td className={`py-4 px-2 text-right font-black ${
                            mov.transaction_type === 'Entrada' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {mov.transaction_type === 'Entrada' ? '+' : '-'}{formatCurrency(mov.amount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-gray-500 text-sm italic">
                          Nenhuma movimentação registrada no momento.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Goal */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-xl flex flex-col items-center">
              <h2 className="text-xl font-bold mb-10 w-full flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-500" />
                Meta Mensal
              </h2>

              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* SVG Progress Circle */}
                <svg className="w-full h-full -rotate-90">
                   <circle 
                    cx="96" cy="96" r="80" 
                    className="stroke-gray-800"
                    strokeWidth="12"
                    fill="transparent"
                   />
                   <motion.circle 
                    cx="96" cy="96" r="80" 
                    className="stroke-blue-500"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={502.4}
                    initial={{ strokeDashoffset: 502.4 }}
                    animate={{ strokeDashoffset: 502.4 * (1 - metrics.progress / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                   />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black text-white italic">{metrics.progress}%</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Concluído</span>
                </div>
              </div>

              <div className="mt-10 text-center space-y-2 w-full">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter">Progresso Atual</p>
                <div className="text-2xl font-black text-white italic">
                  {formatCurrency(metrics.income)}
                  <span className="text-xs text-gray-600 font-normal ml-2 not-italic tracking-normal">
                    / {formatCurrency(10000)}
                  </span>
                </div>
              </div>

              <div className="mt-auto w-full pt-8">
                 <button className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 py-3 rounded-2xl font-bold text-sm transition-all border border-blue-500/20">
                    Ajustar Meta
                 </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function MetricCard({ label, value, icon, sub, color, textColor = "text-white" }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-gray-900 border border-gray-800 p-8 rounded-[40px] shadow-lg relative overflow-hidden"
    >
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[40px] opacity-20 ${color}`} />
      
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${color}`}>
          {icon}
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
        <h3 className={`text-3xl font-black italic tracking-tighter ${textColor}`}>{value}</h3>
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2">{sub}</p>
      </div>
    </motion.div>
  )
}

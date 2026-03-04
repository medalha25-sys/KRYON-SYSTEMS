'use client'

import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Calendar, 
  Filter, 
  Download, 
  Car, 
  CheckCircle2, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

const data = [
  { name: 'Seg', valor: 400 },
  { name: 'Ter', valor: 300 },
  { name: 'Qua', valor: 600 },
  { name: 'Qui', valor: 800 },
  { name: 'Sex', valor: 500 },
  { name: 'Sáb', valor: 900 },
  { name: 'Dom', valor: 200 },
]

export default function ReportsPage() {
  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Relatórios & Desempenho</h1>
          <p className="text-gray-400">Analise o faturamento e a produtividade da sua equipe.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 border border-gray-800 transition-all">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all">
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard 
          title="Faturamento Diário" 
          value="R$ 840,00" 
          trend="+12%" 
          positive={true} 
          icon={<DollarSign className="w-5 h-5 text-green-400" />}
        />
        <ReportCard 
          title="Faturamento Semanal" 
          value="R$ 5.230,00" 
          trend="+5.41%" 
          positive={true} 
          icon={<Calendar className="w-5 h-5 text-blue-400" />}
        />
        <ReportCard 
          title="Faturamento Mensal" 
          value="R$ 22.150,00" 
          trend="-2.1%" 
          positive={false} 
          icon={<TrendingUp className="w-5 h-5 text-indigo-400" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Desempenho da Semana
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Stats */}
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl space-y-8">
           <h3 className="font-bold text-lg flex items-center gap-2">
                <Car className="w-5 h-5 text-amber-400" />
                Resumo Operacional (Mês)
            </h3>
            
            <div className="space-y-6">
                <ProgressItem label="Lavagens Concluídas" value={142} total={200} icon={<CheckCircle2 className="w-4 h-4 text-green-400" />} />
                <ProgressItem label="Agendamentos Online" value={86} total={100} icon={<TrendingUp className="w-4 h-4 text-blue-400" />} />
                <ProgressItem label="Ticket Médio" value={75} total={100} icon={<DollarSign className="w-4 h-4 text-indigo-400" />} suffix="R$" />
            </div>

            <div className="pt-8 border-t border-gray-800">
                <p className="text-gray-400 text-sm mb-4">Porte de Veículos mais comum:</p>
                <div className="flex gap-4">
                    <div className="bg-gray-950 px-4 py-2 rounded-xl border border-gray-800">
                        <span className="text-xs text-gray-500 block">P</span>
                        <span className="font-bold">25%</span>
                    </div>
                    <div className="bg-gray-950 px-4 py-2 rounded-xl border border-blue-500/30 ring-1 ring-blue-500/20">
                        <span className="text-xs text-blue-400 block font-bold">M</span>
                        <span className="font-bold text-blue-400 text-lg">60%</span>
                    </div>
                    <div className="bg-gray-950 px-4 py-2 rounded-xl border border-gray-800">
                        <span className="text-xs text-gray-500 block">G</span>
                        <span className="font-bold">15%</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

function ReportCard({ title, value, trend, positive, icon }: any) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl hover:border-gray-700 transition">
        <div className="flex justify-between items-start mb-4">
            <div className="bg-gray-800 p-2.5 rounded-xl">
                {icon}
            </div>
            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
                positive ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
            }`}>
                {positive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {trend}
            </div>
        </div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-1 tracking-tight">{value}</h3>
    </div>
  )
}

function ProgressItem({ label, value, total, icon, suffix = "" }: any) {
    const percentage = (value / total) * 100
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-400">
                    {icon}
                    {label}
                </span>
                <span className="font-bold text-white">{suffix}{value}</span>
            </div>
            <div className="h-2 bg-gray-950 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className="h-full bg-blue-600 rounded-full"
                />
            </div>
        </div>
    )
}

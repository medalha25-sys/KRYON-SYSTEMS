'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'
import { Calendar, DollarSign, Activity, Clock, ArrowUpRight } from 'lucide-react'
import { ProfessionalMetrics } from '@/app/products/agenda-facil/dashboard/actions'
import { format, parseISO } from 'date-fns'

interface ProfessionalDashboardProps {
  data: ProfessionalMetrics
  userName?: string
}

export function ProfessionalDashboard({ data, userName }: ProfessionalDashboardProps) {
  
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  return (
    <div className="space-y-8 p-6 bg-gray-50/50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Painel</h1>
          <p className="text-gray-500">Bem-vindo de volta, {userName}</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <Calendar className="text-gray-400" size={18} />
            <span className="text-sm font-medium text-gray-700">Este Mês</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Minha Receita"
          value={formatCurrency(data.revenue)}
          icon={<DollarSign className="text-emerald-600" size={24} />}
          trend="Gerado"
          color="emerald"
        />
        <MetricCard 
          title="Meus Atendimentos"
          value={data.sessions.toString()}
          icon={<Calendar className="text-blue-600" size={24} />}
          trend="Sessões"
          color="blue"
        />
        <MetricCard 
          title="Comparecimento"
          value={`${data.attendanceRate}%`}
          icon={<Activity className="text-amber-600" size={24} />}
          trend="Taxa"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Minha Produção Diária</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueChart}>
                <defs>
                  <linearGradient id="colorRevenuePro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(val) => `R$${val}`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(val: number | string) => [formatCurrency(Number(val)), 'Receita']} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenuePro)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Próximo Paciente</h3>
            {data.nextAppointment ? (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-start justify-between mb-2">
                        <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded shadow-sm">
                            {format(parseISO(data.nextAppointment.start_time), 'HH:mm')}
                        </span>
                        <Clock size={16} className="text-blue-400" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{data.nextAppointment.clients?.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{data.nextAppointment.agenda_services?.name}</p>
                    <div className="w-full h-1 bg-blue-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-2/3"></div>
                    </div>
                    <p className="text-xs text-blue-500 mt-2 font-medium">Confirmado</p>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    Nenhum agendamento próximo.
                </div>
            )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, trend, color }: any) {
    return (
        <motion.div whileHover={{ y: -4 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-[140px]">
            <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>{icon}</div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-${color}-50 text-${color}-600`}>
                   <ArrowUpRight size={14} />
                   {trend}
                </div>
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h2 className="text-2xl font-bold text-gray-900">{value}</h2>
            </div>
        </motion.div>
    )
}

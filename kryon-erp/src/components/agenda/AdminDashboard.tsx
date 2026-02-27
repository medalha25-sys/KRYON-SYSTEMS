'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts'
import { TrendingUp, Users, Calendar, DollarSign, Activity, ArrowUpRight } from 'lucide-react'
import { DashboardMetrics } from '@/app/products/agenda-facil/dashboard/actions'

interface AdminDashboardProps {
  data: DashboardMetrics
  organizationName?: string
}

export function AdminDashboard({ data, organizationName }: AdminDashboardProps) {
  
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  return (
    <div className="space-y-8 p-6 bg-gray-50/50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
          <p className="text-gray-500">Desempenho da {organizationName || 'Clínica Serena'}</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <Calendar className="text-gray-400" size={18} />
            <span className="text-sm font-medium text-gray-700">Este Mês</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Receita"
          value={formatCurrency(data.revenue)}
          icon={<DollarSign className="text-emerald-600" size={24} />}
          trend="+12%"
          color="emerald"
        />
        <MetricCard 
          title="Sessões"
          value={data.sessions.toString()}
          icon={<Calendar className="text-blue-600" size={24} />}
          trend="+5%"
          color="blue"
        />
        <MetricCard 
          title="Ocupação"
          value={`${data.occupancyRate}%`}
          icon={<Activity className="text-amber-600" size={24} />}
          trend="-2%"
          color="amber"
        />
        <MetricCard 
          title="Novos Pacientes"
          value={data.newPatients.toString()}
          icon={<Users className="text-purple-600" size={24} />}
          trend="+8"
          color="purple"
        />
        <MetricCard 
          title="Comparecimento"
          value={`${data.attendanceRate}%`}
          icon={<Users className="text-indigo-600" size={24} />}
          trend="Taxa"
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Faturamento Diário</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueChart}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(val) => `R$${val}`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(val: number | string) => [formatCurrency(Number(val)), 'Receita']} />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Por Profissional</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sessionsByPro} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{fill: '#4B5563', fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Desempenho por Profissional</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Profissional</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Atendimentos</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Receita Gerada</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Ticket Médio</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Comparecimento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.performanceTable?.map((pro) => (
                <tr key={pro.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{pro.name}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{pro.appointments}</td>
                  <td className="px-6 py-4 text-right text-gray-900 font-medium">{formatCurrency(pro.revenue)}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(pro.ticket)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${pro.attendance >= 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {pro.attendance}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

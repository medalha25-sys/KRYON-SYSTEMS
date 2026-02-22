'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Scale, 
  Gavel, 
  Calendar, 
  Clock, 
  FileText, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface Case {
  id: string
  case_number: string
  title: string
  client_name: string
  status: string
  created_at: string
}

interface Deadline {
  id: string
  title: string
  due_date: string
  law_cases: { title: string }
}

interface Props {
  cases: Case[]
  deadlines: Deadline[]
}

export default function KryonLawDashboardClient({ cases, deadlines }: Props) {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-900/30 rounded-lg">
                <Scale className="w-6 h-6 text-amber-500" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Kryon Law</h1>
            </div>
            <p className="text-gray-400">Bem-vindo ao seu painel jurídico. Gerencie processos e prazos com precisão.</p>
          </div>
          
          <button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-amber-900/20 active:scale-95">
            <Plus className="w-5 h-5" />
            Novo Processo
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            icon={<Gavel className="w-6 h-6 text-blue-400" />} 
            label="Processos Ativos" 
            value={cases.length.toString()} 
            change="+2 este mês"
          />
          <StatCard 
            icon={<Calendar className="w-6 h-6 text-amber-400" />} 
            label="Prazos Pendentes" 
            value={deadlines.length.toString()} 
            color="amber"
          />
          <StatCard 
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />} 
            label="Concluídos (Mês)" 
            value="12" 
          />
          <StatCard 
            icon={<Users className="w-6 h-6 text-purple-400" />} 
            label="Clientes Ativos" 
            value="48" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List: Recent Cases */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                Processos Recentes
              </h2>
              <Link href="/products/kryon-law/processos" className="text-amber-500 hover:text-amber-400 text-sm font-medium transition">
                Ver todos
              </Link>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              {cases.length > 0 ? (
                <div className="divide-y divide-gray-800">
                  {cases.slice(0, 5).map((item) => (
                    <div key={item.id} className="p-6 hover:bg-gray-800/50 transition cursor-pointer group">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-mono text-amber-500 mb-1">{item.case_number}</p>
                          <h3 className="text-lg font-bold group-hover:text-amber-400 transition">{item.title}</h3>
                          <p className="text-sm text-gray-400 mt-1">Cliente: {item.client_name}</p>
                        </div>
                        <div className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300 font-medium">
                          {item.status === 'active' ? 'Em andamento' : item.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-gray-500">Nenhum processo cadastrado ainda.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Upcoming Deadlines */}
          <div className="space-y-6">
             <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                Próximos Prazos
              </h2>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
               <div className="space-y-6">
                {deadlines.length > 0 ? deadlines.map((deadline) => (
                  <div key={deadline.id} className="relative pl-6 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[2px] before:bg-amber-500/30">
                    <p className="text-xs text-amber-500 font-bold mb-1">
                      {new Date(deadline.due_date).toLocaleDateString('pt-BR')}
                    </p>
                    <h4 className="text-sm font-bold text-gray-200">{deadline.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 italic line-clamp-1">{deadline.law_cases?.title}</p>
                  </div>
                )) : (
                  <div className="text-center py-6">
                    <AlertCircle className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Sem prazos urgentes no momento.</p>
                  </div>
                )}
               </div>
            </div>

            <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/20 border border-amber-600/30 rounded-2xl p-6">
               <h3 className="font-bold mb-2">Dica Kryon</h3>
               <p className="text-sm text-gray-400 leading-relaxed">
                  Mantenha seus documentos digitalizados vinculados aos processos para acesso rápido em qualquer lugar.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, change, color = 'blue' }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-gray-900 border border-gray-800 p-6 rounded-2xl"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-2 bg-gray-800 rounded-lg`}>
          {icon}
        </div>
        <span className="text-sm text-gray-400 font-medium">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold">{value}</span>
        {change && <span className="text-xs text-emerald-500 mb-1 font-bold">{change}</span>}
      </div>
    </motion.div>
  )
}

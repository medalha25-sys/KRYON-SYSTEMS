'use client'

import { motion } from 'framer-motion'
import { 
  Car, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ChevronRight,
  Plus
} from 'lucide-react'
import Link from 'next/link'

export default function LavaRapidoDashboard() {
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-1">Painel de Operações</h1>
          <p className="text-gray-400">Acompanhe as ordens de hoje e a saúde do seu lava jato.</p>
        </div>
        <Link 
          href="/products/lava-rapido/vendas/novo" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-5 h-5" />
          Nova OS
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Clock className="w-6 h-6 text-amber-500" />} 
          label="Em Fila" 
          value="4" 
          trend="+2 desde as 8h"
        />
        <StatCard 
          icon={<Car className="w-6 h-6 text-blue-500" />} 
          label="Em Lavagem" 
          value="2" 
          trend="Capacidade: 75%"
        />
        <StatCard 
          icon={<CheckCircle2 className="w-6 h-6 text-green-500" />} 
          label="Finalizados (Hoje)" 
          value="12" 
          trend="Meta: 20"
        />
        <Link href="/products/lava-rapido/financeiro" className="block cursor-pointer">
          <StatCard 
            icon={<TrendingUp className="w-6 h-6 text-indigo-500" />} 
            label="Faturamento (Mês)" 
            value="R$ 6.200,00" 
            trend="+15% vs ontem"
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-400" />
              Ordens Ativas
            </h2>
            <Link href="/products/lava-rapido/vendas" className="text-sm text-blue-400 hover:underline">
              Ver todas
            </Link>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-4 text-center py-12 text-gray-500">
               <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-gray-600" />
               </div>
               <p>Nenhuma ordem de serviço ativa no momento.</p>
               <p className="text-sm">As ordens que você criar aparecerão aqui.</p>
            </div>
          </div>
        </div>

        {/* Quick Actions / Alerts */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Alertas & Avisos</h2>
          <div className="space-y-4">
            <AlertItem 
              type="warning" 
              icon={<AlertCircle className="w-5 h-5" />}
              title="Produtos em Baixa"
              description="Shampoo automotivo abaixo de 10% no estoque."
            />
             <AlertItem 
              type="info" 
              icon={<CheckCircle2 className="w-5 h-5" />}
              title="Meta Batida"
              description="Você alcançou a meta de lavagens semanais!"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: string }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-gray-900 border border-gray-800 p-6 rounded-2xl"
    >
      <div className="bg-gray-800 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-gray-400 text-sm font-medium">{label}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
      <p className="text-xs text-blue-400 mt-2 font-medium">{trend}</p>
    </motion.div>
  )
}

function AlertItem({ type, icon, title, description }: { type: 'warning' | 'info'; icon: React.ReactNode; title: string; description: string }) {
  const colors = type === 'warning' ? 'bg-amber-900/20 border-amber-900/30 text-amber-500' : 'bg-blue-900/20 border-blue-900/30 text-blue-400'
  return (
    <div className={`p-4 rounded-xl border ${colors} flex gap-4`}>
      <div className="mt-1">{icon}</div>
      <div>
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs opacity-80 mt-1">{description}</p>
      </div>
    </div>
  )
}

function ClipboardList(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
      <path d="M9 8h6" />
    </svg>
  )
}

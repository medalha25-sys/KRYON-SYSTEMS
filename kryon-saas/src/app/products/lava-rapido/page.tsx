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
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function LavaRapidoDashboard() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchActiveOrders() {
      const { data, error } = await supabase
        .from('lava_rapido_orders')
        .select(`
          *,
          vehicle:lava_rapido_vehicles(*),
          service:lava_rapido_services(*)
        `)
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false })

      if (data) {
        setOrders(data)
      }
      setLoading(false)
    }
    fetchActiveOrders()
  }, [])

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
          value={loading ? "..." : orders.filter(o => o.status === 'pending').length.toString()} 
          trend="Atuais"
        />
        <StatCard 
          icon={<Car className="w-6 h-6 text-blue-500" />} 
          label="Em Lavagem" 
          value={loading ? "..." : orders.filter(o => o.status === 'in_progress').length.toString()} 
          trend="Atuais"
        />
        <StatCard 
          icon={<CheckCircle2 className="w-6 h-6 text-green-500" />} 
          label="Finalizados (Hoje)" 
          value="-" 
          trend="Em breve"
        />
        <Link href="/products/lava-rapido/financeiro" className="block cursor-pointer">
          <StatCard 
            icon={<TrendingUp className="w-6 h-6 text-indigo-500" />} 
            label="Faturamento" 
            value="-" 
            trend="Em breve"
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
            {loading ? (
              <div className="p-4 text-center py-12 text-gray-500">Carregando ordens...</div>
            ) : orders.length > 0 ? (
              <div className="divide-y divide-gray-800">
                {orders.map(order => (
                  <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-800/50 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{order.vehicle?.plate || 'Sem Placa'} - {order.vehicle?.owner_name}</p>
                        <p className="text-xs text-gray-400">{order.service?.name} • R$ {order.total_price}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${order.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                      {order.status === 'pending' ? 'Na Fila' : 'Lavando'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center py-12 text-gray-500">
                 <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="w-8 h-8 text-gray-600" />
                 </div>
                 <p>Nenhuma ordem de serviço ativa no momento.</p>
                 <p className="text-sm">As ordens que você aprovar na Agenda aparecerão aqui.</p>
              </div>
            )}
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

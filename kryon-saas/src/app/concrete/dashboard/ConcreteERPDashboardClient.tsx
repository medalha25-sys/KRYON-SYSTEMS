'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  Truck, 
  ClipboardList, 
  Activity, 
  Box, 
  Navigation,
  CheckCircle2,
  Clock,
  Plus,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Factory,
  Cog,
  ShoppingBag,
  User,
  LayoutDashboard,
  AlertTriangle,
  Beaker,
  History as HistoryIcon,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { popularBancoInicialAction } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
  stats: any
}

export default function ConcreteERPDashboardClient({ stats }: Props) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const handleImportData = async () => {
    setLoading(true)
    const res = await popularBancoInicialAction()
    setLoading(false)
    if (res.success) {
      toast.success(res.message || 'Base populada com sucesso!')
      router.refresh()
    } else {
      toast.error(res.error || 'Erro ao popular banco')
    }
  }

  if (!stats) return <div className="p-10 text-center">Carregando dados...</div>

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-neutral-800 rounded-lg">
                <Building2 className="w-6 h-6 text-orange-500" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight uppercase italic">Concrete ERP</h1>
            </div>
            <p className="text-neutral-400 font-mono text-sm tracking-wider">BATTERY PLANT CONTROL SYSTEMS // BRASIL</p>
          </div>
          
          <div className="flex gap-4">
             <button 
               onClick={() => router.push('/concrete/pedidos/novo')}
               className="flex items-center gap-2 bg-white text-black hover:bg-neutral-200 px-6 py-3 rounded-md font-bold transition active:scale-95 uppercase text-sm tracking-widest"
             >
                <Plus className="w-4 h-4" />
                Novo Pedido
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          <StatCard 
            icon={<DollarSign className="w-5 h-5" />} 
            label="Receita Global" 
            value={`R$ ${stats.receita_total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} 
            sub="Faturamento"
            isActive
          />
          <StatCard 
            icon={<Navigation className="w-5 h-5" />} 
            label="Em Transporte" 
            value={stats.entregas_em_transporte.toString()} 
            sub="Cargas na rua"
            isActive
          />
          <StatCard 
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} 
            label="Concluídas" 
            value={stats.entregas_concluidas.toString()} 
            sub="Entregas"
          />
          <StatCard 
            icon={<FileText className="w-5 h-5 text-blue-400" />} 
            label="NF-e Emitidas" 
            value={stats.total_notas_emitidas?.toString() || '0'} 
            sub="Simulado"
          />
          <StatCard 
            icon={<ShoppingBag className="w-5 h-5" />} 
            label="Pendentes" 
            value={stats.pedidos_pendentes.toString()} 
            sub="Produção"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Internal vs External Chart (Mock visualization for now) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alertas Críticos */}
          {stats.itens_estoque_baixo > 0 && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="mt-8 bg-red-900/10 border border-red-500/30 p-6 rounded-3xl flex items-center justify-between"
            >
               <div className="flex items-center gap-6">
                 <div className="p-4 bg-red-900/40 rounded-2xl animate-pulse">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                 </div>
                 <div>
                    <h4 className="text-lg font-black text-white px-1 uppercase italic tracking-tighter">Atenção: Insumos Críticos</h4>
                    <p className="text-sm text-red-400/80 font-medium px-1">Existem {stats.itens_estoque_baixo} itens com estoque abaixo do limite de segurança.</p>
                 </div>
               </div>
               <Link 
                 href="/concrete/estoque" 
                 className="bg-red-600 hover:bg-red-500 text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg shadow-red-500/20"
               >
                 Verificar Estoque
               </Link>
            </motion.div>
          )}

            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-lg">
                <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500 mb-8 border-b border-neutral-800 pb-4">
                    Distribuição de Carga (m³)
                </h2>
                <div className="flex flex-col gap-8">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-sm font-bold uppercase italic">Concreto Externo (Venda)</span>
                             <span className="font-mono text-orange-500 font-bold">{stats.total_m3_externo.toFixed(1)} m³</span>
                        </div>
                        <div className="w-full bg-black h-4 rounded-full overflow-hidden border border-neutral-800">
                             <div 
                                className="bg-orange-600 h-full transition-all duration-1000" 
                                style={{ width: `${(stats.total_m3_externo / (stats.total_m3_externo + stats.total_m3_interno + 0.1)) * 100}%` }} 
                             />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Clock className="w-16 h-16 text-orange-500" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">A Receber</p>
                        <h3 className="text-2xl font-black font-mono text-orange-400">R$ {stats.total_a_receber.toLocaleString('pt-BR')}</h3>
                    </div>

                    <div className="bg-emerald-600/5 border border-emerald-500/20 p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 mb-2">Total Recebido</p>
                        <h3 className="text-2xl font-black font-mono text-emerald-400">R$ {stats.total_recebido.toLocaleString('pt-BR')}</h3>
                    </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-sm font-bold uppercase italic">Concreto Interno (Obras)</span>
                             <span className="font-mono text-blue-500 font-bold">{stats.total_m3_interno.toFixed(1)} m³</span>
                        </div>
                        <div className="w-full bg-black h-4 rounded-full overflow-hidden border border-neutral-800">
                             <div 
                                className="bg-blue-600 h-full transition-all duration-1000" 
                                style={{ width: `${(stats.total_m3_interno / (stats.total_m3_externo + stats.total_m3_interno + 0.1)) * 100}%` }} 
                             />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Link href="/concrete/estoque" className="bg-neutral-900 border border-neutral-800 p-6 rounded hover:border-emerald-500 transition group">
                    <h3 className="text-sm font-bold uppercase mb-2 group-hover:text-emerald-400">Estoque de Insumos</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">Controle de cimento, areia e brita com baixa automática.</p>
                 </Link>
                 <Link href="/concrete/producao" className="bg-neutral-900 border border-neutral-800 p-6 rounded hover:border-blue-500 transition group">
                    <h3 className="text-sm font-bold uppercase mb-2 group-hover:text-blue-400">Linha de Produção</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">Gestão industrial em tempo real e controle de ordens de serviço.</p>
                 </Link>
                 <Link href="/concrete/entregas" className="bg-neutral-900 border border-neutral-800 p-6 rounded hover:border-emerald-500 transition group">
                    <h3 className="text-sm font-bold uppercase mb-2 group-hover:text-emerald-400">Logística</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">Controle de entregas, rastreamento e confirmação de recebimento.</p>
                 </Link>
                 <Link href="/concrete/caminhoes" className="bg-neutral-900 border border-neutral-800 p-6 rounded hover:border-orange-500 transition group">
                    <h3 className="text-sm font-bold uppercase mb-2 group-hover:text-orange-500">Gestão de Frota</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">Cadastro de caminhões, manutenção e capacidade de carga.</p>
                 </Link>
                 <Link href="/concrete/motoristas" className="bg-neutral-900 border border-neutral-800 p-6 rounded hover:border-blue-500 transition group">
                    <h3 className="text-sm font-bold uppercase mb-2 group-hover:text-blue-500">Motoristas</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">Controle de equipe operacional e licenças de condução.</p>
                 </Link>
            </div>
          </div>

          {/* Sidebar: Batch Control */}
          <div className="space-y-6">
             <div className="bg-neutral-900 border border-neutral-800 p-6 rounded shadow-xl">
               <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500 mb-6 flex items-center gap-2">
                  Status da Usina
               </h3>
               <div className="space-y-6">
                  <StatusItem label="Misturador 01" status="Produtivo" color="emerald" pulse />
                  <StatusItem label="Silos de Cimento" status="65% Estocado" color="blue" />
                  <StatusItem label="Balança de Agregados" status="Calibrada" color="emerald" />
               </div>
             </div>

             <div className="bg-orange-600 p-6 rounded shadow-xl text-black">
                <h3 className="font-black italic text-xl uppercase mb-2">Suporte Industrial</h3>
                <p className="text-sm font-bold opacity-80 mb-6 font-mono uppercase tracking-tighter">Ambiente de Testes Ativo</p>
                <button 
                  onClick={handleImportData}
                  disabled={loading}
                  className="w-full bg-black text-white p-3 rounded text-[10px] font-black uppercase tracking-widest hover:bg-neutral-900 transition flex items-center justify-center gap-2 shadow-2xl active:scale-95"
                >
                  {loading ? 'Populando...' : 'Popular Banco para Testes'}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, isActive }: any) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={`p-6 rounded border transition-all ${
        isActive 
        ? 'bg-orange-600 text-black border-orange-500 shadow-lg shadow-orange-900/20' 
        : 'bg-neutral-900 border-neutral-800 text-neutral-100'
      }`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-2 rounded-md ${isActive ? 'bg-black/10' : 'bg-neutral-800'}`}>
          {icon}
        </div>
        <span className={`text-[10px] uppercase tracking-widest font-bold ${isActive ? 'text-black/60' : 'text-neutral-500'}`}>{label}</span>
      </div>
      <div>
        <span className="text-4xl font-black font-mono tracking-tighter">{value}</span>
        <p className={`text-xs mt-1 font-medium ${isActive ? 'text-black/70' : 'text-neutral-500'}`}>{sub}</p>
      </div>
    </motion.div>
  )
}

function StatusItem({ label, status, color, pulse }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold text-${color}-500/80`}>{status}</span>
        <div className={`w-2 h-2 rounded-full bg-${color}-500 ${pulse ? 'animate-pulse' : ''}`} />
      </div>
    </div>
  )
}

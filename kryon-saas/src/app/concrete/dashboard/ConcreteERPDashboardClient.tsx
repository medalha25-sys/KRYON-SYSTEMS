'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  CheckCircle2,
  Plus,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  LayoutDashboard,
  Factory,
  Box,
  Cog,
  ShoppingCart,
  Truck,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  stats: any
}

export default function ConcreteERPDashboardClient({ stats }: Props) {
  const router = useRouter()
  const [showRevenue, setShowRevenue] = React.useState(true)

  if (!stats) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-10 font-sans selection:bg-orange-500/30 pb-24">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header - Minimalist & High Contrast */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-black tracking-tightest uppercase italic text-white leading-none">
              Portal de <span className="text-orange-500">Vendas</span>
            </h1>
            <p className="text-neutral-500 text-xs mt-2 font-bold uppercase tracking-[0.3em]">Operação Comercial Ativa</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex"
          >
             <button 
               onClick={() => router.push('/concrete/pedidos/novo')}
               className="w-full md:w-auto flex items-center justify-center gap-4 bg-orange-600 text-black hover:bg-orange-500 px-10 py-5 rounded-[2rem] font-black transition-all active:scale-95 uppercase text-sm tracking-widest shadow-2xl shadow-orange-600/40"
             >
                <Plus className="w-6 h-6 stroke-[3px]" />
                Novo Pedido
            </button>
          </motion.div>
        </header>

        {/* Highlight Stats - Glassmorphism & Micro-animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={<DollarSign className="w-6 h-6 text-black" />} 
            label="Faturamento do Dia" 
            value={showRevenue 
              ? `R$ ${(stats.faturamento_dia || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
              : 'R$ •••••'
            } 
            sub="Ver detalhes"
            href="/concrete/financeiro/contas-receber"
            isActive
            delay={0.1}
            onToggleVisibility={() => setShowRevenue(!showRevenue)}
            showVisibilityToggle={true}
            isVisible={showRevenue}
          />
          <StatCard 
            icon={<ShoppingBag className="w-6 h-6 text-orange-500" />} 
            label="Pedidos em Aberto" 
            value={(stats.pedidos_em_andamento || 0).toString()} 
            sub="Em andamento"
            href="/concrete/pedidos"
            delay={0.2}
          />
          <StatCard 
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />} 
            label="Concluídos" 
            value={stats.entregas_concluidas.toString()} 
            sub="Prontos p/ Entrega"
            delay={0.3}
          />
          <StatCard 
            icon={<TrendingUp className="w-6 h-6 text-blue-400" />} 
            label="Alcance da Meta" 
            value="85%" 
            sub="Desempenho Atual"
            delay={0.4}
          />
        </div>

        {/* Product Catalog - Highly Intuitive Cards */}
        <section>
            <div className="flex items-center gap-4 mb-8">
                <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-neutral-600 whitespace-nowrap">
                    Catálogo de Produtos
                </h2>
                <div className="h-[1px] w-full bg-neutral-900"></div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <ProductShortcut 
                    href="/concrete/produtos?category=concreto"
                    icon={<Factory className="w-10 h-10 text-blue-500" />}
                    title="Concreto"
                    desc="Usinado m³"
                    color="blue"
                    delay={0.5}
                />
                
                <ProductShortcut 
                    href="/concrete/produtos?category=premoldados"
                    icon={<Box className="w-10 h-10 text-emerald-500" />}
                    title="Pré-moldado"
                    desc="Estruturas"
                    color="emerald"
                    delay={0.6}
                />

                <ProductShortcut 
                    href="/concrete/produtos?category=manilhas"
                    icon={<Cog className="w-10 h-10 text-orange-500" />}
                    title="Manilhas"
                    desc="Tubulação"
                    color="orange"
                    delay={0.7}
                />

                <ProductShortcut 
                    href="/concrete/produtos?category=bloquetes"
                    icon={<LayoutDashboard className="w-10 h-10 text-purple-500" />}
                    title="Bloquetes"
                    desc="Pavimentação"
                    color="purple"
                    delay={0.8}
                />
            </div>
        </section>

        {/* Quick Actions Sections */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <ActionCard 
                href="/concrete/clientes"
                icon={<ShoppingCart className="w-7 h-7" />}
                title="Gestão de Clientes"
                desc="Acompanhe sua carteira e histórico de vendas."
                delay={0.9}
             />

             <ActionCard 
                href="/concrete/entregas"
                icon={<Truck className="w-7 h-7" />}
                title="Status de Entrega"
                desc="Monitore o frete dos seus pedidos em tempo real."
                delay={1.0}
             />
        </section>

      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, isActive, delay, href, onToggleVisibility, showVisibilityToggle, isVisible }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
      className="block cursor-pointer"
      onClick={() => href && window.location.assign(href)}
    >
      <div className={`relative p-8 rounded-[2rem] border overflow-hidden backdrop-blur-md transition-all duration-300 ${
        isActive 
        ? 'bg-orange-600 text-black border-orange-400 shadow-[0_20px_50px_rgba(234,88,12,0.3)]' 
        : 'bg-neutral-900/40 border-neutral-800 text-neutral-100 hover:bg-neutral-800/60'
      }`}>
        {/* Visibility Toggle Button */}
        {showVisibilityToggle && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility?.();
            }}
            className="absolute top-6 right-6 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors z-10"
          >
            {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        <div className="flex items-center gap-5 mb-6">
          <div className={`p-3 rounded-2xl ${isActive ? 'bg-black/10' : 'bg-neutral-950/50'}`}>
            {icon}
          </div>
          <span className={`text-[10px] uppercase tracking-[0.25em] font-black ${isActive ? 'text-black/60' : 'text-neutral-500'}`}>{label}</span>
        </div>
        <div>
          <span className="text-4xl font-black font-mono tracking-tighter leading-none">{value}</span>
          <p className={`text-xs mt-3 font-bold uppercase tracking-wider flex items-center gap-2 ${isActive ? 'text-black/70' : 'text-neutral-500'}`}>
            {sub}
            <Plus className="w-3 h-3" />
          </p>
        </div>
        {isActive && (
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-black opacity-5 rounded-full blur-3xl"></div>
        )}
      </div>
    </motion.div>
  )
}

function ProductShortcut({ href, icon, title, desc, color, delay }: any) {
    const colorClasses: any = {
        blue: 'hover:border-blue-500/50 hover:bg-blue-500/5',
        emerald: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
        orange: 'hover:border-orange-500/50 hover:bg-orange-500/5',
        purple: 'hover:border-purple-500/50 hover:bg-purple-500/5'
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
        >
            <Link href={href} className={`block bg-neutral-900/60 border border-neutral-800 p-6 md:p-10 rounded-[2.5rem] transition-all group backdrop-blur-sm active:scale-95 ${colorClasses[color]}`}>
                <div className={`p-6 rounded-[1.5rem] mb-6 transition-all group-hover:scale-110 inline-block ${color === 'blue' ? 'bg-blue-500/10' : color === 'emerald' ? 'bg-emerald-500/10' : color === 'orange' ? 'bg-orange-500/10' : 'bg-purple-500/10'}`}>
                    {icon}
                </div>
                <h3 className="text-xl font-black uppercase italic mb-1 tracking-tighter leading-none">{title}</h3>
                <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest">{desc}</p>
            </Link>
        </motion.div>
    )
}

function ActionCard({ href, icon, title, desc, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Link href={href} className="flex flex-col bg-neutral-900/40 border border-neutral-800 p-8 rounded-[2rem] hover:bg-neutral-800/60 transition group overflow-hidden relative">
                <div className="flex items-center gap-5 mb-4">
                    <div className="p-4 bg-neutral-950 rounded-2xl group-hover:bg-white group-hover:text-black transition-all">
                        {icon}
                    </div>
                    <h3 className="text-2xl font-black tracking-tightest group-hover:text-white transition-colors uppercase italic">{title}</h3>
                </div>
                <p className="text-sm text-neutral-500 font-medium leading-relaxed max-w-xs">{desc}</p>
                <div className="absolute right-8 bottom-8 opacity-0 group-hover:opacity-10 transition-opacity">
                    {icon}
                </div>
            </Link>
        </motion.div>
    )
}

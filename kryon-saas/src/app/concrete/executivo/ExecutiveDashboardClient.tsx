'use client'

import React, { useState, useEffect } from 'react'
import { 
    TrendingUp, 
    DollarSign, 
    BarChart3, 
    PieChart as PieChartIcon, 
    Truck, 
    Package, 
    AlertTriangle,
    Calendar,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Target
} from 'lucide-react'
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'
import { getExecutiveMetrics } from '../actions'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function ExecutiveDashboardClient({ initialMetrics }: { initialMetrics: any }) {
    const [metrics, setMetrics] = useState(initialMetrics)
    const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'year'>('30d')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (period !== '30d') { // Skip initial load since we already have it
            fetchMetrics()
        }
    }, [period])

    const fetchMetrics = async () => {
        setLoading(true)
        const data = await getExecutiveMetrics(period)
        if (data) setMetrics(data)
        setLoading(false)
    }

    if (!metrics) return <div className="p-10 text-center">Nenhum dado disponível.</div>

    const financialPieData = [
        { name: 'Recebido', value: metrics.financeiro.total_recebido },
        { name: 'Pendente', value: metrics.financeiro.total_a_receber },
        { name: 'Vencido', value: metrics.financeiro.total_vencido },
    ].filter(d => d.value > 0)

    const KPICard = ({ title, value, sub, icon: Icon, colorClass, trend }: any) => (
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-[2rem] relative overflow-hidden group hover:border-neutral-700 transition-all">
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                <Icon className="w-16 h-16" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">{title}</p>
            <h3 className="text-3xl font-black font-mono tracking-tighter text-white mb-2">{value}</h3>
            <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700`}>
                    {sub}
                </span>
                {trend && (
                    <span className={`flex items-center text-[10px] font-bold ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
        </div>
    )

    return (
        <div className={`space-y-8 pb-12 transition-opacity duration-500 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            {/* Header / Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-neutral-900 border border-neutral-800 p-6 rounded-[2.5rem] shadow-2xl">
                <div>
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-blue-500" />
                        Painel Estratégico
                    </h2>
                    <p className="text-[9px] font-mono text-neutral-500 tracking-widest uppercase mt-1">Visão Geral de Performance // Tomada de Decisão</p>
                </div>

                <div className="flex items-center gap-2 p-1 bg-black rounded-2xl border border-neutral-800">
                    {[
                        { id: '7d', label: '7 Dias' },
                        { id: '30d', label: '30 Dias' },
                        { id: '90d', label: '90 Dias' },
                        { id: 'year', label: 'Ano Atual' }
                    ].map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setPeriod(p.id as any)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                period === p.id 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                : 'text-neutral-500 hover:text-neutral-300'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard 
                    title="Faturamento Bruto" 
                    value={`R$ ${(metrics.financeiro.faturamento_total / 1000).toFixed(1)}k`} 
                    sub="Pedidos Entregues"
                    icon={DollarSign}
                    trend={12.5}
                />
                <KPICard 
                    title="Lucro Líquido" 
                    value={`R$ ${(metrics.financeiro.lucro_total / 1000).toFixed(1)}k`} 
                    sub="Margem Operacional"
                    icon={Target}
                    trend={8.2}
                />
                <KPICard 
                    title="Margem Média" 
                    value={`${metrics.financeiro.margem_percentual.toFixed(1)}%`} 
                    sub="Eficiência Global"
                    icon={BarChart3}
                />
                <KPICard 
                    title="Volume Produzido" 
                    value={`${metrics.operacional.volume_produzido_m3}m³`} 
                    sub="Capacidade Utilizada"
                    icon={Package}
                />
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Evolution Chart */}
                <div className="lg:col-span-2 bg-neutral-900/50 border border-neutral-800 p-8 rounded-[2.5rem] shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-white">Evolução Financeira</h4>
                            <p className="text-[10px] text-neutral-500 mt-1">Faturamento vs Lucro Real</p>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metrics.chartData}>
                                <defs>
                                    <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#525252" 
                                    fontSize={10} 
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => val.split('/')[0] + '/' + val.split('/')[1]}
                                />
                                <YAxis 
                                    stroke="#525252" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(val) => `R$${val/1000}k`}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #262626', borderRadius: '1rem' }}
                                    itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="faturamento" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorFat)" />
                                <Area type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLucro)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Pie Chart */}
                <div className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-[2.5rem] shadow-xl flex flex-col">
                    <h4 className="text-sm font-black uppercase tracking-widest text-white mb-2 text-center">Saúde do Recebível</h4>
                    <p className="text-[10px] text-neutral-500 text-center mb-8">Status Geral das Contas</p>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={financialPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {financialPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Rankings & Inventory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Rankings */}
                <div className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-[2.5rem] shadow-xl">
                    <h4 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        Top 5 Mix de Produtos
                    </h4>
                    <div className="space-y-4">
                        {metrics.produtos.ranking_produtos.map((p: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-black/40 border border-neutral-800/50 rounded-2xl group hover:border-blue-500/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <span className="w-8 h-8 flex items-center justify-center bg-neutral-800 rounded-lg text-[10px] font-black text-neutral-500">0{idx+1}</span>
                                    <div>
                                        <p className="text-xs font-bold text-white uppercase">{p.name}</p>
                                        <p className="text-[10px] text-neutral-500 uppercase">{p.volume} m³ vendidos</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-emerald-500 font-mono">R$ {p.profit.toLocaleString('pt-BR')}</p>
                                    <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Lucro Total</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Critical Inventory */}
                <div className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-[2.5rem] shadow-xl">
                    <h4 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Insumos Críticos
                    </h4>
                    <div className="space-y-4">
                        {metrics.estoque.materias_primas_criticas.length > 0 ? (
                            metrics.estoque.materias_primas_criticas.map((m: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 flex items-center justify-center bg-orange-500/10 rounded-xl">
                                            <Package className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white uppercase">{m.nome}</p>
                                            <p className="text-[10px] text-orange-500/70 font-bold uppercase">Reposição Urgente</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-white font-mono">{m.estoque_atual} {m.unidade}</p>
                                        <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Mínimo: {m.estoque_minimo}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center border-2 border-dashed border-neutral-800 rounded-3xl">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Nenhum Insumo Crítico</p>
                            </div>
                        )}
                    </div>

                    {metrics.produtos.produto_maior_margem && (
                        <div className="mt-8 p-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Target className="w-12 h-12 text-blue-500" />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Destaque de Rentabilidade</p>
                            <h5 className="text-sm font-black text-white uppercase">{metrics.produtos.produto_maior_margem.name}</h5>
                            <p className="text-[10px] text-neutral-500 mt-2">Este produto apresenta a melhor relação custo/benefício no período.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  )
}

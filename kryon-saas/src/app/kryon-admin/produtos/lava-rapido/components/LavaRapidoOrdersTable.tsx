'use client'

import React, { useState } from 'react'
import {
  Percent,
  CheckCircle2,
  Clock,
  AlertCircle,
  Car,
  Search,
  ArrowUpRight,
  Filter,
  Sparkles,
  Layers,
  XCircle
} from 'lucide-react'
import { LavaRapidoOrder } from '../types'

interface LavaRapidoOrdersTableProps {
  orders?: LavaRapidoOrder[]
  selectedPeriodLabel?: string
  isLoading?: boolean
}

const statusBadgeStyles: Record<string, string> = {
  completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  in_progress: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  canceled: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  delivered: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
}

export function LavaRapidoOrdersTable({
  orders = [],
  selectedPeriodLabel = 'Este mês',
  isLoading = false
}: LavaRapidoOrdersTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCompany, setFilterCompany] = useState<string>('all')

  // Obter lista única de estabelecimentos para o dropdown
  const uniqueCompanies = Array.from(new Set(orders.map(o => o.shopSlug))).filter(Boolean)

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shopSlug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.serviceName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesCompany = filterCompany === 'all' || order.shopSlug === filterCompany

    return matchesSearch && matchesStatus && matchesCompany
  })

  const completedCount = orders.filter(o => o.status === 'completed').length
  const totalCommission = completedCount * 2.00

  if (isLoading) {
    return (
      <section className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] animate-pulse space-y-4">
        <div className="h-6 w-56 bg-white/10 rounded"></div>
        <div className="h-40 w-full bg-white/5 rounded-2xl"></div>
      </section>
    )
  }

  return (
    <section className="p-5 sm:p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] relative overflow-hidden shadow-xl shadow-black/40 space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Percent size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Histórico Operacional e Comissões Detalhadas
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-bold">
                R$ 2,00 / lavagem
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Auditoria de ordens de serviço do Lava Rápido com cálculo server-side da comissão Kryon.
            </p>
          </div>
        </div>

        {/* Counters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3.5 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-blue-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Concluídas ({selectedPeriodLabel})</p>
              <p className="text-xs font-black text-white">{completedCount} ordens</p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
            <Sparkles size={15} className="text-emerald-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-400/90">Comissão Gerada</p>
              <p className="text-xs font-black text-emerald-300">
                {totalCommission.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterStatus === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({orders.length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterStatus === 'completed' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Concluídas ({orders.filter(o => o.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilterStatus('in_progress')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterStatus === 'in_progress' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Em Lavagem ({orders.filter(o => o.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterStatus === 'pending' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Na Fila ({orders.filter(o => o.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('canceled')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterStatus === 'canceled' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Canceladas ({orders.filter(o => o.status === 'canceled').length})
            </button>
          </div>

          {/* Company Dropdown Filter */}
          {uniqueCompanies.length > 1 && (
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="all" className="bg-[#0B0F19]">Todas as Lojas</option>
              {uniqueCompanies.map(c => (
                <option key={c} value={c} className="bg-[#0B0F19]">{c}</option>
              ))}
            </select>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por OS, loja ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredOrders.length > 0 ? (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-3">Data / Conclusão</th>
                <th className="py-3 px-3">Empresa / Estabelecimento</th>
                <th className="py-3 px-3">Ordem de Serviço</th>
                <th className="py-3 px-3">Serviço Executado</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Valor da Lavagem</th>
                <th className="py-3 px-3 text-right">Comissão Kryon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredOrders.map((order) => {
                const isCompleted = order.status === 'completed'

                return (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Data / Hora */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-300 font-medium">
                      <div>{order.date}</div>
                      <div className="text-[10px] text-slate-500">{order.time}</div>
                    </td>

                    {/* Estabelecimento / Empresa */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                          <Car size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-blue-300 transition-colors">
                            {order.shopSlug}
                          </p>
                          {order.vinculoStatus === 'pendente' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-400/90 font-medium">
                              <AlertCircle size={10} />
                              Vínculo pendente
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400/90 font-medium">
                              <CheckCircle2 size={10} />
                              {order.organizationName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Ordem de Serviço */}
                    <td className="py-3.5 px-3 font-mono font-bold text-white">
                      {order.orderNumber}
                    </td>

                    {/* Serviço */}
                    <td className="py-3.5 px-3 font-medium text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Layers size={13} className="text-blue-400 shrink-0" />
                        <span>{order.serviceName}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          statusBadgeStyles[order.status] || 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {order.statusLabel}
                      </span>
                    </td>

                    {/* Valor da Ordem */}
                    <td className="py-3.5 px-3 text-right font-medium text-slate-300">
                      {order.price > 0
                        ? order.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : '—'}
                    </td>

                    {/* Comissão Kryon */}
                    <td className="py-3.5 px-3 text-right">
                      <span
                        className={`font-black text-xs px-2.5 py-1 rounded-lg border ${
                          isCompleted
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                            : 'bg-white/[0.02] border-white/[0.05] text-slate-500'
                        }`}
                      >
                        {order.commission.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/[0.04] text-center space-y-2">
            <CheckCircle2 size={28} className="mx-auto text-blue-400/80" />
            <p className="text-xs font-bold text-slate-300">
              {searchTerm || filterStatus !== 'all' || filterCompany !== 'all'
                ? 'Nenhuma ordem encontrada com os filtros selecionados.'
                : `Nenhuma ordem de serviço registrada em ${selectedPeriodLabel.toLowerCase()}.`}
            </p>
            <p className="text-[11px] text-slate-500">
              Novas ordens criadas no aplicativo Lava Rápido aparecerão instantaneamente nesta tabela.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

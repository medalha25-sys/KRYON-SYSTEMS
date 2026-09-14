'use client'

import React, { useState } from 'react'
import {
  Building2,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Car,
  Tag
} from 'lucide-react'
import { CompanyEntityRow } from '../types'

const statusStyles: Record<string, string> = {
  'Ativo': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'Período de teste': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'Pendente': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Em atraso': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  'Acesso limitado': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  'Restrito': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
}

const accessStyles: Record<string, string> = {
  'Completo': 'text-emerald-400 font-bold',
  'Limitado': 'text-purple-400 font-semibold',
  'Bloqueado': 'text-rose-400 font-bold',
}

interface CompaniesTableProps {
  companies?: CompanyEntityRow[]
  isLoading?: boolean
}

export function CompaniesTable({
  companies = [],
  isLoading = false
}: CompaniesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'organizacao' | 'shop_operacional'>('all')

  const filtered = companies.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vinculoNome.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || c.entityType === filterType

    return matchesSearch && matchesType
  })

  return (
    <section className="p-5 sm:p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] shadow-xl shadow-black/40 space-y-4">
      {/* Header with Search and Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              Empresas e Estabelecimentos
            </h2>
            <p className="text-xs text-slate-400">
              Distinção transparente entre Organizações Centrais da Kryon e Estabelecimentos Operacionais.
            </p>
          </div>
        </div>

        {/* Filters and Counter */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({companies.length})
            </button>
            <button
              onClick={() => setFilterType('organizacao')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === 'organizacao' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Organizações ({companies.filter(c => c.entityType === 'organizacao').length})
            </button>
            <button
              onClick={() => setFilterType('shop_operacional')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === 'shop_operacional' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Estabelecimentos ({companies.filter(c => c.entityType === 'shop_operacional').length})
            </button>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar empresa ou vínculo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="space-y-2 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 w-full bg-white/5 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-3">Entidade / Nome</th>
                <th className="py-3 px-3">Tipo da Base</th>
                <th className="py-3 px-3">Vínculo Organizacional</th>
                <th className="py-3 px-3">Produto</th>
                <th className="py-3 px-3">Modelo Comercial</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Comissão Kryon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((c) => {
                const isOrg = c.entityType === 'organizacao'
                const isVinculoPendente = c.vinculoStatus === 'pendente'

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Empresa / Nome */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 ${
                            isOrg
                              ? 'bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-blue-500/30 text-blue-300'
                              : 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30 text-purple-300'
                          }`}
                        >
                          {isOrg ? <Building2 size={14} /> : <Car size={14} />}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-blue-300 transition-colors">
                            {c.name}
                          </p>
                          <p className="text-[10px] text-slate-500">Última atividade: {c.lastActivity}</p>
                        </div>
                      </div>
                    </td>

                    {/* Tipo da Base */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                          isOrg
                            ? 'bg-blue-500/10 border-blue-500/25 text-blue-300'
                            : 'bg-purple-500/10 border-purple-500/25 text-purple-300'
                        }`}
                      >
                        {c.entityTypeLabel}
                      </span>
                    </td>

                    {/* Vínculo Organizacional */}
                    <td className="py-3.5 px-3">
                      {isVinculoPendente ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] font-semibold">
                          <AlertCircle size={10} />
                          Vínculo pendente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <CheckCircle2 size={12} />
                          {c.vinculoNome}
                        </span>
                      )}
                    </td>

                    {/* Produto */}
                    <td className="py-3.5 px-3 font-medium text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Layers size={13} className="text-blue-400 shrink-0" />
                        <span className="truncate">{c.product}</span>
                      </span>
                    </td>

                    {/* Modelo Comercial */}
                    <td className="py-3.5 px-3 font-medium text-slate-400">
                      {c.model}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          statusStyles[c.status] || 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    {/* Comissão Kryon */}
                    <td className="py-3.5 px-3 text-right">
                      <span
                        className={`font-black text-xs ${
                          c.kryonCommission > 0 ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        {c.kryonCommission.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
              {searchTerm || filterType !== 'all'
                ? 'Nenhum registro encontrado com os filtros atuais.'
                : 'Nenhuma empresa ou estabelecimento cadastrado no momento.'}
            </p>
            <p className="text-[11px] text-slate-500">
              Novas organizações criadas na tabela central ou novos estabelecimentos operacionais aparecerão automaticamente nesta lista.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

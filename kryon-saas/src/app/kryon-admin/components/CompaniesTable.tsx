'use client'

import React from 'react'
import { Building2, Layers, Search, Filter, ShieldAlert, ArrowUpRight, MoreVertical } from 'lucide-react'
import { mockCompanies, CompanyRow } from '../mock-data'

const statusStyles: Record<CompanyRow['status'], string> = {
  'Ativo': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'Período de teste': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'Pendente': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Em atraso': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  'Acesso limitado': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  'Restrito': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
}

const accessStyles: Record<CompanyRow['access'], string> = {
  'Completo': 'text-emerald-400 font-bold',
  'Limitado': 'text-purple-400 font-semibold',
  'Bloqueado': 'text-rose-400 font-bold',
}

export function CompaniesTable() {
  return (
    <section className="p-5 sm:p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] shadow-xl shadow-black/40 space-y-4">
      {/* Header with Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white">Empresas e Inquilinos</h2>
            <p className="text-xs text-slate-400">Gestão operacional de status, faturamento e acessos.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar empresa..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 w-36 sm:w-48"
              readOnly
            />
          </div>
          <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1.5 rounded-xl">
            {mockCompanies.length} Empresas
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] text-slate-400 uppercase text-[10px] tracking-wider font-bold">
              <th className="py-3 px-3">Empresa</th>
              <th className="py-3 px-3">Produto</th>
              <th className="py-3 px-3">Modelo</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-center">Dias em Atraso</th>
              <th className="py-3 px-3">Acesso</th>
              <th className="py-3 px-3 text-right">Receita Gerada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {mockCompanies.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-white/[0.02] transition-colors group"
              >
                {/* Empresa */}
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center text-white font-black text-xs shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-blue-300 transition-colors">
                        {c.name}
                      </p>
                      <p className="text-[10px] text-slate-500">{c.lastActivity}</p>
                    </div>
                  </div>
                </td>

                {/* Produto */}
                <td className="py-3.5 px-3 font-medium text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Layers size={13} className="text-blue-400 shrink-0" />
                    <span className="truncate">{c.product}</span>
                  </span>
                </td>

                {/* Modelo */}
                <td className="py-3.5 px-3 font-medium text-slate-400">
                  {c.model}
                </td>

                {/* Status */}
                <td className="py-3.5 px-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                      statusStyles[c.status] || 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>

                {/* Dias em Atraso */}
                <td className="py-3.5 px-3 text-center font-bold">
                  {c.daysOverdue > 0 ? (
                    <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                      {c.daysOverdue} d
                    </span>
                  ) : (
                    <span className="text-slate-500">0</span>
                  )}
                </td>

                {/* Acesso */}
                <td className="py-3.5 px-3">
                  <span className={`text-[11px] ${accessStyles[c.access]}`}>
                    {c.access}
                  </span>
                </td>

                {/* Receita Gerada */}
                <td className="py-3.5 px-3 text-right font-black text-white">
                  {c.generatedRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>* Dados ilustrativos baseados no ecossistema demonstrativo.</span>
        <span className="text-blue-400 font-semibold cursor-pointer hover:underline">
          Ver todas as empresas →
        </span>
      </div>
    </section>
  )
}

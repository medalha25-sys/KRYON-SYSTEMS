'use client'

import React, { useState } from 'react'
import {
  Building2,
  Car,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Percent,
  Layers
} from 'lucide-react'
import { LavaRapidoCompanyItem } from '../types'
import { LavaRapidoCompanyDetailModal } from './LavaRapidoCompanyDetailModal'

interface LavaRapidoCompaniesSectionProps {
  companies?: LavaRapidoCompanyItem[]
  isLoading?: boolean
}

export function LavaRapidoCompaniesSection({
  companies = [],
  isLoading = false
}: LavaRapidoCompaniesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<LavaRapidoCompanyItem | null>(null)

  const filtered = companies.filter(c =>
    c.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.shopSlug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.organizationName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <section className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] animate-pulse space-y-4">
        <div className="h-6 w-48 bg-white/10 rounded"></div>
        <div className="h-32 w-full bg-white/5 rounded-2xl"></div>
      </section>
    )
  }

  return (
    <>
      <section className="p-5 sm:p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] shadow-xl shadow-black/40 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Estabelecimentos Parceiros do Lava Rápido
              </h2>
              <p className="text-xs text-slate-400">
                Clique em um estabelecimento para abrir a Visão 360° com histórico operacional e comissões.
              </p>
            </div>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por loja ou organização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Grid of Company Cards */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((company) => {
              const isVinculado = company.vinculoStatus === 'vinculado'

              return (
                <div
                  key={company.shopId}
                  onClick={() => setSelectedCompany(company)}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-blue-500/40 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 shrink-0 group-hover:scale-105 transition-transform">
                          <Car size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                            {company.shopName}
                          </h3>
                          <p className="text-[10px] text-slate-500">{company.shopSlug}</p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        company.status === 'Ativo'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                      }`}>
                        {company.status}
                      </span>
                    </div>

                    {/* Vínculo Organizacional */}
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.04] space-y-1 mb-3">
                      <span className="text-[9px] uppercase font-bold text-slate-400">Organização Central</span>
                      <p className="text-xs font-bold text-slate-200 truncate">{company.organizationName}</p>
                      <div className="pt-0.5">
                        {isVinculado ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                            <CheckCircle2 size={10} />
                            Vínculo ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                            <AlertCircle size={10} />
                            Vínculo pendente
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[10px] text-slate-400">Lavagens (Período)</span>
                        <p className="font-extrabold text-white text-sm mt-0.5">{company.completedOrdersInPeriod} concluidas</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[10px] text-emerald-400 font-semibold">Comissão Kryon</span>
                        <p className="font-extrabold text-emerald-300 text-sm mt-0.5">
                          {company.commissionInPeriod.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Link */}
                  <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs text-blue-400 font-semibold group-hover:text-blue-300 transition-colors">
                    <span>Ver Visão 360° da Loja</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/[0.04] text-center space-y-2">
            <CheckCircle2 size={28} className="mx-auto text-blue-400/80" />
            <p className="text-xs font-bold text-slate-300">
              Nenhum estabelecimento encontrado com o termo buscado.
            </p>
          </div>
        )}
      </section>

      {/* Modal Visão 360° */}
      <LavaRapidoCompanyDetailModal
        company={selectedCompany}
        onClose={() => setSelectedCompany(null)}
      />
    </>
  )
}

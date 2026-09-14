import React from 'react'
import Link from 'next/link'
import {
  Layers,
  Car,
  Calendar,
  PawPrint,
  Smartphone,
  Sparkles,
  ArrowRight,
  Percent,
  CheckCircle2,
  Tag,
  ShieldCheck,
  Building2,
  Scale
} from 'lucide-react'
import { KRYON_COMMERCIAL_MODELS } from '../config/commercialModels'

export const dynamic = 'force-dynamic'

const products = [
  {
    id: 'lava-rapido',
    name: 'Kryon Lava Rápido',
    description: 'Gestão operacional de lavagens, controle de comissões por uso, fila de boxes e fluxo de caixa.',
    icon: Car,
    iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/25',
    model: 'uso' as const,
    rule: 'R$ 2,00 por lavagem concluída',
    status: 'Operação Ativa',
    statusColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    href: '/kryon-admin/produtos/lava-rapido',
    featured: true
  },
  {
    id: 'agenda-facil',
    name: 'Kryon Agenda',
    description: 'Sistema completo de agendamentos online para clínicas, salões e profissionais liberais.',
    icon: Calendar,
    iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
    model: 'assinatura' as const,
    rule: 'Assinatura Mensal Recorrente',
    status: 'Disponível',
    statusColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    href: '/kryon-admin/produtos',
    featured: false
  },
  {
    id: 'gestao-pet',
    name: 'Kryon Pet',
    description: 'Software de gestão especializado para pet shops, clínicas veterinárias e estética animal.',
    icon: PawPrint,
    iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    model: 'assinatura' as const,
    rule: 'Assinatura Mensal Recorrente',
    status: 'Disponível',
    statusColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    href: '/kryon-admin/produtos',
    featured: false
  },
  {
    id: 'kryon-celular',
    name: 'Kryon Celular',
    description: 'PDV e ordens de serviço para assistências técnicas e lojas de smartphones e acessórios.',
    icon: Smartphone,
    iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    model: 'hibrido' as const,
    rule: 'Plano Híbrido (Assinatura + Transação)',
    status: 'Em Breve',
    statusColor: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    href: '/kryon-admin/produtos',
    featured: false
  },
  {
    id: 'concrete-erp',
    name: 'Kryon Concrete ERP',
    description: 'Sistema ERP para concreteiras, frotas de caminhões-betoneira, usinagem e logística pesada.',
    icon: Building2,
    iconColor: 'text-orange-400 bg-orange-500/10 border-orange-500/25',
    model: 'assinatura' as const,
    rule: 'Enterprise / Customizado',
    status: 'Disponível',
    statusColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    href: '/kryon-admin/produtos',
    featured: false
  },
  {
    id: 'kryon-law',
    name: 'Kryon Jurídico',
    description: 'Gestão de processos, prazos, intimações e financeiro para escritórios de advocacia.',
    icon: Scale,
    iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
    model: 'assinatura' as const,
    rule: 'Assinatura Mensal Recorrente',
    status: 'Disponível',
    statusColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    href: '/kryon-admin/produtos',
    featured: false
  }
]

export default function ProdutosAdminPage() {
  return (
    <div className="space-y-7 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] shadow-xl shadow-black/40">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Layers size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Catálogo de Produtos Kryon
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Gestão comercial das soluções SaaS, regras de comissão e modelos de faturamento.
            </p>
          </div>
        </div>
      </div>

      {/* Commercial Models Summary Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0C1222] to-[#0A0D18] border border-blue-500/20 space-y-4">
        <div className="flex items-center gap-2">
          <Percent size={18} className="text-blue-400" />
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
            Modelos Comerciais da Kryon Systems
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {Object.values(KRYON_COMMERCIAL_MODELS).map((m) => (
            <div key={m.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                {m.name}
              </span>
              <h3 className="text-xs font-bold text-white mt-1">{m.label}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">{m.description}</p>
              {m.unitRuleDescription && (
                <p className="text-[10px] text-emerald-400 font-semibold pt-1">
                  Regra: {m.unitRuleDescription}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Soluções e Módulos do Ecossistema
          </h2>
          <span className="text-xs text-slate-500">{products.length} produtos cadastrados</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const Icon = p.icon
            const modelConfig = KRYON_COMMERCIAL_MODELS[p.model]

            return (
              <div
                key={p.id}
                className={`p-6 rounded-3xl bg-[#0B0F19] border transition-all duration-300 hover:shadow-xl flex flex-col justify-between space-y-5 ${
                  p.featured
                    ? 'border-blue-500/40 bg-gradient-to-br from-[#0B0F19] via-[#0A1428] to-[#0B0F19] shadow-blue-950/30 ring-1 ring-blue-500/20'
                    : 'border-white/[0.08] hover:border-white/[0.2] shadow-black/40'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${p.iconColor}`}>
                      <Icon size={22} />
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${p.statusColor}`}>
                        {p.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {modelConfig.label}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {p.description}
                  </p>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Regra Comercial</span>
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      {p.rule}
                    </p>
                  </div>
                </div>

                {/* Action Link */}
                <div className="pt-3 border-t border-white/[0.05]">
                  <Link
                    href={p.href}
                    className={`inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      p.featured
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>{p.featured ? 'Abrir Central de Gestão' : 'Ver Detalhes do Produto'}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

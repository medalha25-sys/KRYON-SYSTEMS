import React from 'react'
import { KryonAdminHeader } from './components/KryonAdminHeader'
import { ExecutiveSummaryCards } from './components/ExecutiveSummaryCards'
import { FinancialHealthCard } from './components/FinancialHealthCard'
import { KryonIntelligenceCard } from './components/KryonIntelligenceCard'
import { ProductRevenueChart } from './components/ProductRevenueChart'
import { ProductActivityCards } from './components/ProductActivityCards'
import { ObligationsSection } from './components/ObligationsSection'
import { CompaniesTable } from './components/CompaniesTable'
import { GrowthChart } from './components/GrowthChart'
import { getKryonAdminOverview } from './data/getKryonAdminOverview'
import { AlertCircle } from 'lucide-react'

// Forçar renderização dinâmica para sempre buscar os dados mais recentes do Supabase
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function KryonAdminOverviewPage() {
  const data = await getKryonAdminOverview()

  return (
    <div className="space-y-7 pb-12 animate-in fade-in duration-500">
      {/* Topo / Cabeçalho com Seletor de Período */}
      <KryonAdminHeader
        title="Visão Geral"
        subtitle="Acompanhe a saúde, o crescimento e os resultados da Kryon Systems."
      />

      {/* Banner de Diagnóstico / Status das Consultas (se houver advertências) */}
      {data.errors && data.errors.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-amber-400" />
            <span>
              <strong>Aviso de Consulta:</strong> {data.errors.join(' | ')}
            </span>
          </div>
          <span className="text-[10px] text-amber-400/80 uppercase font-bold shrink-0">
            Modo Resiliente
          </span>
        </div>
      )}

      {/* Área 1 — Resumo Executivo (Dados Reais) */}
      <ExecutiveSummaryCards metrics={data.summaryMetrics} />

      {/* Área 6 — Kryon Intelligence (Destaque Estratégico com Insights Reais) */}
      <KryonIntelligenceCard insights={data.intelligenceInsights} />

      {/* Área 2 — Saúde Financeira (Dados Reais) */}
      <FinancialHealthCard data={data.financialHealth} />

      {/* Área 3 — Receita por Produto (Dados Reais) */}
      <ProductRevenueChart items={data.productRevenue} />

      {/* Área 4 — Atividade dos Produtos (Lava Rápido: lavagens e comissão real de R$ 2,00) */}
      <ProductActivityCards activities={data.productActivities} />

      {/* Área 8 — Crescimento & Tração (Dados Reais) */}
      <GrowthChart data={data.growthData} />

      {/* Área 5 — Contas e Obrigações (Dados Reais) */}
      <ObligationsSection obligations={data.obligations} />

      {/* Área 7 — Clientes / Empresas (Dados Reais) */}
      <CompaniesTable companies={data.companies} />
    </div>
  )
}

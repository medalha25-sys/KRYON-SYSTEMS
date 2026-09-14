import React from 'react'
import { KryonAdminHeader } from './components/KryonAdminHeader'
import { ExecutiveSummaryCards } from './components/ExecutiveSummaryCards'
import { FinancialHealthCard } from './components/FinancialHealthCard'
import { KryonIntelligenceCard } from './components/KryonIntelligenceCard'
import { ProductRevenueChart } from './components/ProductRevenueChart'
import { ProductActivityCards } from './components/ProductActivityCards'
import { ObligationsSection } from './components/ObligationsSection'
import { CommissionHistorySection } from './components/CommissionHistorySection'
import { CompaniesTable } from './components/CompaniesTable'
import { GrowthChart } from './components/GrowthChart'
import { getKryonAdminOverview } from './data/getKryonAdminOverview'
import { AlertCircle } from 'lucide-react'

// Forçar renderização dinâmica para garantir dados sempre atualizados
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  searchParams?: Promise<{ periodo?: string }> | { periodo?: string }
}

export default async function KryonAdminOverviewPage(props: PageProps) {
  // Trata searchParams tanto se for Promise (Next 15) quanto objeto direto (Next 14)
  const searchParams = props.searchParams instanceof Promise
    ? await props.searchParams
    : props.searchParams

  const rawPeriod = searchParams?.periodo
  const data = await getKryonAdminOverview(rawPeriod)

  return (
    <div className="space-y-7 pb-12 animate-in fade-in duration-500">
      {/* Topo / Cabeçalho com Seletor de Período Reativo */}
      <KryonAdminHeader
        title="Visão Geral"
        subtitle="Acompanhe a saúde, o crescimento e os resultados operacionais da Kryon Systems."
        currentPeriod={data.selectedPeriod}
      />

      {/* Banner de Diagnóstico e Avisos de Consulta (se houver advertências) */}
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

      {/* Área 1 — Resumo Executivo (Dados Reais Filtrados por Período) */}
      <ExecutiveSummaryCards
        metrics={data.summaryMetrics}
        selectedPeriodLabel={data.selectedPeriodLabel}
      />

      {/* Área 6 — Kryon Intelligence (Insights 100% Factuais Derivados dos Dados Reais) */}
      <KryonIntelligenceCard insights={data.intelligenceInsights} />

      {/* Área 2 — Saúde Financeira (Dados Reais) */}
      <FinancialHealthCard data={data.financialHealth} />

      {/* Área 3 — Receita por Produto (Dados Reais do Período) */}
      <ProductRevenueChart items={data.productRevenue} />

      {/* Área 4 — Atividade dos Produtos (Lava Rápido: lavagens reais e comissão de R$ 2,00) */}
      <ProductActivityCards activities={data.productActivities} />

      {/* Área 8 — Crescimento & Tração (Histórico Real) */}
      <GrowthChart data={data.growthData} />

      {/* Área 5 — Contas e Obrigações (Dados Reais) */}
      <ObligationsSection obligations={data.obligations} />

      {/* Nova Área — Histórico e Detalhamento das Comissões Kryon (Lava Rápido) */}
      <CommissionHistorySection
        commissionHistory={data.commissionHistory}
        selectedPeriodLabel={data.selectedPeriodLabel}
        totalCommission={data.rawCounts.kryonCommissionPeriod}
        completedCount={data.rawCounts.completedOrdersInPeriod}
      />

      {/* Área 7 — Empresas e Estabelecimentos (Distinção Real entre Organização e Shop) */}
      <CompaniesTable companies={data.companies} />
    </div>
  )
}

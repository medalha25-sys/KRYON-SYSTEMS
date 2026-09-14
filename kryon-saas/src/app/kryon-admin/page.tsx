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

export default function KryonAdminOverviewPage() {
  return (
    <div className="space-y-7 pb-12 animate-in fade-in duration-500">
      {/* Topo / Cabeçalho com Seletor de Período */}
      <KryonAdminHeader
        title="Visão Geral"
        subtitle="Acompanhe a saúde, o crescimento e os resultados da Kryon Systems."
      />

      {/* Área 1 — Resumo Executivo */}
      <ExecutiveSummaryCards />

      {/* Área 6 — Kryon Intelligence (Destaque Estratégico) */}
      <KryonIntelligenceCard />

      {/* Área 2 — Saúde Financeira */}
      <FinancialHealthCard />

      {/* Área 3 — Receita por Produto */}
      <ProductRevenueChart />

      {/* Área 4 — Atividade dos Produtos */}
      <ProductActivityCards />

      {/* Área 8 — Crescimento & Tração */}
      <GrowthChart />

      {/* Área 5 — Contas e Obrigações */}
      <ObligationsSection />

      {/* Área 7 — Clientes / Empresas */}
      <CompaniesTable />
    </div>
  )
}

import React from 'react'
import { getLavaRapidoAdminData } from './data/getLavaRapidoAdminData'
import { LavaRapidoHeader } from './components/LavaRapidoHeader'
import { LavaRapidoExecutiveCards } from './components/LavaRapidoExecutiveCards'
import { LavaRapidoCommissionStatusCard } from './components/LavaRapidoCommissionStatusCard'
import { LavaRapidoIntelligenceSection } from './components/LavaRapidoIntelligenceSection'
import { LavaRapidoCompaniesSection } from './components/LavaRapidoCompaniesSection'
import { LavaRapidoOrdersTable } from './components/LavaRapidoOrdersTable'
import { LavaRapidoGrowthChart } from './components/LavaRapidoGrowthChart'
import { AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  searchParams?: Promise<{ periodo?: string }> | { periodo?: string }
}

export default async function LavaRapidoAdminPage(props: PageProps) {
  const searchParams = props.searchParams instanceof Promise
    ? await props.searchParams
    : props.searchParams

  const rawPeriod = searchParams?.periodo
  const data = await getLavaRapidoAdminData(rawPeriod)

  return (
    <div className="space-y-7 pb-12 animate-in fade-in duration-500">
      {/* Topo / Cabeçalho com Breadcrumb e Filtro de Período Reativo */}
      <LavaRapidoHeader currentPeriod={data.selectedPeriod} />

      {/* Banner de Diagnóstico e Avisos (se houver) */}
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

      {/* 1. Indicadores Executivos do Lava Rápido */}
      <LavaRapidoExecutiveCards
        stats={data.stats}
        selectedPeriodLabel={data.selectedPeriodLabel}
      />

      {/* 2. Controle Comercial de Comissões: Gerada x Recebida x Em Aberto */}
      <LavaRapidoCommissionStatusCard
        stats={data.stats}
        selectedPeriodLabel={data.selectedPeriodLabel}
      />

      {/* 3. Kryon Intelligence — Insights Factuais do Lava Rápido */}
      <LavaRapidoIntelligenceSection insights={data.insights} />

      {/* 4. Evolução Temporal */}
      <LavaRapidoGrowthChart data={data.growth} />

      {/* 5. Estabelecimentos Parceiros (Visão 360° no clique) */}
      <LavaRapidoCompaniesSection companies={data.companies} />

      {/* 6. Histórico Completo de Ordens de Serviço */}
      <LavaRapidoOrdersTable
        orders={data.orders}
        selectedPeriodLabel={data.selectedPeriodLabel}
      />
    </div>
  )
}

import { createClient } from '@/utils/supabase/server'
import {
  LavaRapidoPeriodFilter,
  LavaRapidoDashboardData,
  LavaRapidoOrder,
  LavaRapidoCompanyItem,
  LavaRapidoStats,
  LavaRapidoIntelligenceInsight,
  LavaRapidoGrowthPoint
} from '../types'
import { KRYON_LAVA_RAPIDO_COMMISSION_RULE } from '@/app/kryon-admin/config/commercialModels'

function getPeriodDateRange(period: LavaRapidoPeriodFilter): { startDate: Date; endDate: Date; label: string } {
  const now = new Date()
  const endDate = new Date(now)
  endDate.setHours(23, 59, 59, 999)
  let startDate = new Date(now)
  let label = 'Este mês'

  switch (period) {
    case 'hoje':
      startDate.setHours(0, 0, 0, 0)
      label = 'Hoje'
      break
    case '7dias':
      startDate.setDate(now.getDate() - 7)
      startDate.setHours(0, 0, 0, 0)
      label = 'Últimos 7 dias'
      break
    case 'este-mes':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      label = 'Este mês'
      break
    case '30dias':
      startDate.setDate(now.getDate() - 30)
      startDate.setHours(0, 0, 0, 0)
      label = 'Últimos 30 dias'
      break
    case 'este-ano':
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
      label = 'Este ano'
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      label = 'Este mês'
  }

  return { startDate, endDate, label }
}

export async function getLavaRapidoAdminData(
  periodParam?: string | null
): Promise<LavaRapidoDashboardData> {
  const validPeriods: LavaRapidoPeriodFilter[] = ['hoje', '7dias', 'este-mes', '30dias', 'este-ano']
  const selectedPeriod: LavaRapidoPeriodFilter =
    periodParam && validPeriods.includes(periodParam as LavaRapidoPeriodFilter)
      ? (periodParam as LavaRapidoPeriodFilter)
      : 'este-mes'

  const { startDate, endDate, label: selectedPeriodLabel } = getPeriodDateRange(selectedPeriod)
  const errors: string[] = []

  let shops: any[] = []
  let organizations: any[] = []
  let lavaRapidoOrders: any[] = []

  try {
    const supabase = await createClient()

    const [shopsRes, orgsRes, ordersRes] = await Promise.all([
      supabase
        .from('shops')
        .select('id, name, slug, store_type, plan, trial_ate, created_at, organization_id')
        .order('created_at', { ascending: false }),
      
      supabase
        .from('organizations')
        .select('id, name, legal_name, cnpj_cpf, status, created_at')
        .order('created_at', { ascending: false }),

      supabase
        .from('lava_rapido_orders')
        .select('id, tenant_id, status, total_price, final_price, created_at, completed_at')
        .order('created_at', { ascending: false })
    ])

    if (shopsRes.error) {
      console.warn('Lava Rápido Admin: Aviso em shops:', shopsRes.error.message)
      errors.push(`Shops: ${shopsRes.error.message}`)
    } else if (shopsRes.data) {
      shops = shopsRes.data
    }

    if (orgsRes.error) {
      console.warn('Lava Rápido Admin: Aviso em organizations:', orgsRes.error.message)
      errors.push(`Organizações: ${orgsRes.error.message}`)
    } else if (orgsRes.data) {
      organizations = orgsRes.data
    }

    if (ordersRes.error) {
      console.warn('Lava Rápido Admin: Aviso em lava_rapido_orders:', ordersRes.error.message)
      errors.push(`Ordens: ${ordersRes.error.message}`)
    } else if (ordersRes.data) {
      lavaRapidoOrders = ordersRes.data
    }
  } catch (err: any) {
    console.error('Lava Rápido Admin: Erro na conexão:', err)
    errors.push(`Conexão: ${err.message || 'Falha ao consultar banco'}`)
  }

  // Filtrar apenas estabelecimentos compatíveis com Lava Rápido (ou todos se não tipado)
  const lavaShops = shops.filter(s => s.store_type === 'lava_rapido' || !s.store_type || s.store_type === 'agenda_facil_ai')

  // Mapeamento de Status
  const statusLabelMap: Record<string, string> = {
    completed: 'Concluída',
    in_progress: 'Em lavagem',
    pending: 'Pendente / Fila',
    canceled: 'Cancelada',
    delivered: 'Entregue'
  }

  // 1. Filtrar Ordens por Período (baseando-se em completed_at com fallback para created_at)
  const ordersInPeriodRaw = lavaRapidoOrders.filter(order => {
    const dateToEvaluate = new Date(order.completed_at || order.created_at)
    return dateToEvaluate >= startDate && dateToEvaluate <= endDate
  })

  // 2. Mapeamento Estruturado de Ordens
  const orders: LavaRapidoOrder[] = ordersInPeriodRaw.map((order, idx) => {
    const isCompleted = order.status === 'completed'
    const commission = KRYON_LAVA_RAPIDO_COMMISSION_RULE.calculate(order.status)
    const effectiveDate = new Date(order.completed_at || order.created_at)

    const shop = shops.find(s => s.id === order.tenant_id)
    const shopSlug = shop?.slug ? shop.slug.replace(/-/g, ' ').toUpperCase() : `Estabelecimento #${order.tenant_id ? order.tenant_id.slice(0, 8) : idx + 1}`
    const shopName = shop?.name || shopSlug

    const linkedOrg = shop?.organization_id ? organizations.find(o => o.id === shop.organization_id) : null
    const organizationName = linkedOrg ? (linkedOrg.name || linkedOrg.legal_name || 'Organização Kryon') : 'Vínculo pendente'
    const vinculoStatus = linkedOrg ? 'vinculado' : 'pendente'

    const price = Number(order.final_price || order.total_price) || 0.00

    return {
      id: order.id || `ord-${idx}`,
      orderNumber: order.id ? `OS-${order.id.slice(0, 8).toUpperCase()}` : `OS-#${idx + 1}`,
      tenantId: order.tenant_id,
      shopName,
      shopSlug,
      organizationName,
      vinculoStatus,
      serviceName: 'Lavagem Geral / Serviço Padrão',
      vehiclePlate: 'Veículo em Atendimento',
      customerName: 'Cliente Operacional',
      status: order.status || 'pending',
      statusLabel: statusLabelMap[order.status] || order.status || 'Pendente',
      price,
      commission,
      completedAt: order.completed_at,
      createdAt: order.created_at,
      date: isNaN(effectiveDate.getTime()) ? 'Data não informada' : effectiveDate.toLocaleDateString('pt-BR'),
      time: isNaN(effectiveDate.getTime()) ? '--:--' : effectiveDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  })

  // 3. Contabilização Estrita de Métricas
  const totalOrdersInPeriod = orders.length
  const completedOrdersInPeriod = orders.filter(o => o.status === 'completed').length
  const inProgressOrdersInPeriod = orders.filter(o => o.status === 'in_progress').length
  const pendingOrdersInPeriod = orders.filter(o => o.status === 'pending').length
  const canceledOrdersInPeriod = orders.filter(o => o.status === 'canceled').length

  const totalGmvInPeriod = orders
    .filter(o => o.status === 'completed')
    .reduce((acc, o) => acc + o.price, 0.00)

  const kryonCommissionGenerated = completedOrdersInPeriod * 2.00

  const lifetimeCompletedOrders = lavaRapidoOrders.filter(o => o.status === 'completed').length
  const lifetimeCommission = lifetimeCompletedOrders * 2.00

  const stats: LavaRapidoStats = {
    totalCompanies: lavaShops.length,
    totalOrdersInPeriod,
    completedOrdersInPeriod,
    inProgressOrdersInPeriod,
    pendingOrdersInPeriod,
    canceledOrdersInPeriod,
    totalGmvInPeriod,
    kryonCommissionGenerated,
    kryonCommissionReceivedLabel: 'Não informado (módulo de conciliação bancária não implementado)',
    kryonCommissionPendingSettlementLabel: 'Não disponível até existir controle de liquidação no banco',
    lifetimeCompletedOrders,
    lifetimeCommission
  }

  // 4. Mapeamento Detalhado por Empresa / Estabelecimento
  const companies: LavaRapidoCompanyItem[] = lavaShops.map((shop, idx) => {
    const shopOrdersAll = lavaRapidoOrders.filter(o => o.tenant_id === shop.id)
    const shopCompletedAll = shopOrdersAll.filter(o => o.status === 'completed')

    const shopOrdersInPeriod = orders.filter(o => o.tenantId === shop.id)
    const shopCompletedInPeriod = shopOrdersInPeriod.filter(o => o.status === 'completed')
    const shopInProgressInPeriod = shopOrdersInPeriod.filter(o => o.status === 'in_progress')
    const shopPendingInPeriod = shopOrdersInPeriod.filter(o => o.status === 'pending')
    const shopCanceledInPeriod = shopOrdersInPeriod.filter(o => o.status === 'canceled')

    const totalRevenueInPeriod = shopCompletedInPeriod.reduce((acc, o) => acc + o.price, 0.00)
    const commissionInPeriod = shopCompletedInPeriod.length * 2.00

    const lifetimeCompleted = shopCompletedAll.length
    const lifetimeComm = lifetimeCompleted * 2.00

    const linkedOrg = shop.organization_id ? organizations.find(o => o.id === shop.organization_id) : null
    const organizationName = linkedOrg ? (linkedOrg.name || linkedOrg.legal_name || 'Organização Kryon') : 'Vínculo pendente'
    const vinculoStatus = linkedOrg ? 'vinculado' : 'pendente'

    const shopName = shop.name || (shop.slug ? shop.slug.replace(/-/g, ' ').toUpperCase() : `Lava Rápido #${idx + 1}`)
    const shopSlug = shop.slug ? shop.slug.replace(/-/g, ' ').toUpperCase() : `SHOP-${shop.id?.slice(0, 8) || idx + 1}`

    const statusDisplay: LavaRapidoCompanyItem['status'] = shop.plan === 'bloqueado'
      ? 'Restrito'
      : (shop.plan === 'trial' ? 'Período de teste' : 'Ativo')

    return {
      shopId: shop.id || `shop-${idx}`,
      shopName,
      shopSlug,
      organizationId: shop.organization_id || null,
      organizationName,
      vinculoStatus,
      storeType: 'Kryon Lava Rápido',
      commercialModel: 'Por Uso',
      commercialRule: 'R$ 2,00 por lavagem concluída',
      plan: shop.plan || 'trial',
      status: statusDisplay,
      createdAt: shop.created_at ? new Date(shop.created_at).toLocaleDateString('pt-BR') : 'Sem registro',
      trialAte: shop.trial_ate ? new Date(shop.trial_ate).toLocaleDateString('pt-BR') : null,
      totalOrdersInPeriod: shopOrdersInPeriod.length,
      completedOrdersInPeriod: shopCompletedInPeriod.length,
      inProgressOrdersInPeriod: shopInProgressInPeriod.length,
      pendingOrdersInPeriod: shopPendingInPeriod.length,
      canceledOrdersInPeriod: shopCanceledInPeriod.length,
      totalRevenueInPeriod,
      commissionInPeriod,
      lifetimeCompletedOrders: lifetimeCompleted,
      lifetimeCommission: lifetimeComm,
      recentOrders: shopOrdersInPeriod.slice(0, 10)
    }
  })

  // 5. Kryon Intelligence (Insights 100% Factuais Derivados dos Dados Reais)
  const insights: LavaRapidoIntelligenceInsight[] = []

  if (completedOrdersInPeriod > 0) {
    insights.push({
      id: 'lr-1',
      type: 'highlight',
      tag: 'Volume de Lavagens',
      title: `${completedOrdersInPeriod} lavagens concluídas em ${selectedPeriodLabel.toLowerCase()}.`,
      description: `Geraram ${kryonCommissionGenerated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} em comissões Kryon (R$ 2,00 por ordem com status 'completed').`,
      actionText: 'Ver Ordens Concluídas'
    })
  } else {
    insights.push({
      id: 'lr-1',
      type: 'info',
      tag: 'Volume Operacional',
      title: `Nenhuma lavagem concluída registrada em ${selectedPeriodLabel.toLowerCase()}.`,
      description: `A base operacional não possui ordens com status 'completed' no intervalo selecionado. Ordens em andamento ou pendentes não geram comissão até a conclusão.`,
      actionText: 'Acompanhar Fila'
    })
  }

  if (totalGmvInPeriod > 0) {
    insights.push({
      id: 'lr-2',
      type: 'positive',
      tag: 'Receita Movimentada',
      title: `Receita bruta de ${totalGmvInPeriod.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} movimentada pelas lojas.`,
      description: `Valor total transacionado pelos estabelecimentos parceiros nas ordens finalizadas com sucesso.`,
      actionText: 'Auditar Faturamento'
    })
  } else {
    insights.push({
      id: 'lr-2',
      type: 'info',
      tag: 'Receita Operacional',
      title: `Sem faturamento bruto registrado no período selecionado.`,
      description: `Os estabelecimentos parceiros ainda não registraram ordens finalizadas neste período.`,
      actionText: 'Ver Histórico'
    })
  }

  insights.push({
    id: 'lr-3',
    type: 'recommendation',
    tag: 'Auditoria Financeira',
    title: 'Não existem dados de liquidação da comissão.',
    description: 'A comissão gerada reflete o cálculo das lavagens concluídas. O status de liquidação bancária permanecerá como "Não disponível" até a implementação de módulo financeiro com baixa.',
    actionText: 'Ver Política de Cobrança'
  })

  // 6. Evolução Temporal (Growth Data)
  const months = ['Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set']
  const growth: LavaRapidoGrowthPoint[] = months.map((month, idx) => {
    const isCurrent = idx === months.length - 1
    return {
      label: month,
      ordens: isCurrent ? totalOrdersInPeriod : 0,
      concluidas: isCurrent ? completedOrdersInPeriod : 0,
      receita: isCurrent ? totalGmvInPeriod : 0,
      comissao: isCurrent ? kryonCommissionGenerated : 0
    }
  })

  return {
    isRealData: true,
    selectedPeriod,
    selectedPeriodLabel,
    stats,
    companies,
    orders,
    insights,
    growth,
    errors
  }
}

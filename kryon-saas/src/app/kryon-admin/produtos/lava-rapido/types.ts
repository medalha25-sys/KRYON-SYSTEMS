/**
 * ==============================================================================
 * KRYON ADMIN — TIPAGEM EXECUTIVA DO MÓDULO KRYON LAVA RÁPIDO
 * ETAPA 5: ESTRUTURA DE GESTÃO COMERCIAL E CONTROLE REAL
 * ==============================================================================
 */

export type LavaRapidoPeriodFilter = 'hoje' | '7dias' | 'este-mes' | '30dias' | 'este-ano'

export interface LavaRapidoStats {
  totalCompanies: number
  totalOrdersInPeriod: number
  completedOrdersInPeriod: number
  inProgressOrdersInPeriod: number
  pendingOrdersInPeriod: number
  canceledOrdersInPeriod: number
  totalGmvInPeriod: number
  kryonCommissionGenerated: number
  kryonCommissionReceivedLabel: string
  kryonCommissionPendingSettlementLabel: string
  lifetimeCompletedOrders: number
  lifetimeCommission: number
}

export interface LavaRapidoOrder {
  id: string
  orderNumber: string
  tenantId: string
  shopName: string
  shopSlug: string
  organizationName: string
  vinculoStatus: 'vinculado' | 'pendente'
  serviceName: string
  vehiclePlate: string
  customerName: string
  status: 'completed' | 'in_progress' | 'pending' | 'canceled' | 'delivered'
  statusLabel: string
  price: number
  commission: number
  completedAt: string | null
  createdAt: string
  date: string
  time: string
}

export interface LavaRapidoCompanyItem {
  shopId: string
  shopName: string
  shopSlug: string
  organizationId: string | null
  organizationName: string
  vinculoStatus: 'vinculado' | 'pendente'
  storeType: string
  commercialModel: 'Por Uso'
  commercialRule: string
  plan: string
  status: 'Ativo' | 'Período de teste' | 'Restrito'
  createdAt: string
  trialAte: string | null
  totalOrdersInPeriod: number
  completedOrdersInPeriod: number
  inProgressOrdersInPeriod: number
  pendingOrdersInPeriod: number
  canceledOrdersInPeriod: number
  totalRevenueInPeriod: number
  commissionInPeriod: number
  lifetimeCompletedOrders: number
  lifetimeCommission: number
  recentOrders: LavaRapidoOrder[]
}

export interface LavaRapidoIntelligenceInsight {
  id: string
  type: 'positive' | 'recommendation' | 'highlight' | 'info'
  tag: string
  title: string
  description: string
  actionText: string
}

export interface LavaRapidoGrowthPoint {
  label: string
  ordens: number
  concluidas: number
  receita: number
  comissao: number
}

export interface LavaRapidoDashboardData {
  isRealData: boolean
  selectedPeriod: LavaRapidoPeriodFilter
  selectedPeriodLabel: string
  stats: LavaRapidoStats
  companies: LavaRapidoCompanyItem[]
  orders: LavaRapidoOrder[]
  insights: LavaRapidoIntelligenceInsight[]
  growth: LavaRapidoGrowthPoint[]
  errors: string[]
}

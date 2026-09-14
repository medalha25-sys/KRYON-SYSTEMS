/**
 * ==============================================================================
 * KRYON ADMIN — TIPAGEM ESTRITA DA CAMADA DE DADOS REAIS
 * ETAPA 2: ROBUSTEZ E CONFIABILIDADE DOS DADOS
 * ==============================================================================
 */

export type PeriodFilter = 'hoje' | '7dias' | 'este-mes' | '30dias' | 'este-ano'

export interface ExecutiveMetric {
  id: string
  title: string
  value: string
  subtext?: string
  change?: string
  isPositive?: boolean
  iconName: string
  category: 'finance' | 'operations'
  temporalScope?: 'periodo' | 'acumulado'
}

export interface FinancialHealthData {
  securityReserve: number
  reserveTarget: number
  reserveProgressPercentage: number
  expenseCoverageMonths: number
  investmentReserve: number
  operatingResult: number
  healthStatus: 'saudavel' | 'atencao' | 'critico'
  healthStatusLabel: string
  healthStatusDescription: string
}

export interface ProductRevenueItem {
  name: string
  slug: string
  revenue: number
  percentage: number
  color: string
}

export interface ProductActivityItem {
  productName: string
  badge: string
  metric1Label: string
  metric1Value: string
  metric2Label: string
  metric2Value: string
  trend: string
  iconColor: string
}

export interface ObligationItem {
  id: string
  description: string
  category: string
  dueDate: string
  amount: number
  type: 'payable' | 'receivable'
  status: 'pendente' | 'pago' | 'vence_hoje' | 'previsto'
}

export interface CompanyEntityRow {
  id: string
  name: string
  entityType: 'organizacao' | 'shop_operacional'
  entityTypeLabel: 'Organização Kryon' | 'Estabelecimento Operacional'
  vinculoStatus: 'vinculado' | 'pendente'
  vinculoNome: string
  product: string
  model: string
  status: 'Ativo' | 'Período de teste' | 'Pendente' | 'Em atraso' | 'Acesso limitado' | 'Restrito'
  daysOverdue: number
  access: 'Completo' | 'Limitado' | 'Bloqueado'
  generatedRevenue: number
  kryonCommission: number
  lastActivity: string
}

export interface CommissionHistoryRow {
  id: string
  orderNumber: string
  date: string
  time: string
  empresa: string
  vinculoStatus: 'vinculado' | 'pendente'
  shopSlug: string
  produto: string
  statusLavagem: 'completed' | 'in_progress' | 'pending' | 'canceled' | 'delivered'
  statusLabel: string
  valorTotalOrdem: number
  comissaoKryon: number
}

export interface GrowthDataPoint {
  month: string
  receita: number
  empresas: number
  comissoes: number
}

export interface IntelligenceInsight {
  id: string
  type: 'positive' | 'recommendation' | 'highlight'
  tag: string
  title: string
  description: string
  actionText: string
}

export interface KryonAdminOverviewData {
  isRealData: boolean
  selectedPeriod: PeriodFilter
  selectedPeriodLabel: string
  errors: string[]
  summaryMetrics: ExecutiveMetric[]
  financialHealth: FinancialHealthData
  productRevenue: ProductRevenueItem[]
  productActivities: ProductActivityItem[]
  obligations: {
    contasPagar: number
    contasReceber: number
    despesasPrevistas: number
    proximosVencimentos: ObligationItem[]
  }
  companies: CompanyEntityRow[]
  commissionHistory: CommissionHistoryRow[]
  growthData: GrowthDataPoint[]
  intelligenceInsights: IntelligenceInsight[]
  rawCounts: {
    organizationsCount: number
    activeOrganizationsCount: number
    trialOrganizationsCount: number
    shopsCount: number
    totalOrdersInPeriod: number
    completedOrdersInPeriod: number
    lifetimeCompletedOrders: number
    kryonCommissionPeriod: number
    kryonCommissionLifetime: number
    mrrTotal: number
    productsCount: number
  }
}

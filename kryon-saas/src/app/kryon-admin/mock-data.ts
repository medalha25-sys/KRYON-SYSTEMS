/**
 * ==============================================================================
 * KRYON ADMIN — DADOS DEMONSTRATIVOS (MOCK DATA)
 * ETAPA 1: ESTRUTURAÇÃO VISUAL DA CENTRAL DE CONTROLE
 * 
 * NOTA IMPORTANTE:
 * Estes dados são 100% demonstrativos e isolados nesta camada visual.
 * Nenhuma alteração é gravada ou consultada no Supabase nesta etapa.
 * ==============================================================================
 */

export interface ExecutiveMetric {
  id: string;
  title: string;
  value: string;
  subtext?: string;
  change?: string;
  isPositive?: boolean;
  iconName: string;
  category: 'finance' | 'operations';
}

export interface FinancialHealthData {
  securityReserve: number;
  reserveTarget: number;
  reserveProgressPercentage: number;
  expenseCoverageMonths: number;
  investmentReserve: number;
  operatingResult: number;
  healthStatus: 'saudavel' | 'atencao' | 'critico';
  healthStatusLabel: string;
  healthStatusDescription: string;
}

export interface ProductRevenueItem {
  name: string;
  slug: string;
  revenue: number;
  percentage: number;
  color: string;
}

export interface ProductActivityItem {
  productName: string;
  badge: string;
  metric1Label: string;
  metric1Value: string;
  metric2Label: string;
  metric2Value: string;
  trend: string;
  iconColor: string;
}

export interface ObligationItem {
  id: string;
  description: string;
  category: string;
  dueDate: string;
  amount: number;
  type: 'payable' | 'receivable';
  status: 'pendente' | 'pago' | 'vence_hoje' | 'previsto';
}

export interface CompanyRow {
  id: string;
  name: string;
  product: string;
  model: string;
  status: 'Ativo' | 'Período de teste' | 'Pendente' | 'Em atraso' | 'Acesso limitado' | 'Restrito';
  daysOverdue: number;
  access: 'Completo' | 'Limitado' | 'Bloqueado';
  generatedRevenue: number;
  lastActivity: string;
}

export interface GrowthDataPoint {
  month: string;
  receita: number;
  empresas: number;
  comissoes: number;
}

// 1. Resumo Executivo (8 Cards)
export const mockExecutiveSummary: ExecutiveMetric[] = [
  {
    id: 'receita-mes',
    title: 'Receita do mês',
    value: 'R$ 48.750,00',
    change: '+18.4% vs mês anterior',
    isPositive: true,
    iconName: 'DollarSign',
    category: 'finance'
  },
  {
    id: 'receita-recorrente',
    title: 'Receita recorrente',
    value: 'R$ 39.200,00',
    change: '+12.1% MRR',
    isPositive: true,
    iconName: 'Repeat',
    category: 'finance'
  },
  {
    id: 'comissoes',
    title: 'Comissões',
    value: 'R$ 7.450,00',
    change: 'Lava Rápido & Parcerias',
    isPositive: true,
    iconName: 'Percent',
    category: 'finance'
  },
  {
    id: 'despesas',
    title: 'Despesas',
    value: 'R$ 14.200,00',
    change: 'Infraestrutura + Operação',
    isPositive: false,
    iconName: 'TrendingDown',
    category: 'finance'
  },
  {
    id: 'resultado-operacional',
    title: 'Resultado operacional',
    value: 'R$ 34.550,00',
    change: 'Margem líquida de 70.8%',
    isPositive: true,
    iconName: 'TrendingUp',
    category: 'finance'
  },
  {
    id: 'empresas-ativas',
    title: 'Empresas ativas',
    value: '24',
    change: '+4 neste mês',
    isPositive: true,
    iconName: 'Building2',
    category: 'operations'
  },
  {
    id: 'produtos-ativos',
    title: 'Produtos ativos',
    value: '8',
    change: 'Ecossistema Kryon',
    isPositive: true,
    iconName: 'Layers',
    category: 'operations'
  },
  {
    id: 'clientes-teste',
    title: 'Clientes em período de teste',
    value: '12',
    change: 'Conversão prevista de 65%',
    isPositive: true,
    iconName: 'Sparkles',
    category: 'operations'
  }
];

// 2. Saúde Financeira
export const mockFinancialHealth: FinancialHealthData = {
  securityReserve: 85000,
  reserveTarget: 120000,
  reserveProgressPercentage: 70.8,
  expenseCoverageMonths: 6.0,
  investmentReserve: 42500,
  operatingResult: 34550,
  healthStatus: 'saudavel',
  healthStatusLabel: 'Empresa saudável',
  healthStatusDescription: 'A reserva cobre 6 meses de despesas fixas. Fluxo de caixa consistente e superavitário.'
};

// 3. Receita por Produto
export const mockProductRevenue: ProductRevenueItem[] = [
  { name: 'Kryon Lava Rápido', slug: 'lava-rapido', revenue: 14800, percentage: 30.3, color: '#3B82F6' },
  { name: 'Kryon Agenda', slug: 'agenda-facil', revenue: 11200, percentage: 23.0, color: '#8B5CF6' },
  { name: 'Kryon Pet', slug: 'gestao-pet', revenue: 8900, percentage: 18.2, color: '#10B981' },
  { name: 'Kryon Celular', slug: 'kryon-celular', revenue: 5400, percentage: 11.1, color: '#F59E0B' },
  { name: 'Kryon Fotos', slug: 'kryon-fotos', revenue: 4100, percentage: 8.4, color: '#EC4899' },
  { name: 'Kryon Utilidades', slug: 'kryon-utilidades', revenue: 2750, percentage: 5.6, color: '#06B6D4' },
  { name: 'Outros', slug: 'outros', revenue: 1600, percentage: 3.4, color: '#64748B' }
];

// 4. Atividade dos Produtos
export const mockProductActivities: ProductActivityItem[] = [
  {
    productName: 'Kryon Lava Rápido',
    badge: 'Destaque',
    metric1Label: 'Lavagens concluídas',
    metric1Value: '1.420',
    metric2Label: 'Comissão gerada',
    metric2Value: 'R$ 4.260,00',
    trend: '+32% vs mês anterior',
    iconColor: 'text-blue-400'
  },
  {
    productName: 'Kryon Agenda',
    badge: 'Escalando',
    metric1Label: 'Agendamentos',
    metric1Value: '3.890',
    metric2Label: 'Empresas ativas',
    metric2Value: '9',
    trend: '+15% novos agendamentos',
    iconColor: 'text-purple-400'
  },
  {
    productName: 'Kryon Pet',
    badge: 'Recorrente',
    metric1Label: 'Empresas ativas',
    metric1Value: '6',
    metric2Label: 'Receita',
    metric2Value: 'R$ 8.900,00',
    trend: '100% de adimplência',
    iconColor: 'text-emerald-400'
  },
  {
    productName: 'Kryon Celular',
    badge: 'Crescimento',
    metric1Label: 'Vendas registradas',
    metric1Value: '840 ordens',
    metric2Label: 'Empresas ativas',
    metric2Value: '5',
    trend: '+2 novos contratos',
    iconColor: 'text-amber-400'
  }
];

// 5. Contas e Obrigações
export const mockObligations = {
  contasPagar: 6800.00,
  contasReceber: 18400.00,
  despesasPrevistas: 14200.00,
  proximosVencimentos: [
    { id: '1', description: 'Servidor Dedicado Cloud (Infraestrutura)', dueDate: '15/09/2026', amount: 1450.00, type: 'payable', status: 'pendente' },
    { id: '2', description: 'Gateway de Pagamentos & APIs', dueDate: '18/09/2026', amount: 890.00, type: 'payable', status: 'pendente' },
    { id: '3', description: 'Repasse Comissões Parceiros', dueDate: '20/09/2026', amount: 2460.00, type: 'payable', status: 'previsto' },
    { id: '4', description: 'Assinaturas Mensais Lote A (10 Empresas)', dueDate: '16/09/2026', amount: 9800.00, type: 'receivable', status: 'pendente' },
    { id: '5', description: 'Taxas de Sucesso Lava Rápido', dueDate: '22/09/2026', amount: 4260.00, type: 'receivable', status: 'previsto' }
  ] as ObligationItem[]
};

// 6. Kryon Intelligence Insights
export const mockIntelligenceInsights = [
  {
    id: '1',
    type: 'positive',
    tag: 'Crescimento de Receita',
    title: 'A receita cresceu 28% neste mês.',
    description: 'Sua reserva de segurança ainda está abaixo da meta (70.8% atingida).',
    actionText: 'Analisar Distribuição de Caixa'
  },
  {
    id: '2',
    type: 'recommendation',
    tag: 'Recomendação Estratégica',
    title: 'Priorize a formação da reserva de segurança antes de aumentar o pró-labore.',
    description: 'Garantir 12 meses de cobertura elevará o índice de resiliência financeira para nível máximo.',
    actionText: 'Ver Simulação de Reserva'
  },
  {
    id: '3',
    type: 'highlight',
    tag: 'Produto em Destaque',
    title: 'Seu produto com maior crescimento no período foi Kryon Lava Rápido.',
    description: 'Volume de lavagens concluídas subiu 32%, gerando maior tração no modelo de comissão por conclusão.',
    actionText: 'Ver Métricas do Lava Rápido'
  }
];

// 7. Tabela Demonstrativa de Empresas / Clientes
export const mockCompanies: CompanyRow[] = [
  {
    id: 'emp-1',
    name: 'Brilho Mágico',
    product: 'Kryon Lava Rápido',
    model: 'Por conclusão',
    status: 'Ativo',
    daysOverdue: 0,
    access: 'Completo',
    generatedRevenue: 4260.00,
    lastActivity: 'Há 5 minutos'
  },
  {
    id: 'emp-2',
    name: 'Salinas Fotos & Studio Pro',
    product: 'Kryon Fotos',
    model: 'Mensalidade',
    status: 'Período de teste',
    daysOverdue: 0,
    access: 'Completo',
    generatedRevenue: 0.00,
    lastActivity: 'Há 22 minutos'
  },
  {
    id: 'emp-3',
    name: 'Pet & Cia Care Center',
    product: 'Kryon Pet',
    model: 'Mensalidade + Taxa',
    status: 'Ativo',
    daysOverdue: 0,
    access: 'Completo',
    generatedRevenue: 1890.00,
    lastActivity: 'Hoje às 09:40'
  },
  {
    id: 'emp-4',
    name: 'Mega Celular & Assistência',
    product: 'Kryon Celular',
    model: 'Mensalidade',
    status: 'Pendente',
    daysOverdue: 2,
    access: 'Acesso limitado',
    generatedRevenue: 980.00,
    lastActivity: 'Ontem às 18:15'
  },
  {
    id: 'emp-5',
    name: 'Bella Donna Estética Avançada',
    product: 'Kryon Agenda',
    model: 'Mensalidade',
    status: 'Em atraso',
    daysOverdue: 5,
    access: 'Restrito',
    generatedRevenue: 490.00,
    lastActivity: 'Há 3 dias'
  },
  {
    id: 'emp-6',
    name: 'Construtora Vale Concreto',
    product: 'Kryon Concreto ERP',
    model: 'Enterprise Anual',
    status: 'Ativo',
    daysOverdue: 0,
    access: 'Completo',
    generatedRevenue: 8500.00,
    lastActivity: 'Hoje às 10:12'
  }
];

// 8. Gráfico de Evolução / Crescimento
export const mockGrowthData: GrowthDataPoint[] = [
  { month: 'Abr', receita: 24500, empresas: 12, comissoes: 3200 },
  { month: 'Mai', receita: 28900, empresas: 15, comissoes: 4100 },
  { month: 'Jun', receita: 33400, empresas: 17, comissoes: 4900 },
  { month: 'Jul', receita: 37800, empresas: 20, comissoes: 5800 },
  { month: 'Ago', receita: 42100, empresas: 22, comissoes: 6500 },
  { month: 'Set', receita: 48750, empresas: 24, comissoes: 7450 }
];

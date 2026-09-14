/**
 * ==============================================================================
 * KRYON ADMIN — MODELOS COMERCIAIS OFICIAIS DO ECOSSISTEMA KRYON SYSTEMS
 * ETAPA 5: GESTÃO COMERCIAL E CONTROLE REAL
 * ==============================================================================
 */

export type KryonCommercialModel = 'assinatura' | 'uso' | 'hibrido' | 'trial'

export interface CommercialModelConfig {
  id: KryonCommercialModel
  name: string
  label: string
  description: string
  billingType: 'recorrente_mensal' | 'por_transacao' | 'misto' | 'gratuito_temporario'
  defaultUnitValue?: number
  unitRuleDescription?: string
}

export const KRYON_COMMERCIAL_MODELS: Record<KryonCommercialModel, CommercialModelConfig> = {
  assinatura: {
    id: 'assinatura',
    name: 'Por Assinatura',
    label: 'Assinatura Mensal',
    description: 'Cobrança mensal recorrente com valor fixo por plano (MRR).',
    billingType: 'recorrente_mensal'
  },
  uso: {
    id: 'uso',
    name: 'Por Uso',
    label: 'Por Uso / Transação',
    description: 'Cobrança transacional calculada por evento ou ordem concluída.',
    billingType: 'por_transacao',
    defaultUnitValue: 2.00,
    unitRuleDescription: 'R$ 2,00 por lavagem concluída (status: completed)'
  },
  hibrido: {
    id: 'hibrido',
    name: 'Híbrido',
    label: 'Plano Híbrido',
    description: 'Combinação de mensalidade base fixa com taxa variável por volume transacionado.',
    billingType: 'misto'
  },
  trial: {
    id: 'trial',
    name: 'Gratuito / Período de Teste',
    label: 'Período de Teste',
    description: 'Acesso completo ou assistido para experimentação por período determinado (Trial).',
    billingType: 'gratuito_temporario'
  }
}

/**
 * Regra de Negócio Server-Side para cálculo seguro de comissão
 * Blindagem: O navegador nunca define o valor unitário da comissão.
 */
export const KRYON_LAVA_RAPIDO_COMMISSION_RULE = {
  model: 'uso' as const,
  unitValueBRL: 2.00,
  eligibleStatus: 'completed',
  calculate(status: string): number {
    return status === 'completed' ? 2.00 : 0.00
  }
}

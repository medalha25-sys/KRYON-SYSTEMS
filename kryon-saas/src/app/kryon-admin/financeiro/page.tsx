import { KryonAdminPlaceholderPage } from '../components/KryonAdminPlaceholderPage'

export default function FinanceiroAdminPage() {
  return (
    <KryonAdminPlaceholderPage
      title="Financeiro"
      description="Demonstrativo de Resultados (DRE), despesas operacionais e margem líquida."
      moduleName="Painel Financeiro Executivo"
      expectedFeatures={[
        'DRE consolidado da Kryon Systems',
        'Classificação de despesas fixas e variáveis',
        'Cálculo de margem de lucro operacional',
        'Projeção de impostos e encargos'
      ]}
    />
  )
}

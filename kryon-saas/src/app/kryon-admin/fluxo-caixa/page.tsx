import { KryonAdminPlaceholderPage } from '../components/KryonAdminPlaceholderPage'

export default function FluxoCaixaAdminPage() {
  return (
    <KryonAdminPlaceholderPage
      title="Fluxo de Caixa"
      description="Entradas e saídas diárias, projeção de liquidez e reconciliação bancária."
      moduleName="Fluxo de Caixa Operacional"
      expectedFeatures={[
        'Visão diária, semanal e mensal de saldo',
        'Projeção de fluxo futuro a 30, 60 e 90 dias',
        'Reconciliação de recebíveis e taxas',
        'Alerta de descasamento de liquidez'
      ]}
    />
  )
}

import { KryonAdminPlaceholderPage } from '../components/KryonAdminPlaceholderPage'

export default function AssinaturasAdminPage() {
  return (
    <KryonAdminPlaceholderPage
      title="Assinaturas e Cobranças"
      description="Controle de planos, renovações, inadimplência e integração com meios de pagamento."
      moduleName="Gestão de Assinaturas & Cobranças"
      expectedFeatures={[
        'Status de assinaturas em tempo real',
        'Gestão de inadimplência e régua de cobrança',
        'Histórico de transações Mercado Pago',
        'Renovações manuais e concessão de trial'
      ]}
    />
  )
}

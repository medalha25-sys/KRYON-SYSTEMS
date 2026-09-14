import { KryonAdminPlaceholderPage } from '../components/KryonAdminPlaceholderPage'

export default function ReservasAdminPage() {
  return (
    <KryonAdminPlaceholderPage
      title="Reservas e Investimentos"
      description="Formação da reserva de emergência, cobertura de meses e fundos de expansão."
      moduleName="Gestão de Reservas & Investimentos"
      expectedFeatures={[
        'Acompanhamento da meta de reserva (12 meses)',
        'Fundo para P&D e desenvolvimento de IA',
        'Simulador de aportes e rendimentos',
        'Travas de segurança para pró-labore'
      ]}
    />
  )
}

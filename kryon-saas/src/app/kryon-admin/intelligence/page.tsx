import { KryonAdminPlaceholderPage } from '../components/KryonAdminPlaceholderPage'

export default function IntelligenceAdminPage() {
  return (
    <KryonAdminPlaceholderPage
      title="Kryon Intelligence"
      description="Motor analítico de IA que transforma dados brutos em decisões estratégicas."
      moduleName="🧠 Kryon Intelligence Pro"
      expectedFeatures={[
        'Análise preditiva de crescimento de receita',
        'Detecção automática de risco de cancelamento',
        'Recomendações automáticas de precificação',
        'Assistente estratégico com chat executivo'
      ]}
    />
  )
}

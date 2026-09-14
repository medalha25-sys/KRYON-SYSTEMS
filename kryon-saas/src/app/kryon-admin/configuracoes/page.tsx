import { KryonAdminPlaceholderPage } from '../components/KryonAdminPlaceholderPage'

export default function ConfiguracoesAdminPage() {
  return (
    <KryonAdminPlaceholderPage
      title="Configurações"
      description="Parâmetros globais da plataforma, credenciais do sistema e identidade visual."
      moduleName="Configurações da Central de Controle"
      expectedFeatures={[
        'Personalização de tema e branding Kryon',
        'Configurações de notificações por e-mail e WhatsApp',
        'Gerenciamento de credenciais de gateway',
        'Controle de versão da plataforma'
      ]}
    />
  )
}

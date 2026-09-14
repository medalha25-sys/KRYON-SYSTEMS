import { KryonAdminPlaceholderPage } from '../components/KryonAdminPlaceholderPage'

export default function EmpresasAdminPage() {
  return (
    <KryonAdminPlaceholderPage
      title="Empresas"
      description="Gestão de inquilinos, clientes cadastrados, limites de uso e acessos."
      moduleName="Gestão de Empresas & Inquilinos"
      expectedFeatures={[
        'Listagem completa de clientes/empresas',
        'Bloqueio e liberação de acessos em 1 clique',
        'Visualização de produtos vinculados',
        'Histórico de utilização e auditoria'
      ]}
    />
  )
}

import { KryonAdminPlaceholderPage } from '../components/KryonAdminPlaceholderPage'

export default function ProdutosAdminPage() {
  return (
    <KryonAdminPlaceholderPage
      title="Produtos"
      description="Gerenciamento do catálogo de soluções, módulos e preços do ecossistema Kryon."
      moduleName="Catálogo de Produtos Kryon"
      expectedFeatures={[
        'Cadastro e edição de produtos SaaS',
        'Definição de planos (Trial, Pro, Enterprise)',
        'Mapeamento de comissões e repasses',
        'Controle de features por produto'
      ]}
    />
  )
}

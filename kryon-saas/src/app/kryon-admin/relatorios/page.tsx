import { KryonAdminPlaceholderPage } from '../components/KryonAdminPlaceholderPage'

export default function RelatoriosAdminPage() {
  return (
    <KryonAdminPlaceholderPage
      title="Relatórios"
      description="Exportação de relatórios executivos, métricas de crescimento e balanços em PDF e Excel."
      moduleName="Central de Relatórios Executivos"
      expectedFeatures={[
        'Relatório mensal consolidado para a diretoria',
        'Exportação de métricas em PDF e XLSX',
        'Análise de churn e retenção de empresas',
        'Relatório de comissões por parceiro'
      ]}
    />
  )
}

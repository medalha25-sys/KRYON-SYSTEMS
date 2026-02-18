import { 
  getFinancialSummary, 
  getTransactions, 
  getCategories, 
  getProfessionals 
} from '@/app/products/agenda-facil/actions/financial'
import { FinancialSummary } from '@/components/financial/FinancialSummary'
import { TransactionList } from '@/components/financial/TransactionList'

export const dynamic = 'force-dynamic'

export default async function FinancialPage() {
  // Fetch data in parallel
  const [summary, transactionsRes, categories, professionals] = await Promise.all([
    getFinancialSummary(),
    getTransactions(),
    getCategories(),
    getProfessionals()
  ])

  // Handle errors or empty states gracefully
  const transactions = transactionsRes.error ? [] : transactionsRes.data || []

  return (
    <div className="space-y-6 container py-6 mx-auto">
      <div>
        <div className="flex justify-between items-start md:items-center mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
            <a 
                href="/products/agenda-facil/financeiro/comissoes" 
                className="text-sm px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
                <span className="material-symbols-outlined text-sm">payments</span>
                Relatório de Comissões
            </a>
        </div>
        <p className="text-muted-foreground">
          Gerencie receitas, despesas e comissões da sua clínica.
        </p>
      </div>

      {/* Summary Cards */}
      <FinancialSummary data={summary as any} />

      {/* Main Content Area */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Transações</h2>
        <TransactionList 
            initialTransactions={transactions} 
            categories={categories}
            professionals={professionals}
        />
      </div>
    </div>
  )
}

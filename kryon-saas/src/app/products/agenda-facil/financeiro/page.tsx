import { getFinancialSummary, getTransactions, getCategories, seedCategories } from './actions'
import FinancialPage from './FinancialPage'

export default async function Page({
    searchParams
}: {
    searchParams: Promise<{ start?: string, end?: string }>
}) {
    const { start, end } = await searchParams
    
    // Seed categories if needed (first run)
    await seedCategories()

    const summary = await getFinancialSummary(start, end)
    const transactions = await getTransactions(start, end)
    const categories = await getCategories()

    return (
        <FinancialPage 
            summary={summary}
            transactions={transactions}
            categories={categories}
        />
    )
}

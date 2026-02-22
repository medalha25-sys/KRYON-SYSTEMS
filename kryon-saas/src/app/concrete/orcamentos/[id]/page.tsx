import { getFullBudgetById } from '../../actions'
import BudgetDetailsClient from './BudgetDetailsClient'
import { notFound } from 'next/navigation'

interface Props {
    params: { id: string }
}

export default async function BudgetDetailsPage({ params }: Props) {
    const budget = await getFullBudgetById(params.id)

    if (!budget) {
        notFound()
    }

    return (
        <BudgetDetailsClient budget={budget} />
    )
}

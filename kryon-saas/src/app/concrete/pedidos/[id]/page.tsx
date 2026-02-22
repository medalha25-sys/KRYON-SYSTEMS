import { getFullOrderById } from '../../actions'
import OrderDetailsClient from './OrderDetailsClient'
import { notFound } from 'next/navigation'

interface Props {
    params: { id: string }
}

export default async function OrderDetailsPage({ params }: Props) {
    const order = await getFullOrderById(params.id)

    if (!order) {
        notFound()
    }

    return (
        <OrderDetailsClient order={order} />
    )
}

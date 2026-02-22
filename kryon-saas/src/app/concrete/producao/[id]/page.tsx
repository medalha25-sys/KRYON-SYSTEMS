import { createClient } from '@/utils/supabase/server'
import ProducaoDetailsClient from './ProducaoDetailsClient'
import { notFound } from 'next/navigation'

export default async function ProductionOrderPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    
    const { data: order, error } = await supabase
        .from('erp_production_orders')
        .select('*, erp_products(*), erp_orders(*)')
        .eq('id', params.id)
        .single()

    if (error || !order) {
        notFound()
    }

    return <ProducaoDetailsClient order={order} />
}

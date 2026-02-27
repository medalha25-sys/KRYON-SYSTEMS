import { createClient } from '@/utils/supabase/server'
import { getTrucks, getDrivers } from '../../actions'
import NewDeliveryClient from './NewDeliveryClient'
import { notFound } from 'next/navigation'

export default async function NewDeliveryPage({ searchParams }: { searchParams: { op_id: string } }) {
    if (!searchParams.op_id) notFound()

    const supabase = await createClient()
    
    // Fetch target production order
    const { data: prodOrder } = await supabase
        .from('erp_production_orders')
        .select('*, erp_products(*), erp_orders(*)')
        .eq('id', searchParams.op_id)
        .single()

    if (!prodOrder) notFound()

    const trucks = await getTrucks()
    const drivers = await getDrivers()

    return (
        <NewDeliveryClient 
            productionOrder={prodOrder} 
            trucks={trucks} 
            drivers={drivers} 
        />
    )
}

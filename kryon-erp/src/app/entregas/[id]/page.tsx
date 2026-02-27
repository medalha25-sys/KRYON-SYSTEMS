import { createClient } from '@/utils/supabase/server'
import DeliveryTrackingClient from './DeliveryTrackingClient'
import { notFound } from 'next/navigation'

export default async function DeliveryPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    
    const { data: delivery, error } = await supabase
        .from('erp_deliveries')
        .select('*, erp_trucks(*), erp_drivers(*)')
        .eq('id', params.id)
        .single()

    if (error || !delivery) {
        notFound()
    }

    return <DeliveryTrackingClient delivery={delivery} />
}

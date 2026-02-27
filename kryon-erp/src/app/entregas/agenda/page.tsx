import { createClient } from '@/utils/supabase/server'
import DeliveryCalendarClient from './DeliveryCalendarClient'

export const dynamic = 'force-dynamic'

export default async function DeliveryAgendaPage() {
    const supabase = await createClient()
    
    const { data: deliveries } = await supabase
        .from('erp_deliveries')
        .select('*, erp_trucks(*), erp_drivers(*)')
        .order('data_entrega', { ascending: true })

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <DeliveryCalendarClient initialDeliveries={deliveries || []} />
        </div>
    )
}

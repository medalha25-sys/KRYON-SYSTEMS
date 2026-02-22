import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import DriverDeliveryDetailClient from './DriverDeliveryDetailClient'

export const dynamic = 'force-dynamic'

export default async function DriverDeliveryDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // 1. Get delivery and verify ownership via motorista_id -> user_id
    const { data: delivery } = await supabase
        .from('erp_deliveries')
        .select(`
            *, 
            erp_trucks(placa, modelo), 
            erp_production_orders (
                *, 
                erp_products(name), 
                erp_orders(
                    cliente_id, 
                    erp_clients(name, address)
                )
            )
        `)
        .eq('id', params.id)
        .single()

    if (!delivery) notFound()

    // 2. Authorization Check (Only the assigned driver can see this)
    const { data: driver } = await supabase
        .from('erp_drivers')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!driver || delivery.motorista_id !== driver.id) {
         return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-8 bg-black">
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl">
                    <h2 className="text-xl font-black text-red-500 uppercase mb-4">Carga Indisponível</h2>
                    <p className="text-slate-400 text-sm">Você não tem permissão para gerenciar esta entrega específica.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8 font-sans">
            <DriverDeliveryDetailClient delivery={delivery} />
        </div>
    )
}

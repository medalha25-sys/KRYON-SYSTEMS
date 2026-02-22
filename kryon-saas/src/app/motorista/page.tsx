import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getDriverDeliveries } from '../concrete/actions'
import DriverDashboardClient from './DriverDashboardClient'

export const dynamic = 'force-dynamic'

export default async function DriverPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // 1. Check if the user is a driver
    const { data: driver } = await supabase
        .from('erp_drivers')
        .select('*, profiles(full_name)')
        .eq('user_id', user.id)
        .single()

    if (!driver) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-8 bg-black">
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl">
                    <h2 className="text-xl font-black text-red-500 uppercase mb-4">Acesso Negado</h2>
                    <p className="text-slate-400 text-sm">Este painel é exclusivo para motoristas vinculados ao Concrete ERP.</p>
                </div>
            </div>
        )
    }

    const deliveries = await getDriverDeliveries()

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8 font-sans">
            <DriverDashboardClient 
                initialData={deliveries} 
                driverName={driver.nome || driver.profiles?.full_name || 'Motorista'} 
            />
        </div>
    )
}

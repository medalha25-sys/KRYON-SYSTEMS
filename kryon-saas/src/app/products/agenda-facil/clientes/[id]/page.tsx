import { getClient, getPatientAppointments, getPatientRecords } from '../actions'
import { createClient } from '@/utils/supabase/server'
import PatientTabs from '@/components/agenda/patients/PatientTabs'
import AgendaSidebar from '@/components/agenda/AgendaSidebar'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function PatientDetailsPage({ params }: { params: { id: string } }) {
    const { id } = params
    
    // Auth Check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get Role & Org
    const { data: profile } = await supabase
        .from('profiles')
        .select(`
            role, 
            organization:organizations(
                name, 
                logo_url, 
                white_label_enabled
            )
        `)
        .eq('id', user.id)
        .single()
    
    const userRole = profile?.role || 'user'
    // Cast organization to expected type or handle any
    const organization = profile?.organization as any

    // Fetch Data
    const clientRes = await getClient(id)
    if (clientRes.error || !clientRes.data) {
        return (
            <div className="flex h-screen items-center justify-center dark:bg-gray-900 dark:text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Paciente não encontrado</h1>
                    <p className="text-gray-500 mb-4">{clientRes.error || 'Erro desconhecido'}</p>
                    <Link href="/products/agenda-facil/clientes" className="text-primary hover:underline">Voltar para a lista</Link>
                </div>
            </div>
        )
    }

    const client = clientRes.data
    const appointments = await getPatientAppointments(id)
    
    // Only fetch records if NOT secretary
    let records: any[] = []
    if (userRole !== 'secretary') {
        records = await getPatientRecords(id)
    }

    // Prepare sidebar props
    const userName = user.email || 'Usuário'
    const orgName = organization?.name || 'Clínica'
    const orgLogo = organization?.logo_url
    const whiteLabel = organization?.white_label_enabled

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
             {/* Sidebar */}
             <AgendaSidebar 
                currentView="clients" 
                onChangeView={() => {}} 
                userName={userName}
                organizationName={orgName}
                organizationLogo={orgLogo}
                whiteLabelEnabled={whiteLabel}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1 overflow-auto p-8">
                    <div className="mb-6 flex items-center gap-4">
                        <Link href="/products/agenda-facil/clientes" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <span className="material-symbols-outlined dark:text-gray-200">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="material-symbols-outlined text-sm">id_card</span>
                                <span>Prontuário Digital</span>
                            </div>
                        </div>
                    </div>

                    <PatientTabs 
                        client={client} 
                        appointments={appointments || []} 
                        records={records || []} 
                        userRole={userRole} 
                    />
                </div>
            </div>
        </div>
    )
}

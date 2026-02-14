import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import PatientProfile from '@/components/agenda/PatientProfile'

export default async function PatientValuesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  // Fetch Client
  const { data: client } = await supabase
    .from('agenda_clients')
    .select('*')
    .eq('id', id)
    .single()

  if (!client) {
    return notFound()
  }

  // Fetch Appointments (Evolution History)
  const { data: appointments } = await supabase
    .from('agenda_appointments')
    .select(`
        *,
        agenda_services:service_id (name, duration_minutes, price),
        agenda_professionals:professional_id (name)
    `)
    .eq('client_id', id)
    .order('start_time', { ascending: false })

  return <PatientProfile client={client} appointments={appointments || []} />
}

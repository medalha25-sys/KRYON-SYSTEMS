import { getAgendaData, getDashboardData } from './actions'
import { getAdminDashboardMetrics, getProfessionalMetrics } from './dashboard/actions'
import { getOrganizationDetails } from './organization-actions'
import AgendaPageClient from './AgendaPageClient'
import { createClient } from '@/utils/supabase/server'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ date?: string, view?: 'day' | 'week' }>
}) {
  const { date, view } = await searchParams
  const dateStr = date || new Date().toISOString().split('T')[0]

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Default data (Agenda is always needed for the calendar view)
  const agendaData = await getAgendaData(dateStr, view)
  const organization = await getOrganizationDetails()
  
  let adminDashboardData = null
  let professionalDashboardData = null
  let dashboardData = null // Legacy simple overview

  // Fetch metrics based on Role
  if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      const role = profile?.role || 'professional'

      if (role === 'secretary') {
          // Secretaries don't see dashboards
          dashboardData = null
      } else if (role === 'professional') {
          professionalDashboardData = await getProfessionalMetrics()
          // Fallback to simple dashboard if professional metrics fails or is null for some reason (e.g. unlinked)
          if (!professionalDashboardData) {
              dashboardData = await getDashboardData()
          }
      } else {
          // Admin / Owner / Manager
          adminDashboardData = await getAdminDashboardMetrics()
          if (!adminDashboardData) {
               dashboardData = await getDashboardData()
          }
      }
  }

  return (
    <AgendaPageClient 
        date={dateStr} 
        agendaData={agendaData} 
        dashboardData={dashboardData} 
        adminDashboardData={adminDashboardData}
        professionalDashboardData={professionalDashboardData}
        organization={organization}
        initialView={view as 'day' | 'week'} 
    />
  )
}

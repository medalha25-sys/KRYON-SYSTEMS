import { getAgendaData, getDashboardData } from './actions'
import AgendaPageClient from './AgendaPageClient'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ date?: string, view?: 'day' | 'week' }>
}) {
  const { date, view } = await searchParams
  const dateStr = date || new Date().toISOString().split('T')[0]

  const agendaData = await getAgendaData(dateStr, view)
  const dashboardData = await getDashboardData()

  // Pass view to Client Component if needed, or it can read from URL? 
  // Better to pass it as prop if we are using it for initial state.
  return <AgendaPageClient date={dateStr} agendaData={agendaData} dashboardData={dashboardData} initialView={view as 'day' | 'week'} />
}

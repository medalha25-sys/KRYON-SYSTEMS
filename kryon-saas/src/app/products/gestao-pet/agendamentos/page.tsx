import { getPetAppointments, getPetsForSelect } from './actions'
import AppointmentList from './AppointmentList'

export default async function AgendamentosPage() {
  // Fetch appointments (could take a query param for date later)
  const [appointments, pets] = await Promise.all([
      getPetAppointments(),
      getPetsForSelect()
  ])

  return <AppointmentList appointments={appointments} pets={pets} />
}

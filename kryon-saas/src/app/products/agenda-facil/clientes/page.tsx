import { getClients } from './actions'
import ClientList from '@/components/agenda/ClientList'
import { checkLimits } from '@/lib/limits'

export default async function ClientsPage() {
  const clients = await getClients()
  const { allowed, message } = await checkLimits('patients')

  return (
    <>
      <ClientList clients={clients} limitReached={!allowed} limitMessage={message} />
    </>
  )
}

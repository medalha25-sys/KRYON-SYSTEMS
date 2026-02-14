import { getClients } from './actions'
import ClientList from '@/components/agenda/ClientList'

export default async function ClientsPage() {
  const clients = await getClients()

  return <ClientList clients={clients} />
}

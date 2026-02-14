import { getServices } from './actions'
import ServiceList from '@/components/agenda/ServiceList'

export default async function ServicesPage() {
  const services = await getServices()

  return <ServiceList services={services} />
}

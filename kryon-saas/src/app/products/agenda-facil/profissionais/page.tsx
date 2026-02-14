import { getProfessionals } from './actions'
import ProfessionalList from '@/components/agenda/ProfessionalList'

export default async function ProfessionalsPage() {
  const professionals = await getProfessionals()

  return <ProfessionalList professionals={professionals} />
}

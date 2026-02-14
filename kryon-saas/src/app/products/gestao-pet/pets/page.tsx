import { getPets, getOwnersForSelect } from './actions'
import PetList from './PetList'

export default async function PetsPage() {
  const [pets, owners] = await Promise.all([
      getPets(),
      getOwnersForSelect()
  ])

  return <PetList pets={pets} owners={owners} />
}

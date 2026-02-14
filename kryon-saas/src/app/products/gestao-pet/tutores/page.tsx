import { getPetOwners } from './actions'
import OwnerList from './OwnerList'

export default async function TutoresPage() {
  const owners = await getPetOwners()

  return <OwnerList owners={owners} />
}

import { checkAccess } from '@/lib/checkAccess'
import TrialManager from '@/components/TrialManager'

export default async function AgendaFacilLayout({ children }: { children: React.ReactNode }) {
  const { status, daysLeft } = await checkAccess('agenda-facil')
  
  return (
    <TrialManager status={status} daysLeft={daysLeft}>
      {children}
    </TrialManager>
  )
}

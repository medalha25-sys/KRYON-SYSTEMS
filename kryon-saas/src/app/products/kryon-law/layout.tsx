import { checkAccess } from '@/lib/checkAccess'
import TrialManager from '@/components/TrialManager'

export default async function KryonLawLayout({ children }: { children: React.ReactNode }) {
  const { status, daysLeft } = await checkAccess('kryon-law')
  
  return (
    <TrialManager status={status} daysLeft={daysLeft}>
      {children}
    </TrialManager>
  )
}

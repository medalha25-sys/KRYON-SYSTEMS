import { getCases, getUpcomingDeadlines } from './actions'
import KryonLawDashboardClient from './KryonLawDashboardClient'

export default async function KryonLawPage() {
    const cases = await getCases()
    const deadlines = await getUpcomingDeadlines()

    return (
        <KryonLawDashboardClient 
            cases={cases as any[]} 
            deadlines={deadlines as any[]} 
        />
    )
}

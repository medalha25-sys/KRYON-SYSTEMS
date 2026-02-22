import { getDashboardMetrics } from '../actions'
import ConcreteERPDashboardClient from './ConcreteERPDashboardClient'

export default async function ConcreteERPPage() {
    const stats = await getDashboardMetrics()

    return (
        <ConcreteERPDashboardClient stats={stats} />
    )
}

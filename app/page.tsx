import { getDashboardStats } from '@/app/actions/stats'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import Link from 'next/link'

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="container">
      <div className="dashboard-header">
        <div className="header-info">
          <h1>Welcome to AlumNode</h1>
          <p>Real-time Alumni Data Management & Analytics</p>
        </div>
        <div className="header-actions">
          <Link href="/projects" className="btn btn-primary">
            View All Projects
          </Link>
        </div>
      </div>

      <AnalyticsDashboard stats={stats} />

    </div>
  )
}

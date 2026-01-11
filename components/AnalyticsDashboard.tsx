'use client'

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
)

interface DashboardProps {
    stats: {
        totalProjects: number
        totalAlumni: number
        batchData: { name: string; value: number }[]
        orgData: { name: string; value: number }[]
    }
}

export default function AnalyticsDashboard({ stats }: DashboardProps) {
    const barData = {
        labels: stats.batchData.map(d => d.name),
        datasets: [
            {
                label: 'Alumni Count',
                data: stats.batchData.map(d => d.value),
                backgroundColor: 'rgba(30, 58, 138, 0.8)',
                borderRadius: 8,
            },
        ],
    }

    const pieData = {
        labels: stats.orgData.map(d => d.name),
        datasets: [
            {
                data: stats.orgData.map(d => d.value),
                backgroundColor: [
                    '#1e3a8a',
                    '#3b82f6',
                    '#10b981',
                    '#64748b',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6',
                    '#ec4899',
                ],
                borderWidth: 0,
            },
        ],
    }

    return (
        <div className="dashboard-content">
            <div className="stats-row">
                <div className="stat-card card">
                    <div className="stat-label">Total Projects</div>
                    <div className="stat-value">{stats.totalProjects}</div>
                </div>
                <div className="stat-card card">
                    <div className="stat-label">Total Alumni Records</div>
                    <div className="stat-value">{stats.totalAlumni}</div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card card">
                    <h3>Batch Distribution</h3>
                    <div className="chart-container">
                        <Bar
                            data={barData}
                            options={{ responsive: true, maintainAspectRatio: false }}
                        />
                    </div>
                </div>

                <div className="chart-card card">
                    <h3>Top Organizations</h3>
                    <div className="chart-container">
                        <Pie
                            data={pieData}
                            options={{ responsive: true, maintainAspectRatio: false }}
                        />
                    </div>
                </div>
            </div>

        </div>
    )
}

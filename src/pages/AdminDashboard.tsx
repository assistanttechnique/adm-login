import { MessageSquareText, Server } from 'lucide-react'

import { BarChart } from '../components/dashboard/BarChart'
import { DashboardCard, StatValue } from '../components/dashboard/DashboardCard'
import { DonutChart } from '../components/dashboard/DonutChart'
import { dashboardDemo as data } from '../data/dashboardDemo'

const pad = (n: number) => String(n).padStart(2, '0')

export default function AdminDashboard() {
  return (
    <div className="rounded-xl bg-white p-4 shadow-card sm:p-[30px]">
      <div className="grid gap-7 xl:grid-cols-2">
        <DashboardCard icon={Server} title="Server Load">
          <StatValue
            label="Current Queue Length"
            value={`${data.serverLoad.queueLength}/${data.serverLoad.queueCapacity}`}
          />
        </DashboardCard>

        <DashboardCard icon={Server} title="Server Status">
          <StatValue label="No Active Projects Running" value={pad(data.activeProjects)} />
        </DashboardCard>

        <DashboardCard icon={MessageSquareText} title={`Last Run Discovery Chart: ${data.lastRunName}`}>
          <DonutChart title="Discovery Chart" data={data.discovery} />
        </DashboardCard>

        <DashboardCard icon={MessageSquareText} title={`Last Run Detailed Discovery Chart: ${data.lastRunName}`}>
          <BarChart data={data.detailedDiscovery} xLabel="Fields" yLabel="Percentage" />
        </DashboardCard>

        <DashboardCard icon={Server} title="Active Connections">
          <StatValue value={`${data.activeConnections.current}/${data.activeConnections.max}`} />
        </DashboardCard>

        <DashboardCard icon={Server} title="Last Run Projects">
          <div className="overflow-x-auto">
            <table className="w-full border border-card-border text-left text-[13px] text-black">
              <thead className="bg-content">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Project Name</th>
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.lastRunProjects.map((project) => (
                  <tr key={project.name} className="border-t border-card-border">
                    <td className="px-4 py-2.5">{project.name}</td>
                    <td className="px-4 py-2.5">{project.date}</td>
                    <td className="px-4 py-2.5">{project.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}

import { cn } from "@/lib/utils"
import { Users, Calendar, FileText, DollarSign } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getEmployees, getAttendance, getLeaves } from "@/lib/db"

export default async function AdminDashboardPage() {
  const employees = await getEmployees()
  const leaves = await getLeaves()
  const attendance = await getAttendance()

  const totalEmployees = employees.filter((e) => e?.status === "active").length
  const pendingLeaves = leaves.filter((l) => l?.status === "pending").length
  const today = new Date().toISOString().split("T")[0]
  const todayAttendance = attendance.filter((a) => a?.date === today && a?.status === "present").length

  const recentLeaves = leaves.slice(-5).reverse()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Employees" value={totalEmployees} icon={Users} trend={{ value: 12, isPositive: true }} />
        <StatCard
          title="Present Today"
          value={todayAttendance}
          icon={Calendar}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Pending Leaves"
          value={pendingLeaves}
          icon={FileText}
          trend={{ value: 8, isPositive: false }}
        />
        <StatCard
          title="Payroll (Monthly)"
          value={`$${totalEmployees * 75000}`}
          icon={DollarSign}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
            <CardDescription>Latest leave applications from employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeaves.length > 0 ? (
                recentLeaves.map((leave) => (
                  <div key={leave?.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{leave?.employeeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {leave?.leaveType} - {leave?.startDate} to {leave?.endDate}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-full",
                        leave?.status === "pending"
                          ? "bg-chart-4/20 text-chart-4"
                          : leave?.status === "approved"
                            ? "bg-chart-3/20 text-chart-3"
                            : "bg-destructive/20 text-destructive",
                      )}
                    >
                      {leave?.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No leave requests</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Department overview and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                <div>
                  <p className="font-medium">Engineering</p>
                  <p className="text-sm text-muted-foreground">Active employees</p>
                </div>
                <span className="text-2xl font-bold">
                  {employees.filter((e) => e?.department === "Engineering" && e?.status === "active").length}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                <div>
                  <p className="font-medium">Average Attendance</p>
                  <p className="text-sm text-muted-foreground">Last 30 days</p>
                </div>
                <span className="text-2xl font-bold">
                  {Math.round((attendance.length / (employees.length * 30)) * 100) || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                <div>
                  <p className="font-medium">Leave Approval Rate</p>
                  <p className="text-sm text-muted-foreground">This month</p>
                </div>
                <span className="text-2xl font-bold">
                  {leaves.length > 0
                    ? Math.round((leaves.filter((l) => l?.status === "approved").length / leaves.length) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
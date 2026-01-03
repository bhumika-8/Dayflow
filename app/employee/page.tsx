import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCollection } from "@/lib/db";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, FileText, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttendanceRecord, LeaveRequest } from "@/lib/types";
import QuickActions from "./QuickActions";
export default async function EmployeeDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const employeeId = session.employeeId || "EMP001";

  // Fetch attendance records from MongoDB
  const attendanceCol = await getCollection<AttendanceRecord>("attendance");
  const attendanceDocs = await attendanceCol.find({ employeeId }).toArray();
  const attendanceRecords = attendanceDocs.map((doc) => ({ ...doc, id: doc._id.toString(), _id: undefined }));

  const now = new Date();
  const thisMonthAttendance = attendanceRecords.filter((a) => {
    const recordDate = new Date(a.date);
    return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
  }).length;

  // Fetch leave requests from MongoDB
  const leavesCol = await getCollection<LeaveRequest>("leaves");
  const leaveDocs = await leavesCol.find({ employeeId }).toArray();
  const leaveRequests = leaveDocs.map((doc) => ({ ...doc, id: doc._id.toString(), _id: undefined }));
  const pendingLeaves = leaveRequests.filter((l) => l.status === "pending").length;

  // Recent attendance (last 5 records)
  const recentAttendance = attendanceRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session.name}!</h1>
        <p className="text-muted-foreground">Here's your overview for today</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Days Present"
          value={thisMonthAttendance}
          icon={Calendar}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard title="Hours This Week" value="45h" icon={Clock} trend={{ value: 12, isPositive: true }} />
        <StatCard title="Pending Leaves" value={pendingLeaves} icon={FileText} trend={{ value: 0, isPositive: true }} />
        <StatCard title="This Month Salary" value={`$${session.salary || 80000}`} icon={DollarSign} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>Your attendance records for the last 5 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAttendance.length > 0 ? (
                recentAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.checkIn} - {record.checkOut} ({record.workHours}h)
                      </p>
                    </div>
                    <span
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-full",
                        record.status === "present"
                          ? "bg-chart-3/20 text-chart-3"
                          : record.status === "late"
                            ? "bg-chart-4/20 text-chart-4"
                            : "bg-destructive/20 text-destructive"
                      )}
                    >
                      {record.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No attendance records</p>
              )}
            </div>
          </CardContent>
        </Card>

      <Card>
  <CardHeader>
    <CardTitle>Quick Actions</CardTitle>
    <CardDescription>Common tasks and shortcuts</CardDescription>
  </CardHeader>
  <CardContent>
    <QuickActions />
  </CardContent>
</Card>
      </div>
    </div>
  );
}

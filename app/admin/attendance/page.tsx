"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { AttendanceRecord } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function AdminAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/attendance")
      const data = await res.json()
      setAttendance(data.attendance)
    } catch (err) {
      console.error("Fetch attendance error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Group by employeeId
  const groupedAttendance = attendance.reduce((acc, record) => {
    if (!acc[record.employeeId]) acc[record.employeeId] = []
    acc[record.employeeId].push(record)
    return acc
  }, {} as Record<string, AttendanceRecord[]>)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-chart-3/20 text-chart-3"
      case "late":
        return "bg-chart-4/20 text-chart-4"
      case "absent":
        return "bg-destructive/20 text-destructive"
      case "half-day":
        return "bg-chart-2/20 text-chart-2"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
        <p className="text-muted-foreground">View attendance by employee</p>
      </div>

      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Loading attendance...</p>
      ) : (
        Object.entries(groupedAttendance).map(([employeeId, records]) => (
          <Card key={employeeId}>
            <CardHeader>
              <CardTitle>{records[0]?.employeeId || employeeId}</CardTitle>
              <CardDescription>Attendance records</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-muted/50">
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Check-in</th>
                    <th className="px-4 py-2">Check-out</th>
                    <th className="px-4 py-2">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {records
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record) => (
                      <tr key={record.id} className="border-b border-muted/20">
                        <td className="px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">
                          <span
                            className={cn(
                              "px-2 py-1 text-xs font-medium rounded-full",
                              getStatusColor(record.status)
                            )}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">{record.checkIn || "-"}</td>
                        <td className="px-4 py-2">{record.checkOut || "-"}</td>
                        <td className="px-4 py-2">{record.workHours ? record.workHours + "h" : "-"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

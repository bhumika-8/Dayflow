"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LeaveForm } from "@/components/leaves/leave-form"
import type { LeaveRequest } from "@/lib/types"
import { Plus, FileText, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function EmployeeLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaves()
  }, [])

  const fetchLeaves = async () => {
    try {
      const response = await fetch("/api/leaves")
      const data = await response.json()
      setLeaves(data.leaves)
    } catch (error) {
      console.error("[v0] Fetch leaves error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLeave = async (data: Partial<LeaveRequest>) => {
    try {
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to create leave request")

      toast.success("Leave request submitted successfully")
      setDialogOpen(false)
      fetchLeaves()
    } catch (error) {
      console.error("[v0] Create leave error:", error)
      toast.error("Failed to submit leave request")
    }
  }

  const handleDeleteLeave = async (id: string) => {
    if (!confirm("Are you sure you want to delete this leave request?")) return

    try {
      const response = await fetch(`/api/leaves/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete leave request")

      toast.success("Leave request deleted")
      fetchLeaves()
    } catch (error) {
      console.error("[v0] Delete leave error:", error)
      toast.error("Failed to delete leave request")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-chart-4/20 text-chart-4"
      case "approved":
        return "bg-chart-3/20 text-chart-3"
      case "rejected":
        return "bg-destructive/20 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getLeaveTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sick: "Sick Leave",
      casual: "Casual Leave",
      annual: "Annual Leave",
      unpaid: "Unpaid Leave",
    }
    return labels[type] || type
  }

  const pendingCount = leaves.filter((l) => l.status === "pending").length
  const approvedCount = leaves.filter((l) => l.status === "approved").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Leave Requests</h1>
          <p className="text-muted-foreground">Apply for and manage your leave requests</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Apply for Leave
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{leaves.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-4">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-3">{approvedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
          <CardDescription>All your leave requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading leave requests...</p>
          ) : leaves.length > 0 ? (
            <div className="space-y-4">
              {leaves.map((leave) => (
                <div key={leave.id} className="p-4 bg-accent/50 rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{getLeaveTypeLabel(leave.leaveType)}</h3>
                          <span
                            className={cn("px-2 py-1 text-xs font-medium rounded-full", getStatusColor(leave.status))}
                          >
                            {leave.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-muted-foreground">Duration:</span> {leave.startDate} to{" "}
                            {leave.endDate}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Reason:</span> {leave.reason}
                          </p>
                          <p className="text-muted-foreground">
                            Applied on {new Date(leave.appliedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    {leave.status === "pending" && (
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteLeave(leave.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No leave requests yet</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogDescription>Submit a new leave request for approval</DialogDescription>
          </DialogHeader>
          <LeaveForm
            onSubmit={handleCreateLeave}
            onCancel={() => {
              setDialogOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

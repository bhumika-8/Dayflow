"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { LeaveRequest } from "@/lib/types"
import { FileText, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveRequest[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaves()
  }, [])

  useEffect(() => {
    let filtered = leaves

    if (statusFilter !== "all") {
      filtered = filtered.filter((leave) => leave.status === statusFilter)
    }

    setFilteredLeaves(filtered)
  }, [statusFilter, leaves])

  const fetchLeaves = async () => {
    try {
      const response = await fetch("/api/leaves")
      const data = await response.json()
      setLeaves(data.leaves)
      setFilteredLeaves(data.leaves)
    } catch (error) {
      console.error("[v0] Fetch leaves error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/leaves/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error("Failed to update leave request")

      toast.success(`Leave request ${status}`)
      fetchLeaves()
    } catch (error) {
      console.error("[v0] Update leave error:", error)
      toast.error("Failed to update leave request")
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground">Review and manage employee leave requests</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>All employee leave applications</CardDescription>
          <div className="pt-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading leave requests...</p>
          ) : filteredLeaves.length > 0 ? (
            <div className="space-y-4">
              {filteredLeaves.map((leave) => (
                <div key={leave.id} className="p-4 bg-accent/50 rounded-lg space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{leave.employeeName}</h3>
                          <span className="text-sm text-muted-foreground">({leave.employeeId})</span>
                          <span
                            className={cn("px-2 py-1 text-xs font-medium rounded-full", getStatusColor(leave.status))}
                          >
                            {leave.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-muted-foreground">Type:</span> {getLeaveTypeLabel(leave.leaveType)}
                          </p>
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
                          {leave.reviewedBy && (
                            <p className="text-muted-foreground">
                              Reviewed by {leave.reviewedBy} on{" "}
                              {leave.reviewedDate && new Date(leave.reviewedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {leave.status === "pending" && leave.id && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(leave.id!, "approved")}
                          className="bg-chart-3 hover:bg-chart-3/90 text-white"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUpdateStatus(leave.id!, "rejected")}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              {statusFilter !== "all" ? "No leave requests match your filter" : "No leave requests"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
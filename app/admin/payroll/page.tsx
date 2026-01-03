"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PayrollForm } from "@/components/payroll/payroll-form"
import type { PayrollRecord, Employee } from "@/lib/types"
import { Plus, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function AdminPayrollPage() {
  const [payroll, setPayroll] = useState<PayrollRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredPayroll, setFilteredPayroll] = useState<PayrollRecord[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayroll()
    fetchEmployees()
  }, [])

  useEffect(() => {
    let filtered = payroll

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    setFilteredPayroll(filtered)
  }, [statusFilter, payroll])

  const fetchPayroll = async () => {
    try {
      const response = await fetch("/api/payroll")
      const data = await response.json()
      setPayroll(data.payroll)
      setFilteredPayroll(data.payroll)
    } catch (error) {
      console.error("[v0] Fetch payroll error:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      const data = await response.json()
      setEmployees(data.employees)
    } catch (error) {
      console.error("[v0] Fetch employees error:", error)
    }
  }

  const handleCreatePayroll = async (data: Partial<PayrollRecord>) => {
    try {
      const response = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to create payroll")

      toast.success("Payroll record created successfully")
      setDialogOpen(false)
      fetchPayroll()
    } catch (error) {
      console.error("[v0] Create payroll error:", error)
      toast.error("Failed to create payroll record")
    }
  }

  const handleUpdateStatus = async (id: string, status: "processed" | "paid") => {
    try {
      const response = await fetch(`/api/payroll/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error("Failed to update payroll")

      toast.success(`Payroll marked as ${status}`)
      fetchPayroll()
    } catch (error) {
      console.error("[v0] Update payroll error:", error)
      toast.error("Failed to update payroll")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-chart-4/20 text-chart-4"
      case "processed":
        return "bg-chart-2/20 text-chart-2"
      case "paid":
        return "bg-chart-3/20 text-chart-3"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getMonthName = (month: string) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return months[Number.parseInt(month) - 1] || month
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">Process and manage employee payroll</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Payroll
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
          <CardDescription>All employee salary payments and records</CardDescription>
          <div className="pt-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading payroll...</p>
          ) : filteredPayroll.length > 0 ? (
            <div className="space-y-4">
              {filteredPayroll.map((record) => (
                <div key={record.id} className="p-4 bg-accent/50 rounded-lg space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{record.employeeName}</h3>
                          <span className="text-sm text-muted-foreground">({record.employeeId})</span>
                          <span
                            className={cn("px-2 py-1 text-xs font-medium rounded-full", getStatusColor(record.status))}
                          >
                            {record.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getMonthName(record.month)} {record.year}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Basic Salary</p>
                            <p className="font-medium">${record.basicSalary.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Allowances</p>
                            <p className="font-medium text-chart-3">${record.allowances.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Deductions</p>
                            <p className="font-medium text-destructive">${record.deductions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Net Salary</p>
                            <p className="font-semibold text-lg">${record.netSalary.toLocaleString()}</p>
                          </div>
                        </div>
                        {record.paymentDate && (
                          <p className="text-sm text-muted-foreground">
                            Paid on {new Date(record.paymentDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    {record.id && (
                      <div className="flex flex-col gap-2">
                        {record.status === "pending" && (
                          <Button size="sm" onClick={() => handleUpdateStatus(record.id!, "processed")}>
                            Process
                          </Button>
                        )}
                        {record.status === "processed" && (
                          <Button size="sm" onClick={() => handleUpdateStatus(record.id!, "paid")}>
                            Mark as Paid
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              {statusFilter !== "all" ? "No payroll records match your filter" : "No payroll records"}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Payroll Record</DialogTitle>
            <DialogDescription>Generate a new payroll record for an employee</DialogDescription>
          </DialogHeader>
          <PayrollForm
            employees={employees.map((e) => ({
              employeeId: e.employeeId,
              name: e.name,
              salary: e.salary,
            }))}
            onSubmit={handleCreatePayroll}
            onCancel={() => {
              setDialogOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
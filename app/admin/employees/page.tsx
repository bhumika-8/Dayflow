"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { EmployeeForm } from "@/components/employees/employee-form"
import type { Employee } from "@/lib/types"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    const filtered = employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredEmployees(filtered)
  }, [searchTerm, employees])

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      const data = await response.json()
      setEmployees(data.employees)
      setFilteredEmployees(data.employees)
    } catch (error) {
      console.error("[v0] Fetch employees error:", error)
      toast.error("Failed to load employees")
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = async (data: Partial<Employee>) => {
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to add employee")

      toast.success("Employee added successfully")
      setDialogOpen(false)
      fetchEmployees()
    } catch (error) {
      console.error("[v0] Add employee error:", error)
      toast.error("Failed to add employee")
    }
  }

 const handleUpdateEmployee = async (data: Partial<Employee>) => {
  if (!editingEmployee?.id) return

  console.log("Updating employee with ID:", editingEmployee.id) // Add this line

  try {
    const response = await fetch(`/api/employees/${editingEmployee.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("[v0] Update response:", responseData)
      throw new Error(responseData.error || "Failed to update employee")
    }

    toast.success("Employee updated successfully")
    setDialogOpen(false)
    setEditingEmployee(null)
    fetchEmployees()
  } catch (error) {
    console.error("[v0] Update employee error:", error)
    toast.error(error instanceof Error ? error.message : "Failed to update employee")
  }
}

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete employee")

      toast.success("Employee deleted successfully")
      fetchEmployees()
    } catch (error) {
      console.error("[v0] Delete employee error:", error)
      toast.error("Failed to delete employee")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
          <p className="text-muted-foreground">Manage your workforce and employee information</p>
        </div>
        <Button
          onClick={() => {
            setEditingEmployee(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <CardDescription>View and manage employee records</CardDescription>
          <div className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading employees...</p>
          ) : filteredEmployees.length > 0 ? (
            <div className="space-y-4">
              {filteredEmployees.map((employee) => (
                <div key={employee.id} className="p-4 bg-accent/50 rounded-lg flex items-start justify-between gap-4">
                  <div className="flex-1 grid gap-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{employee.name}</h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-chart-1/20 text-chart-1">
                        {employee.employeeId}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{employee.email}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm">
                      <span>
                        <span className="text-muted-foreground">Department:</span> {employee.department}
                      </span>
                      <span>
                        <span className="text-muted-foreground">Position:</span> {employee.position}
                      </span>
                      <span>
                        <span className="text-muted-foreground">Salary:</span> ${employee.salary.toLocaleString()}
                      </span>
                      <span>
                        <span className="text-muted-foreground">Joined:</span> {employee.joiningDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingEmployee(employee)
                        setDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => employee.id && handleDeleteEmployee(employee.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No employees found matching your search" : "No employees yet"}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
            <DialogDescription>
              {editingEmployee ? "Update employee information" : "Enter employee details to add them to the system"}
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm
            employee={editingEmployee || undefined}
            onSubmit={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
            onCancel={() => {
              setDialogOpen(false)
              setEditingEmployee(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
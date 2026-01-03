"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PayrollRecord } from "@/lib/types"

interface PayrollFormProps {
  employees: Array<{ employeeId: string; name: string; salary: number }>
  onSubmit: (data: Partial<PayrollRecord>) => Promise<void>
  onCancel: () => void
}

export function PayrollForm({ employees, onSubmit, onCancel }: PayrollFormProps) {
  const currentYear = new Date().getFullYear()
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0")

  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    month: currentMonth,
    year: currentYear.toString(),
    basicSalary: "",
    allowances: "0",
    deductions: "0",
  })

  const [loading, setLoading] = useState(false)

  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find((e) => e.employeeId === employeeId)
    if (employee) {
      setFormData({
        ...formData,
        employeeId: employee.employeeId,
        employeeName: employee.name,
        basicSalary: employee.salary.toString(),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  const netSalary =
    Number.parseFloat(formData.basicSalary || "0") +
    Number.parseFloat(formData.allowances || "0") -
    Number.parseFloat(formData.deductions || "0")

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="employeeId">Employee</Label>
          <Select value={formData.employeeId} onValueChange={handleEmployeeChange} required>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.employeeId} value={emp.employeeId}>
                  {emp.name} ({emp.employeeId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="month">Month</Label>
          <Select value={formData.month} onValueChange={(value) => setFormData({ ...formData, month: value })} required>
            <SelectTrigger>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="01">January</SelectItem>
              <SelectItem value="02">February</SelectItem>
              <SelectItem value="03">March</SelectItem>
              <SelectItem value="04">April</SelectItem>
              <SelectItem value="05">May</SelectItem>
              <SelectItem value="06">June</SelectItem>
              <SelectItem value="07">July</SelectItem>
              <SelectItem value="08">August</SelectItem>
              <SelectItem value="09">September</SelectItem>
              <SelectItem value="10">October</SelectItem>
              <SelectItem value="11">November</SelectItem>
              <SelectItem value="12">December</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })} required>
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="basicSalary">Basic Salary</Label>
          <Input
            id="basicSalary"
            type="number"
            value={formData.basicSalary}
            onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="allowances">Allowances</Label>
          <Input
            id="allowances"
            type="number"
            value={formData.allowances}
            onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deductions">Deductions</Label>
          <Input
            id="deductions"
            type="number"
            value={formData.deductions}
            onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Net Salary</Label>
          <div className="text-3xl font-bold text-primary">${netSalary.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Payroll"}
        </Button>
      </div>
    </form>
  )
}

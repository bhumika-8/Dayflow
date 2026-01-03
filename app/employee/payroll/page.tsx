"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { PayrollRecord } from "@/lib/types"
import { DollarSign, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function EmployeePayrollPage() {
  const [payroll, setPayroll] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayroll()
  }, [])

  const fetchPayroll = async () => {
    try {
      const response = await fetch("/api/payroll")
      const data = await response.json()
      setPayroll(data.payroll)
    } catch (error) {
      console.error("[v0] Fetch payroll error:", error)
    } finally {
      setLoading(false)
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

  const currentYearTotal = payroll
    .filter((p) => p.year === new Date().getFullYear() && p.status === "paid")
    .reduce((sum, p) => sum + p.netSalary, 0)

  const latestPayslip = payroll[0]
const handleDownloadPayslip = (record: PayrollRecord) => {
  const monthName = getMonthName(record.month)
  const content = `
    <html>
      <head>
        <title>Payslip - ${monthName} ${record.year}</title>
        <style>
          body {
            font-family: 'Roboto', sans-serif;
            padding: 2rem;
            background: #f9f9f9;
          }
          .payslip {
            max-width: 500px;
            margin: 0 auto;
            padding: 2rem;
            border-radius: 16px;
            background: #fff;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          }
          h1 {
            font-size: 1.75rem;
            margin-bottom: 0.5rem;
            color: #5f5f5f;
          }
          .section {
            margin: 1rem 0;
          }
          .section p {
            margin: 0.25rem 0;
          }
          .amount {
            font-weight: bold;
            font-size: 1.1rem;
          }
          .net {
            font-size: 1.3rem;
            color: #8F87F1;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="payslip">
          <h1>Payslip</h1>
          <p>${monthName} ${record.year}</p>
          <div class="section">
            <p>Basic Salary: $${record.basicSalary.toLocaleString()}</p>
            <p>Allowances: +$${record.allowances.toLocaleString()}</p>
            <p>Deductions: -$${record.deductions.toLocaleString()}</p>
          </div>
          <div class="section">
            <p class="net">Net Salary: $${record.netSalary.toLocaleString()}</p>
          </div>
          <div class="section">
            <p>Status: ${record.status}</p>
            ${record.paymentDate ? `<p>Paid on: ${new Date(record.paymentDate).toLocaleDateString()}</p>` : ''}
          </div>
        </div>
        <script>
          window.onload = () => window.print()
        </script>
      </body>
    </html>
  `
  const newWindow = window.open("", "_blank")
  if (newWindow) {
    newWindow.document.write(content)
    newWindow.document.close()
  }
}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Payroll</h1>
        <p className="text-muted-foreground">View your salary details and payment history</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Latest Payslip</CardTitle>
          </CardHeader>
          <CardContent>
            {latestPayslip ? (
              <div className="space-y-2">
                <div className="text-3xl font-bold">${latestPayslip.netSalary.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">
                  {getMonthName(latestPayslip.month)} {latestPayslip.year}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No payslips available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Year to Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${currentYearTotal.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total paid in {new Date().getFullYear()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your salary payment records</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading payroll...</p>
          ) : payroll.length > 0 ? (
            <div className="space-y-4">
              {payroll.map((record) => (
                <div key={record.id} className="p-4 bg-accent/50 rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">
                            {getMonthName(record.month)} {record.year}
                          </h3>
                          <span
                            className={cn("px-2 py-1 text-xs font-medium rounded-full", getStatusColor(record.status))}
                          >
                            {record.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Basic Salary</p>
                            <p className="font-medium">${record.basicSalary.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Allowances</p>
                            <p className="font-medium text-chart-3">+${record.allowances.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Deductions</p>
                            <p className="font-medium text-destructive">-${record.deductions.toLocaleString()}</p>
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
                    {record.status === "paid" && (
                      <Button
  size="sm"
  variant="outline"
  onClick={() => handleDownloadPayslip(record)}
>
  <Download className="h-4 w-4 mr-2" />
  Download
</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No payroll records</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

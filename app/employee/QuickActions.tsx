"use client"

import { useRouter } from "next/navigation"

export default function QuickActions() {
  const router = useRouter()

  return (
    <div className="space-y-3">
      <button
        className="w-full p-4 bg-primary text-primary-foreground rounded-lg text-left hover:opacity-90 transition-opacity"
        onClick={() => router.push("/employee/attendance")}
      >
        <p className="font-medium">Mark Attendance</p>
        <p className="text-sm opacity-90">Clock in/out for today</p>
      </button>

      <button
        className="w-full p-4 bg-secondary text-secondary-foreground rounded-lg text-left hover:opacity-90 transition-opacity"
        onClick={() => router.push("/employee/leaves")}
      >
        <p className="font-medium">Apply for Leave</p>
        <p className="text-sm opacity-90">Request time off</p>
      </button>

      <button
        className="w-full p-4 bg-accent text-accent-foreground rounded-lg text-left hover:opacity-90 transition-opacity"
        onClick={() => router.push("/employee/payroll")}
      >
        <p className="font-medium">View Payslips</p>
        <p className="text-sm opacity-90">Download salary statements</p>
      </button>
    </div>
  )
}

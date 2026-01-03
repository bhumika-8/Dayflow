import type React from "react"
import { EmployeeNav } from "@/components/dashboard/employee-nav"

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <EmployeeNav />
      <main className="lg:pl-64 p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}

import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Briefcase, Calendar, DollarSign, Building } from "lucide-react"

export default async function EmployeeProfilePage() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">View and manage your personal information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your profile details and employment information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {session.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{session.name}</h2>
              <p className="text-muted-foreground">{session.position || "Employee"}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{session.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg">
              <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Employee ID</p>
                <p className="font-medium">{session.employeeId || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg">
              <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{session.department || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg">
              <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium">{session.position || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Joining Date</p>
                <p className="font-medium">{session.joiningDate || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Salary</p>
                <p className="font-medium">${session.salary?.toLocaleString() || "N/A"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

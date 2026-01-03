import { LoginForm } from "@/components/auth/login-form"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/20">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">HRMS Portal</h1>
          <p className="text-muted-foreground">Human Resource Management System</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

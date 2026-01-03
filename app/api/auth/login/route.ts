import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { findUserByEmail } from "@/lib/db"
import { createToken, setAuthCookie } from "@/lib/auth"
import { initializeDatabase } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = await findUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const { password: _, ...userWithoutPassword } = user
    const token = await createToken(userWithoutPassword)
    await setAuthCookie(token)

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

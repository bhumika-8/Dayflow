// app/api/auth/login/route.ts
import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/db";
import { createToken } from "@/lib/auth";
import type { User } from "@/lib/types";

// Extend User to include password for login check
type UserWithPassword = Omit<User, "createdAt"> & { password: string };

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const userWithPassword = user as UserWithPassword;

    const isValidPassword = await bcrypt.compare(password, userWithPassword.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = userWithPassword as User;

    const token = await createToken(userWithoutPassword);

    const response = NextResponse.json({ user: userWithoutPassword }); // ✅ Return user info

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[auth] Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

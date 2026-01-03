import { NextResponse, type NextRequest } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import type { AttendanceRecord } from "@/lib/types"

export async function GET(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const employeeId = searchParams.get("employeeId")

  let records = db.attendance

  if (session.role === "employee") {
    records = records.filter((a) => a.employeeId === session.employeeId)
  } else if (employeeId) {
    records = records.filter((a) => a.employeeId === employeeId)
  }

  return NextResponse.json({ attendance: records })
}

export async function POST(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      employeeId: session.role === "employee" ? session.employeeId! : data.employeeId,
      date: data.date || new Date().toISOString().split("T")[0],
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      status: data.status,
      workHours: data.workHours,
    }

    db.attendance.push(newRecord)

    return NextResponse.json({ record: newRecord })
  } catch (error) {
    console.error("[v0] Create attendance error:", error)
    return NextResponse.json({ error: "Failed to create attendance record" }, { status: 500 })
  }
}

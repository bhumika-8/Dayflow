import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import type { AttendanceRecord } from "@/lib/types";
import { Document } from "mongodb";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const employeeIdParam = searchParams.get("employeeId");

  const col = await getCollection<AttendanceRecord & Document>("attendance");

  let query: Record<string, any> = {};
  if (session.role === "employee") {
    query.employeeId = session.employeeId;
  } else if (employeeIdParam) {
    query.employeeId = employeeIdParam;
  }

  const docs = await col.find(query).toArray();

  // Map _id -> id for frontend
  const records = docs.map((doc) => {
    const { _id, ...rest } = doc;
    return { ...rest, id: _id.toString() };
  });

  return NextResponse.json({ attendance: records });
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const col = await getCollection<AttendanceRecord & Document>("attendance");

    const newRecord: Omit<AttendanceRecord, "id"> = {
      employeeId: session.role === "employee" ? session.employeeId! : data.employeeId,
      date: data.date || new Date().toISOString().split("T")[0],
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      status: data.status,
      workHours: data.workHours,
    };

    const result = await col.insertOne(newRecord);

    return NextResponse.json({
      record: { ...newRecord, id: result.insertedId.toString() },
    });
  } catch (error) {
    console.error("[attendance] Create record error:", error);
    return NextResponse.json({ error: "Failed to create attendance record" }, { status: 500 });
  }
}

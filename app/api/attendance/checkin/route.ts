import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import type { AttendanceRecord } from "@/lib/types";
import { Document } from "mongodb";

export async function POST() {
  const session = await getSession();

  if (!session || !session.employeeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const col = await getCollection<AttendanceRecord & Document>("attendance");

    // Check if already checked in today
    const existingRecord = await col.findOne({
      employeeId: session.employeeId,
      date: today,
      checkIn: { $exists: true },
    });

    if (existingRecord) {
      return NextResponse.json({ error: "Already checked in today" }, { status: 400 });
    }

    const shiftStartHour = 9;
const shiftStartMinute = 0;

const [checkHour, checkMinute] = [now.getHours(), now.getMinutes()];
const isLate =
  checkHour > shiftStartHour ||
  (checkHour === shiftStartHour && checkMinute > shiftStartMinute);

const newRecord: Omit<AttendanceRecord, "id"> = {
  employeeId: session.employeeId,
  date: today,
  checkIn: currentTime,
  status: isLate ? "late" : "present",
}

    const result = await col.insertOne(newRecord);

    const record: AttendanceRecord & { id: string } = {
      ...newRecord,
      id: result.insertedId.toString(),
    };

    return NextResponse.json({ record });
  } catch (error) {
    console.error("[attendance] Check-in error:", error);
    return NextResponse.json({ error: "Failed to check in" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import type { AttendanceRecord } from "@/lib/types";
import { Document, ObjectId } from "mongodb";

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

    const record = await col.findOne({
      employeeId: session.employeeId,
      date: today,
      checkIn: { $exists: true },
      checkOut: { $exists: false },
    });

    if (!record) {
      return NextResponse.json({ error: "No check-in found for today" }, { status: 400 });
    }

    const [checkInHour, checkInMin] = record.checkIn!.split(":").map(Number);
    const [checkOutHour, checkOutMin] = currentTime.split(":").map(Number);
    const workHours = Math.round(
      ((checkOutHour * 60 + checkOutMin - (checkInHour * 60 + checkInMin)) / 60) * 10
    ) / 10;

    const result = await col.findOneAndUpdate(
      { _id: new ObjectId(record._id) },
      { $set: { checkOut: currentTime, workHours } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 });
    }

    const updatedRecord: AttendanceRecord & { id: string } = {
      ...result,
      id: result._id.toString(),
    };
    delete (updatedRecord as any)._id;

    return NextResponse.json({ record: updatedRecord });
  } catch (error) {
    console.error("[attendance] Check-out error:", error);
    return NextResponse.json({ error: "Failed to check out" }, { status: 500 });
  }
}
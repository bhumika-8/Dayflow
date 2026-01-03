import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import type { LeaveRequest } from "@/lib/types";
import { Document, ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    const col = await getCollection<LeaveRequest & Document>("leaves");
    let query: any = {};

    if (session.role === "employee") {
      query.employeeId = session.employeeId;
    }
    if (status) {
      query.status = status;
    }

    const docs = await col.find(query).toArray();

    // Map _id to id
    const leaves: LeaveRequest[] = docs
      .map((doc) => ({ ...doc, id: doc._id.toString() }))
      .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());

    return NextResponse.json({ leaves });
  } catch (error) {
    console.error("[leaves] Get leaves error:", error);
    return NextResponse.json({ error: "Failed to fetch leaves" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session || !session.employeeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const col = await getCollection<LeaveRequest & Document>("leaves");

    const newLeave: Omit<LeaveRequest, "id"> = {
      employeeId: session.employeeId,
      employeeName: session.name,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      status: "pending",
      appliedDate: new Date().toISOString(),
    };

    const result = await col.insertOne(newLeave);

    // Map Mongo _id to id
    const leaveWithId: LeaveRequest = {
      ...newLeave,
      id: result.insertedId.toString(),
    };

    return NextResponse.json({ leave: leaveWithId });
  } catch (error) {
    console.error("[leaves] Create leave error:", error);
    return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 });
  }
}

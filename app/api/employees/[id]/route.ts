import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import type { Employee } from "@/lib/types";
import { ObjectId, Document } from "mongodb";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const data = await request.json();
    const col = await getCollection<Employee & Document>("employees");
    
    const result = await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[employees] Update employee error:", error);
    return NextResponse.json({ 
      error: "Failed to update employee",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/* =========================
   DELETE EMPLOYEE
========================= */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params   // ← THIS is the fix

    const col = await getCollection<Employee & { _id: ObjectId }>("employees")

    const result = await col.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[employees] Delete employee error:", error)
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 })
  }
}

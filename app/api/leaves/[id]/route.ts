import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import type { LeaveRequest } from "@/lib/types";
import { ObjectId, Document } from "mongodb";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await request.json();

    const col = await getCollection<LeaveRequest & Document>("leaves");

    const result = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: data.status,
          reviewedBy: session.name,
          reviewedDate: new Date().toISOString(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    const updatedLeave: LeaveRequest & { id: string } = {
      ...result,
      id: result._id.toString(),
    };
    delete (updatedLeave as any)._id;

    return NextResponse.json({ leave: updatedLeave });
  } catch (error) {
    console.error("[leaves] Update leave error:", error);
    return NextResponse.json({ error: "Failed to update leave request" }, { status: 500 });
  }
}


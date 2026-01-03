import { NextResponse, type NextRequest } from "next/server"
import { getSession } from "@/lib/auth"
import { getCollection } from "@/lib/db"   // ✅ only import getCollection
import { ObjectId, Document } from "mongodb"

// ✅ re‑declare mapId here since it's not exported from db.ts
function mapId<T extends { _id?: ObjectId }>(doc: T) {
  if (!doc) return null
  const { _id, ...rest } = doc
  return { ...rest, id: _id?.toString() }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params
    const data = await request.json()

    const payrollCol = await getCollection<Document>("payroll")

    const payrollRecord = await payrollCol.findOne({ _id: new ObjectId(id) })
    if (!payrollRecord) {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 })
    }

    const updatedData: Partial<Document> = { ...data }

    if (data.status === "paid") {
      updatedData.paymentDate = new Date().toISOString()
    }

    const result = await payrollCol.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedData },
      { returnDocument: "after" }
    )

    if (!result) {
      return NextResponse.json({ error: "Failed to update payroll record" }, { status: 500 })
    }

    return NextResponse.json({ payroll: mapId(result) })
  } catch (error) {
    console.error("[v0] Update payroll error:", error)
    return NextResponse.json({ error: "Failed to update payroll record" }, { status: 500 })
  }
}

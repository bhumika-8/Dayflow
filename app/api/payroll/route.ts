import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import type { PayrollRecord } from "@/lib/types";
import { Document } from "mongodb";

/* =========================
   GET PAYROLL RECORDS
========================= */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const employeeIdParam = searchParams.get("employeeId");

  const col = await getCollection<PayrollRecord & Document>("payroll");
  let query: any = {};

  if (session.role === "employee") {
    query.employeeId = session.employeeId;
  } else if (employeeIdParam) {
    query.employeeId = employeeIdParam;
  }

  const docs = await col.find(query).toArray();

  // Map _id to id
  const payroll = docs
    .map((doc) => ({ ...doc, id: doc._id.toString(), _id: undefined }))
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return Number.parseInt(b.month) - Number.parseInt(a.month);
    });

  return NextResponse.json({ payroll });
}

/* =========================
   CREATE PAYROLL RECORD
========================= */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    const newPayroll: Omit<PayrollRecord, "id"> = {
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      month: data.month,
      year: Number.parseInt(data.year),
      basicSalary: Number.parseFloat(data.basicSalary),
      allowances: Number.parseFloat(data.allowances),
      deductions: Number.parseFloat(data.deductions),
      netSalary:
        Number.parseFloat(data.basicSalary) +
        Number.parseFloat(data.allowances) -
        Number.parseFloat(data.deductions),
      status: "pending",
    };

    const col = await getCollection<PayrollRecord & Document>("payroll");
    const result = await col.insertOne(newPayroll);

    const payrollRecord: PayrollRecord & { id: string } = {
      ...newPayroll,
      id: result.insertedId.toString(),
    };

    return NextResponse.json({ payroll: payrollRecord });
  } catch (error) {
    console.error("[payroll] Create payroll error:", error);
    return NextResponse.json({ error: "Failed to create payroll record" }, { status: 500 });
  }
}

// app/api/employees/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import type { Employee } from "@/lib/types";
import { ObjectId } from "mongodb";

/* =========================
   GET ALL EMPLOYEES
========================= */
export async function GET() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const col = await getCollection<Employee>("employees");
    const docs = await col.find().toArray();

    // Map _id → id
    const employees = docs.map((e) => ({
      ...e,
      id: e._id.toString(),
    }));

    return NextResponse.json({ employees });
  } catch (error) {
    console.error("[employees] Get employees error:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

/* =========================
   CREATE NEW EMPLOYEE
========================= */
export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    const col = await getCollection<Employee>("employees");

    const newEmployee: Omit<Employee, "id"> = {
      employeeId: data.employeeId,
      name: data.name,
      email: data.email,
      department: data.department,
      position: data.position,
      salary: Number.parseFloat(data.salary),
      joiningDate: data.joiningDate,
      status: "active",
      profileImage: data.profileImage || null,
    };

    const result = await col.insertOne(newEmployee);

    const createdEmployee: Employee = {
      ...newEmployee,
      id: result.insertedId.toString(),
    };

    return NextResponse.json({ employee: createdEmployee });
  } catch (error) {
    console.error("[employees] Create employee error:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}

import clientPromise from "./mongodb";
import type { User, Employee, AttendanceRecord, LeaveRequest, PayrollRecord } from "./types";
import { ObjectId, Document } from "mongodb";

const DB_NAME = "hrms_db";

/* =========================
   COLLECTION HELPER
========================= */
export async function getCollection<T extends Document>(collectionName: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection<T>(collectionName);
}

/* =========================
   HELPER TO MAP _id TO id
========================= */
function mapId<T extends { _id?: ObjectId }>(doc: T) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { ...rest, id: _id?.toString() };
}

/* =========================
   USER OPERATIONS
========================= */
export async function findUserByEmail(email: string) {
  const usersCol = await getCollection<User & Document>("users");
  const user = await usersCol.findOne({ email });
  return user ? mapId(user) : null;
}

export async function createUser(userData: Omit<User, "id" | "createdAt">) {
  const usersCol = await getCollection<User & Document>("users");
  const user: User = {
    ...userData,
    createdAt: new Date().toISOString(),
  };
  const result = await usersCol.insertOne(user);
  return { ...user, id: result.insertedId.toString() };
}

/* =========================
   EMPLOYEE OPERATIONS
========================= */
export async function getEmployees() {
  const col = await getCollection<Employee & Document>("employees");
  const docs = await col.find().toArray();
  return docs.map(mapId);
}

export async function createEmployee(employeeData: Omit<Employee, "id" | "status">) {
  const col = await getCollection<Employee & Document>("employees");
  const employee: Employee = {
    ...employeeData,
    status: "active",
  };
  const result = await col.insertOne(employee);
  return { ...employee, id: result.insertedId.toString() };
}

/* =========================
   ATTENDANCE OPERATIONS
========================= */
export async function getAttendance(employeeId?: string) {
  const col = await getCollection<AttendanceRecord & Document>("attendance");
  const query = employeeId ? { employeeId } : {};
  const docs = await col.find(query).toArray();
  return docs.map(mapId);
}

export async function createAttendance(record: Omit<AttendanceRecord, "id">) {
  const col = await getCollection<AttendanceRecord & Document>("attendance");
  const result = await col.insertOne(record);
  return { ...record, id: result.insertedId.toString() };
}

/* =========================
   LEAVE OPERATIONS
========================= */
export async function getLeaves(employeeId?: string) {
  const col = await getCollection<LeaveRequest & Document>("leaves");
  const query = employeeId ? { employeeId } : {};
  const docs = await col.find(query).toArray();
  return docs.map(mapId);
}

export async function createLeaveRequest(leave: Omit<LeaveRequest, "id">) {
  const col = await getCollection<LeaveRequest & Document>("leaves");
  const result = await col.insertOne(leave);
  return { ...leave, id: result.insertedId.toString() };
}

/* =========================
   PAYROLL OPERATIONS
========================= */
export async function getPayroll(employeeId?: string) {
  const col = await getCollection<PayrollRecord & Document>("payroll");
  const query = employeeId ? { employeeId } : {};
  const docs = await col.find(query).toArray();
  return docs.map(mapId);
}

export async function createPayrollRecord(record: Omit<PayrollRecord, "id">) {
  const col = await getCollection<PayrollRecord & Document>("payroll");
  const result = await col.insertOne(record);
  return { ...record, id: result.insertedId.toString() };
}

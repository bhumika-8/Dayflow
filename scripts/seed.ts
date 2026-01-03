import bcrypt from "bcryptjs";
import clientPromise from "../lib/mongodb.ts";
import type { User, Employee } from "../lib/types.ts";

async function seed() {
  const client = await clientPromise;
  const db = client.db("hrms_db");

  const users = db.collection<User>("users");
  const employees = db.collection<Employee>("employees");

  // Clean slate (ONLY for dev)
  await users.deleteMany({});
  await employees.deleteMany({});

  /* =========================
     ADMIN
  ========================= */

  const adminPassword = await bcrypt.hash("admin123", 10);

  await users.insertOne({
    email: "admin@company.com",
    password: adminPassword,
    name: "HR Admin",
    role: "admin",
    createdAt: new Date().toISOString(),
  });

  /* =========================
     EMPLOYEES
  ========================= */

  const employeeData = [
    {
      employeeId: "EMP001",
      name: "Aarav Mehta",
      email: "aarav@company.com",
      department: "Engineering",
      position: "Frontend Developer",
      salary: 60000,
      joiningDate: "2023-01-10",
    },
    {
      employeeId: "EMP002",
      name: "Isha Sharma",
      email: "isha@company.com",
      department: "Engineering",
      position: "Backend Developer",
      salary: 65000,
      joiningDate: "2023-02-05",
    },
    {
      employeeId: "EMP003",
      name: "Rohan Verma",
      email: "rohan@company.com",
      department: "Design",
      position: "UI/UX Designer",
      salary: 55000,
      joiningDate: "2023-03-01",
    },
    {
      employeeId: "EMP004",
      name: "Neha Kapoor",
      email: "neha@company.com",
      department: "HR",
      position: "HR Executive",
      salary: 50000,
      joiningDate: "2023-04-12",
    },
    {
      employeeId: "EMP005",
      name: "Kabir Singh",
      email: "kabir@company.com",
      department: "Finance",
      position: "Accountant",
      salary: 58000,
      joiningDate: "2023-05-20",
    },
  ];

  for (const emp of employeeData) {
    const hashedPassword = await bcrypt.hash("emp123", 10);

    await users.insertOne({
      email: emp.email,
      password: hashedPassword,
      name: emp.name,
      role: "employee",
      employeeId: emp.employeeId,
      department: emp.department,
      position: emp.position,
      salary: emp.salary,
      joiningDate: emp.joiningDate,
      createdAt: new Date().toISOString(),
    });

    await employees.insertOne({
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      salary: emp.salary,
      joiningDate: emp.joiningDate,
      status: "active",
    });
  }

  console.log("✅ Database seeded successfully");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});

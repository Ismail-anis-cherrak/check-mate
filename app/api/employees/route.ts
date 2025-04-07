import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/Employee";
import "@/models/Department"; // Ensure model registration
import "@/models/Schedule"; // Ensure model registration
import mongoose, { Types } from "mongoose";

// GET: Fetch all employees with populated department and schedule
export async function GET() {
  await connectDB();
  try {
    const employees = await Employee.find()
      .populate("department_id") // Populate department details
      .populate("schedule_id"); // Populate schedule details

    console.log("Fetched Employees:", employees);
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

// POST: Create a new employee
export async function POST(req: Request) {
  await connectDB();
  try {
    const data = await req.json();

    // Convert department_id and schedule_id to ObjectId if present
    if (data.department_id) data.department_id = new Types.ObjectId(data.department_id);
    if (data.schedule_id) data.schedule_id = new Types.ObjectId(data.schedule_id);

    const employee = await Employee.create(data);
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}

// PUT: Assigner ou mettre à jour un tag RFID pour un employé
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const { id } = params;
    const { rfid_tag } = await req.json();

    if (!id || !rfid_tag) {
      return NextResponse.json({ error: "Employee ID and RFID tag are required" }, { status: 400 });
    }

    // Vérifier si le rfid_tag est déjà utilisé par un autre employé
    const existingEmployeeWithRfid = await Employee.findOne({ rfid_tag, _id: { $ne: id } });
    if (existingEmployeeWithRfid) {
      return NextResponse.json({ error: "This RFID tag is already assigned to another employee" }, { status: 409 });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { rfid_tag },
      { new: true }
    );

    if (!updatedEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating RFID tag:", error);
    return NextResponse.json({ error: "Failed to update RFID tag" }, { status: 500 });
  }
}
// DELETE: Supprimer un tag RFID d'un employé
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { rfid_tag: "" },
      { new: true }
    );

    if (!updatedEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error("Error removing RFID tag:", error);
    return NextResponse.json({ error: "Failed to remove RFID tag" }, { status: 500 });
  }
}
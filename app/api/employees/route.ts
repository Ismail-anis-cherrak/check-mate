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

// PUT: Update an employee by ID
export async function PUT(req: Request) {
  await connectDB();
  try {
    const { id, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    // Convert ID to ObjectId
    const updatedEmployee = await Employee.findByIdAndUpdate(
      new Types.ObjectId(id),
      updateData,
      { new: true }
    );

    if (!updatedEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

// DELETE: Remove an employee by ID
export async function DELETE(req: Request) {
  await connectDB();
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    // Convert ID to ObjectId and delete the document
    const deletedEmployee = await Employee.findByIdAndDelete(new Types.ObjectId(id));

    if (!deletedEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}

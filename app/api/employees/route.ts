/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Fetch all employees
 *     description: Retrieves all employees with populated department and schedule details
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: List of employees
 *       500:
 *         description: Server error
 */

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

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create a new employee
 *     description: Creates a new employee record with department and schedule assignments
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - rfid_tag
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               rfid_tag:
 *                 type: string
 *               department_id:
 *                 type: string
 *               schedule_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       500:
 *         description: Server error
 */

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

/**
 * @swagger
 * /api/employees:
 *   put:
 *     summary: Update an employee
 *     description: Fully updates an employee record by ID
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               rfid_tag:
 *                 type: string
 *               department_id:
 *                 type: string
 *               schedule_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       400:
 *         description: Employee ID is required
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */

// PUT: Update an employee by ID (full update)
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

/**
 * @swagger
 * /api/employees:
 *   patch:
 *     summary: Partially update an employee
 *     description: Updates specific fields of an employee record by ID
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               rfid_tag:
 *                 type: string
 *               department_id:
 *                 type: string
 *               schedule_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       400:
 *         description: Employee ID is required
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */

// PATCH: Partially update an employee by ID
export async function PATCH(req: Request) {
  await connectDB();
  try {
    const { id, ...updateFields } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    // Convert ID to ObjectId
    const existingEmployee = await Employee.findById(new Types.ObjectId(id));

    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Only update the fields that are provided
    Object.keys(updateFields).forEach((key) => {
      existingEmployee[key] = updateFields[key];
    });

    await existingEmployee.save();

    return NextResponse.json(existingEmployee);
  } catch (error) {
    console.error("Error patching employee:", error);
    return NextResponse.json({ error: "Failed to patch employee" }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/employees:
 *   delete:
 *     summary: Delete an employee
 *     description: Removes an employee record by ID
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       400:
 *         description: Employee ID is required
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */

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

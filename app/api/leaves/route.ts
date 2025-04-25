/**
 * @swagger
 * /api/leaves:
 *   get:
 *     summary: Fetch all leave logs
 *     description: Retrieves all leave logs with populated employee data
 *     tags: [Leaves]
 *     responses:
 *       200:
 *         description: List of leave logs
 *       500:
 *         description: Server error
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Leave from "@/models/Leave";
import Employee from "@/models/Employee";
import mongoose from "mongoose";

// GET: Fetch all Leave logs
export async function GET() {
  await connectDB();
  try {
    const logs = await Leave.find().populate("employee_id");
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching Leave logs:", error);
    return NextResponse.json({ error: "Failed to fetch Leave logs" }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/leaves:
 *   post:
 *     summary: Create a new leave log
 *     description: Creates a new leave record for an employee using RFID tag
 *     tags: [Leaves]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rfid_tag
 *               - device_id
 *               - pin
 *             properties:
 *               rfid_tag:
 *                 type: string
 *               device_id:
 *                 type: string
 *               pin:
 *                 type: number
 *     responses:
 *       201:
 *         description: Leave log created successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */

// POST: Create a new Leave log
export async function POST(req: Request) {
  try {
      await connectDB(); // Ensure database connection

      const { rfid_tag, device_id, pin } = await req.json();
      console.log(typeof(rfid_tag))

      if (!rfid_tag || !pin) {
          return NextResponse.json({ error: "rfid_tag and device_id and pin are required" }, { status: 400 });
      }

      console.log("🔍 Searching for employee with RFID:", rfid_tag);

      const employee = await Employee.findOne({ rfid_tag }).exec();

      if (!employee) {
          console.log("❌ Employee not found for RFID:", rfid_tag);
          return NextResponse.json({ error: "Employee not found" }, { status: 404 });
      }

      console.log("✅ Employee found:", employee);

      const LeaveData = {
          employee_id: new mongoose.Types.ObjectId(employee._id), // Ensure ObjectId format
          rfid_tag,
          pin,
          timestamp: new Date(),
      };

      console.log("📌 Creating Leave Record:", LeaveData);

      const newLeave = await Leave.create(LeaveData);

      console.log("🎉 Leave Saved:", newLeave);
      return NextResponse.json(newLeave, { status: 201 });

  } catch (error) {
      console.error("❌ Error adding Leave:", error);
      return NextResponse.json({ error: "Failed to create Leave log" }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/leaves:
 *   put:
 *     summary: Update an existing leave log
 *     description: Updates a leave record by ID
 *     tags: [Leaves]
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
 *               rfid_tag:
 *                 type: string
 *               device_id:
 *                 type: string
 *               pin:
 *                 type: number
 *     responses:
 *       200:
 *         description: Leave log updated successfully
 *       404:
 *         description: Leave log not found
 *       500:
 *         description: Server error
 */

// PUT: Update an existing Leave log
export async function PUT(req: Request) {
  await connectDB();
  try {
    const { id, ...updateData } = await req.json();
    const updatedLog = await Leave.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedLog) {
      return NextResponse.json({ error: "Leave log not found" }, { status: 404 });
    }
    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error("Error updating Leave log:", error);
    return NextResponse.json({ error: "Failed to update Leave log" }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/leaves:
 *   delete:
 *     summary: Delete a leave log
 *     description: Removes a leave record by ID
 *     tags: [Leaves]
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
 *         description: Leave log deleted successfully
 *       404:
 *         description: Leave log not found
 *       500:
 *         description: Server error
 */

// DELETE: Remove an Leave log
export async function DELETE(req: Request) {
  await connectDB();
  try {
    const { id } = await req.json();
    const deletedLog = await Leave.findByIdAndDelete(id);
    if (!deletedLog) {
      return NextResponse.json({ error: "Leave log not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Leave log deleted successfully" });
  } catch (error) {
    console.error("Error deleting Leave log:", error);
    return NextResponse.json({ error: "Failed to delete Leave log" }, { status: 500 });
  }
}

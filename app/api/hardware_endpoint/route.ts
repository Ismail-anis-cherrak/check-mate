/**
 * @swagger
 * /api/hardware_endpoint:
 *   get:
 *     summary: Fetch all employees with minimal data for hardware devices
 *     description: Retrieves all employees with only the essential data needed by hardware devices (ID, name, RFID tag, PIN)
 *     tags: [Hardware]
 *     responses:
 *       200:
 *         description: List of employees with minimal data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   first_name:
 *                     type: string
 *                   last_name:
 *                     type: string
 *                   rfid_tag:
 *                     type: string
 *                   pin:
 *                     type: number
 *       500:
 *         description: Server error
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/Employee";
import "@/models/Department"; // Ensure model registration
import "@/models/Schedule"; // Ensure model registration
import mongoose, { Types } from "mongoose";


export async function GET() {
  await connectDB();
  try {
    const employees = await Employee.find()
      .populate("department_id") // Populate department details
      .populate("schedule_id"); // Populate schedule details

    console.log("Fetched Employees:", employees);
    return NextResponse.json(employees.map(employee => ({
      id: employee._id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      rfid_tag: employee.rfid_tag,
      pin: employee.pin
    })));
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}
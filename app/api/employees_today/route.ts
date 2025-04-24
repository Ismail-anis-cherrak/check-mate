/**
 * @swagger
 * /api/employees_today:
 *   get:
 *     summary: Get all employees with their attendance status for today
 *     description: Retrieves all employees and their current status (in, out, or not in yet) for the current day
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: List of employees with their status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   first_name:
 *                     type: string
 *                   last_name:
 *                     type: string
 *                   rfid_tag:
 *                     type: string
 *                   department_id:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       department_name:
 *                         type: string
 *                   status:
 *                     type: string
 *                     enum: [in, out, not in yet]
 *       500:
 *         description: Server error
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/Employee";
import Attendance from "@/models/Attendance";
import Leave from "@/models/Leave";
import mongoose from "mongoose";
import "@/models/Department";

// GET: Fetch all employees with attendance/leave status
export async function GET() {
  await connectDB();

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Start of the day
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999); // End of the day

    // Fetch all employees
    const employees = await Employee.find().populate("department_id");

    // Process each employee to determine their status
    const employeesWithStatus = await Promise.all(
      employees.map(async (employee) => {
        const employeeId = new mongoose.Types.ObjectId(employee._id);

        // Check if there's an attendance log for today
        const hasAttendance = await Attendance.exists({
          employee_id: employeeId,
          timestamp: { $gte: todayStart, $lte: todayEnd },
        });

        // Check if there's a leave log for today
        const hasLeave = await Leave.exists({
          employee_id: employeeId,
          timestamp: { $gte: todayStart, $lte: todayEnd },
        });

        let status = "not in yet";
        if (hasAttendance) status = "in";
        if (hasLeave) status = "out";

        return {
          ...employee.toObject(),
          status, // Add the new status field
        };
      })
    );

    return NextResponse.json(employeesWithStatus);
  } catch (error) {
    console.error("Error fetching employee status:", error);
    return NextResponse.json({ error: "Failed to fetch employee status" }, { status: 500 });
  }
}

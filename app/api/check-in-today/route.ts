/**
 * @swagger
 * /api/check-in-today:
 *   get:
 *     summary: Get today's attendance and leave records
 *     description: Retrieves all attendance and leave records for the current day with populated employee and department data
 *     tags: [Attendance]
 *     responses:
 *       200:
 *         description: Successfully retrieved today's records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attendances:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       employee_id:
 *                         type: object
 *                         properties:
 *                           first_name:
 *                             type: string
 *                           last_name:
 *                             type: string
 *                           rfid_tag:
 *                             type: string
 *                           department_id:
 *                             type: object
 *                             properties:
 *                               department_name:
 *                                 type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                 leaves:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       employee_id:
 *                         type: object
 *                         properties:
 *                           first_name:
 *                             type: string
 *                           last_name:
 *                             type: string
 *                           rfid_tag:
 *                             type: string
 *                           department_id:
 *                             type: object
 *                             properties:
 *                               department_name:
 *                                 type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Attendance from "@/models/Attendance";
import Leave from "@/models/Leave";

export async function GET() {
  await connectDB();
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Start of tomorrow

    // Fetch attendances of today, populate employee details and department
    const attendances = await Attendance.find({
      timestamp: { $gte: today, $lt: tomorrow },
    }).populate({
      path: "employee_id",
      select: "first_name last_name rfid_tag department_id",
      populate: {
        path: "department_id",
        select: "department_name",
      },
    });

    // Fetch leaves of today, populate employee details and department
    const leaves = await Leave.find({
      timestamp: { $gte: today, $lt: tomorrow },
    }).populate({
      path: "employee_id",
      select: "first_name last_name rfid_tag department_id",
      populate: {
        path: "department_id",
        select: "department_name",
      },
    });

    return NextResponse.json({
      attendances,
      leaves,
    });
  } catch (error) {
    console.error("Error fetching today's check-ins:", error);
    return NextResponse.json({ error: "Failed to fetch check-ins" }, { status: 500 });
  }
}

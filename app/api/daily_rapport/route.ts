/**
 * @swagger
 * /api/daily_rapport:
 *   post:
 *     summary: Generate daily attendance report for an employee
 *     description: Generates a detailed daily report including attendance status, entry/exit times, and schedule adherence
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *             properties:
 *               employee_id:
 *                 type: string
 *                 description: MongoDB ObjectId of the employee
 *     responses:
 *       200:
 *         description: Daily rapport generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 employee:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     department:
 *                       type: string
 *                     email:
 *                       type: string
 *                 schedule:
 *                   type: object
 *                   properties:
 *                     start_day:
 *                       type: number
 *                     end_day:
 *                       type: number
 *                     start_time:
 *                       type: string
 *                     end_time:
 *                       type: string
 *                 entry_time:
 *                   type: string
 *                   nullable: true
 *                 leave_time:
 *                   type: string
 *                   nullable: true
 *                 entered_late_by_minutes:
 *                   type: string
 *                 left_early_by_minutes:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [Present, Absent, "Still Inside or Forgot to Checkout"]
 *       400:
 *         description: Missing employee_id in request
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Attendance from "@/models/Attendance";
import Leave from "@/models/Leave";
import Employee from "@/models/Employee";
import "@/models/Schedule"; // ✅ Register the Schedule schema
import "@/models/Department"


function formatMinutesToHoursMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  



export async function POST(req: Request) {
  await connectDB();

  try {
    const { employee_id } = await req.json();
    if (!employee_id) {
      return NextResponse.json({ error: "employee_id is required" }, { status: 400 });
    }

    const employee = await Employee.findById(employee_id)
        .populate("schedule_id")
        .populate("department_id", "department_name");
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const today = new Date();
    const currentDay = today.getDay();
    const todayStr = today.toISOString().split("T")[0];

    // Get last attendance & leave today
    const attendance = await Attendance.findOne({
      employee_id,
      timestamp: { $gte: new Date(todayStr) }
    }).sort({ timestamp: -1 });

    const leave = await Leave.findOne({
      employee_id,
      timestamp: { $gte: new Date(todayStr) }
    }).sort({ timestamp: -1 });

    const shift = employee.schedule_id?.shifts?.find((s: any) => s.start_day === currentDay);

    if (!shift) {
      return NextResponse.json({ message: "No scheduled work today" });
    }

    // Parse shift times
    const parseTime = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const shiftStart = parseTime(shift.start_time);
    const shiftEnd = parseTime(shift.end_time);

    let status = "Absent";
    let entryDiff = null;
    let exitDiff = null;

    if (attendance) {
      const entryTime = attendance.timestamp.getHours() * 60 + attendance.timestamp.getMinutes();
      entryDiff = entryTime - shiftStart;
    }

    if (leave) {
      const exitTime = leave.timestamp.getHours() * 60 + leave.timestamp.getMinutes();
      exitDiff = shiftEnd - exitTime;
    }

    if (attendance && leave) {
      status = "Present";
    } else if (attendance && !leave) {
      status = "Still Inside or Forgot to Checkout";
    }

    const response = {
      employee: {
        name: `${employee.first_name} ${employee.last_name}`,
        department: employee.department_id,
        email: employee.email,
      },
      schedule: shift,
      entry_time: attendance?.timestamp || null,
      leave_time: leave?.timestamp || null,
      entered_late_by_minutes: entryDiff !== null && entryDiff > 0 ? formatMinutesToHoursMinutes(entryDiff) : "0h 0m",
      left_early_by_minutes: exitDiff !== null && exitDiff > 0 ? formatMinutesToHoursMinutes(exitDiff) : "0h 0m",
      status
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error generating daily rapport:", error);
    return NextResponse.json({ error: "Failed to generate daily rapport" }, { status: 500 });
  }
}

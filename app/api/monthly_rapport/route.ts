/**
 * @swagger
 * /api/monthly_rapport:
 *   post:
 *     summary: Generate monthly attendance report for an employee
 *     description: Generates a detailed monthly attendance report including presence, absences, late arrivals, and early departures
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
 *                 description: MongoDB ID of the employee
 *     responses:
 *       200:
 *         description: Monthly report generated successfully
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
 *                       type: object
 *                       properties:
 *                         department_name:
 *                           type: string
 *                     email:
 *                       type: string
 *                 total_days:
 *                   type: number
 *                 present_days:
 *                   type: number
 *                 absent_days:
 *                   type: number
 *                 total_late:
 *                   type: string
 *                 total_early_leaves:
 *                   type: string
 *                 monthly_presence_rate:
 *                   type: string
 *                 daily_reports:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       status:
 *                         type: string
 *                       entry_time:
 *                         type: string
 *                         nullable: true
 *                       leave_time:
 *                         type: string
 *                         nullable: true
 *                       entered_late_by:
 *                         type: string
 *                       left_early_by:
 *                         type: string
 *                       presence_duration:
 *                         type: string
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
import "@/models/Schedule";
import "@/models/Department";

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
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - i);
      return d;
    });

    const monthlyReport = [];
    let totalPresentDays = 0;
    let totalAbsentDays = 0;
    let totalLateMinutes = 0;
    let totalEarlyLeaveMinutes = 0;

    for (const day of days) {
      const dayStr = day.toISOString().split("T")[0];
      const dayOfWeek = day.getDay();

      const shift = employee.schedule_id?.shifts?.find((s: any) => s.start_day === dayOfWeek);
      if (!shift) {
        // Not a working day for the employee
        continue;
      }

      const attendance = await Attendance.findOne({
        employee_id,
        timestamp: { $gte: new Date(dayStr), $lt: new Date(new Date(dayStr).getTime() + 24 * 60 * 60 * 1000) }
      }).sort({ timestamp: 1 });

      const leave = await Leave.findOne({
        employee_id,
        timestamp: { $gte: new Date(dayStr), $lt: new Date(new Date(dayStr).getTime() + 24 * 60 * 60 * 1000) }
      }).sort({ timestamp: -1 });

      const parseTime = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };

      const shiftStart = parseTime(shift.start_time);
      const shiftEnd = parseTime(shift.end_time);

      let status = "Absent";
      let entryDiff = 0;
      let exitDiff = 0;
      let actualPresenceMinutes = 0;

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
        actualPresenceMinutes = (leave.timestamp.getTime() - attendance.timestamp.getTime()) / (1000 * 60);
      } else if (attendance && !leave) {
        status = "Still Inside or Forgot to Checkout";
      } else {
        totalAbsentDays++;
      }

      if (status === "Present") totalPresentDays++;

      totalLateMinutes += entryDiff > 0 ? entryDiff : 0;
      totalEarlyLeaveMinutes += exitDiff > 0 ? exitDiff : 0;

      monthlyReport.push({
        date: dayStr,
        status,
        entry_time: attendance?.timestamp || null,
        leave_time: leave?.timestamp || null,
        entered_late_by: entryDiff > 0 ? formatMinutesToHoursMinutes(entryDiff) : "0h 0m",
        left_early_by: exitDiff > 0 ? formatMinutesToHoursMinutes(exitDiff) : "0h 0m",
        presence_duration: formatMinutesToHoursMinutes(Math.max(actualPresenceMinutes, 0)),
      });
    }

    const finalReport = {
      employee: {
        name: `${employee.first_name} ${employee.last_name}`,
        department: employee.department_id,
        email: employee.email,
      },
      total_days: monthlyReport.length,
      present_days: totalPresentDays,
      absent_days: totalAbsentDays,
      total_late: formatMinutesToHoursMinutes(totalLateMinutes),
      total_early_leaves: formatMinutesToHoursMinutes(totalEarlyLeaveMinutes),
      monthly_presence_rate: `${((totalPresentDays / monthlyReport.length) * 100).toFixed(2)}%`,
      daily_reports: monthlyReport
    };

    return NextResponse.json(finalReport);

  } catch (error) {
    console.error("Error generating monthly rapport:", error);
    return NextResponse.json({ error: "Failed to generate monthly rapport" }, { status: 500 });
  }
}

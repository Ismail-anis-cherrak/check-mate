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
 *   post:
 *     summary: Validate employee access and record attendance/leave
 *     description: Validates employee access and records attendance or leave based on schedule
 *     tags: [Hardware]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rfid_tag:
 *                 type: string
 *               pin:
 *                 type: number
 *     responses:
 *       200:
 *         description: Access validation and attendance/leave recording result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access:
 *                   type: boolean
 *                 action:
 *                   type: string
 *       500:
 *         description: Server error
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/Employee";
import "@/models/Department"; // Ensure model registration
import "@/models/Schedule"; // Ensure model registration
import mongoose, { Types } from "mongoose";
import Attendance from "@/models/Attendance";
import Leave from "@/models/Leave";

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

export async function POST(request: Request) {
  await connectDB();
  try {
    const body = await request.json();
    const { rfid_tag, pin } = body;

    // Find employee with schedule
    const employee = await Employee.findOne({ rfid_tag, pin }).populate('schedule_id');
    
    if (!employee) {
      return NextResponse.json({ access: false });
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0-6 (Sunday-Saturday)
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    // Check if current time falls within any shift (including 1 hour buffer)
    const schedule = employee.schedule_id;
    let isWithinShift = false;
    let isWithinBuffer = false;

    for (const shift of schedule.shifts) {
      const { start_day, end_day, start_time, end_time } = shift;
      
      // Convert times to Date objects for easier comparison
      const [startHour, startMin] = start_time.split(':').map(Number);
      const [endHour, endMin] = end_time.split(':').map(Number);
      
      // Create buffer times (1 hour before and after)
      const bufferStartTime = new Date();
      bufferStartTime.setHours(startHour - 1, startMin);
      const bufferStartTimeStr = bufferStartTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      
      const bufferEndTime = new Date();
      bufferEndTime.setHours(endHour + 1, endMin);
      const bufferEndTimeStr = bufferEndTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

      // Handle shifts that span across days
      if (start_day <= end_day) {
        if (currentDay >= start_day && currentDay <= end_day) {
          if (start_time <= currentTime && currentTime <= end_time) {
            isWithinShift = true;
          }
          if (bufferStartTimeStr <= currentTime && currentTime <= bufferEndTimeStr) {
            isWithinBuffer = true;
          }
        }
      } else {
        // For shifts crossing midnight
        if (currentDay === start_day) {
          if (currentTime >= start_time) {
            isWithinShift = true;
          }
          if (currentTime >= bufferStartTimeStr) {
            isWithinBuffer = true;
          }
        } else if (currentDay === end_day) {
          if (currentTime <= end_time) {
            isWithinShift = true;
          }
          if (currentTime <= bufferEndTimeStr) {
            isWithinBuffer = true;
          }
        }
      }
    }

    if (!isWithinShift && !isWithinBuffer) {
      return NextResponse.json({ 
        access: false,
        message: "Not within scheduled shift or buffer period"
      });
    }

    // Check for existing attendance today
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const existingAttendance = await Attendance.findOne({
      employee_id: employee._id,
      timestamp: { $gte: startOfDay, $lte: endOfDay }
    });

    const existingLeave = await Leave.findOne({
      employee_id: employee._id,
      timestamp: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!existingAttendance) {
      // Create attendance record
      const attendance = new Attendance({
        employee_id: employee._id,
        rfid_tag,
        pin,
        timestamp: new Date()
      });
      await attendance.save();
      
      return NextResponse.json({ 
        access: true,
        action: "attendance_recorded"
      });
    } else if (!existingLeave) {
      // Create leave record
      const leave = new Leave({
        employee_id: employee._id,
        rfid_tag,
        pin,
        timestamp: new Date()
      });
      await leave.save();

      return NextResponse.json({ 
        access: true,
        action: "leave_recorded"
      });
    } else {
      return NextResponse.json({ 
        access: false,
        message: "Employee already has an attendance or leave record for today"
      });
    }

  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
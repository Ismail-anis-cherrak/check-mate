
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";
import mongoose from "mongoose";
import { log } from "console";


// GET: Fetch all attendance logs
export async function GET() {
  await connectDB();
  try {
    const logs = await Attendance.find().populate("employee_id");
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching attendance logs:", error);
    return NextResponse.json({ error: "Failed to fetch attendance logs" }, { status: 500 });
  }
}

// POST: Create a new attendance log
export async function POST(req: Request) {
  try {
      await connectDB(); // Ensure database connection

      const { rfid_tag, device_id } = await req.json();
      console.log(typeof(rfid_tag))

      if (!rfid_tag || !device_id) {
          return NextResponse.json({ error: "rfid_tag and device_id are required" }, { status: 400 });
      }

      console.log("🔍 Searching for employee with RFID:", rfid_tag);

      const employee = await Employee.findOne({ rfid_tag }).exec();

      if (!employee) {
          console.log("❌ Employee not found for RFID:", rfid_tag);
          return NextResponse.json({ error: "Employee not found" }, { status: 404 });
      }

      console.log("✅ Employee found:", employee);

      const attendanceData = {
          employee_id: new mongoose.Types.ObjectId(employee._id), // Ensure ObjectId format
          rfid_tag,
          device_id,
          timestamp: new Date(),
      };

      console.log("📌 Creating Attendance Record:", attendanceData);

      const newAttendance = await Attendance.create(attendanceData);

      console.log("🎉 Attendance Saved:", newAttendance);
      return NextResponse.json(newAttendance, { status: 201 });

  } catch (error) {
      console.error("❌ Error adding attendance:", error);
      return NextResponse.json({ error: "Failed to create attendance log" }, { status: 500 });
  }
}


// PUT: Update an existing attendance log
export async function PUT(req: Request) {
  await connectDB();
  try {
    const { id, ...updateData } = await req.json();
    const updatedLog = await Attendance.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedLog) {
      return NextResponse.json({ error: "Attendance log not found" }, { status: 404 });
    }
    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error("Error updating attendance log:", error);
    return NextResponse.json({ error: "Failed to update attendance log" }, { status: 500 });
  }
}

// DELETE: Remove an attendance log
export async function DELETE(req: Request) {
  await connectDB();
  try {
    const { id } = await req.json();
    const deletedLog = await Attendance.findByIdAndDelete(id);
    if (!deletedLog) {
      return NextResponse.json({ error: "Attendance log not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Attendance log deleted successfully" });
  } catch (error) {
    console.error("Error deleting attendance log:", error);
    return NextResponse.json({ error: "Failed to delete attendance log" }, { status: 500 });
  }
}

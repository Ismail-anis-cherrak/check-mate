// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Attendance from "@/models/Attendance";
// import Leave from "@/models/Leave";

// export async function GET() {
//   await connectDB();
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Start of today

//     const tomorrow = new Date();
//     tomorrow.setDate(today.getDate() + 1);
//     tomorrow.setHours(0, 0, 0, 0); // Start of tomorrow

//     // Fetch attendances of today
//     const attendances = await Attendance.find({
//       timestamp: { $gte: today, $lt: tomorrow },
//     }).populate("employee_id", "first_name last_name rfid_tag");

//     // Fetch leaves of today
//     const leaves = await Leave.find({
//       timestamp: { $gte: today, $lt: tomorrow },
//     }).populate("employee_id", "first_name last_name rfid_tag");

//     return NextResponse.json({
//       attendances,
//       leaves,
//     });
//   } catch (error) {
//     console.error("Error fetching today's check-ins:", error);
//     return NextResponse.json({ error: "Failed to fetch check-ins" }, { status: 500 });
//   }
// }

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

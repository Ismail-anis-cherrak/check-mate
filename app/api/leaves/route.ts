// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Leave from "@/models/Leave";
// import Employee from "@/models/Employee";
// import mongoose from "mongoose";

// // GET: Fetch all leave records
// export async function GET() {
//   await connectDB();
  
//   try {
//     const logs = await Leave.find().populate("employee_id");
//     return NextResponse.json(logs);
//   } catch (error) {
//     console.error("Error fetching leave logs:", error);
//     return NextResponse.json({ error: "Failed to fetch leave logs" }, { status: 500 });
//   }
// }

// // POST: Create a new leave record
// export async function POST(req: Request) {
//   try {
//     await connectDB();
//     const { rfid_tag, device_id } = await req.json();

//     if (!rfid_tag || !device_id) {
//       return NextResponse.json({ error: "rfid_tag and device_id are required" }, { status: 400 });
//     }

//     console.log("🔍 Searching for employee with RFID:", rfid_tag);
//     const employee = await Employee.findOne({ rfid_tag }).exec();

//     if (!employee) {
//       console.log("❌ Employee not found for RFID:", rfid_tag);
//       return NextResponse.json({ error: "Employee not found" }, { status: 404 });
//     }

//     console.log("✅ Employee found:", employee);

//     const leaveData = {
//       employee_id: new mongoose.Types.ObjectId(employee._id),
//       rfid_tag,
//       device_id,
//       timestamp: new Date(),
//     };

//     console.log("📌 Creating Leave Record:", leaveData);

//     const newLeave = await Leave.create(leaveData);
//     console.log("🎉 Leave Saved:", newLeave);
//     return NextResponse.json(newLeave, { status: 201 });

//   } catch (error) {
//     console.error("❌ Error adding leave:", error);
//     return NextResponse.json({ error: "Failed to create leave log" }, { status: 500 });
//   }
// }

// // PUT: Update an existing leave record
// export async function PUT(req: Request) {
//   await connectDB();
//   try {
//     const { id, ...updateData } = await req.json();
//     const updatedLog = await Leave.findByIdAndUpdate(id, updateData, { new: true });

//     if (!updatedLog) {
//       return NextResponse.json({ error: "Leave log not found" }, { status: 404 });
//     }
//     return NextResponse.json(updatedLog);

//   } catch (error) {
//     console.error("Error updating leave log:", error);
//     return NextResponse.json({ error: "Failed to update leave log" }, { status: 500 });
//   }
// }

// // DELETE: Remove a leave record
// export async function DELETE(req: Request) {
//   await connectDB();
//   try {
//     const { id } = await req.json();
//     const deletedLog = await Leave.findByIdAndDelete(id);

//     if (!deletedLog) {
//       return NextResponse.json({ error: "Leave log not found" }, { status: 404 });
//     }
//     return NextResponse.json({ message: "Leave log deleted successfully" });

//   } catch (error) {
//     console.error("Error deleting leave log:", error);
//     return NextResponse.json({ error: "Failed to delete leave log" }, { status: 500 });
//   }
// }


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

// POST: Create a new Leave log
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

      const LeaveData = {
          employee_id: new mongoose.Types.ObjectId(employee._id), // Ensure ObjectId format
          rfid_tag,
          device_id,
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

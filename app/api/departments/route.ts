import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Department from "@/models/Department";

export async function GET() {
  await connectDB();
  try {
    const departments = await Department.find();
    console.log("Fetched departments:", departments);
    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}
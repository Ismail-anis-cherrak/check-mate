import mongoose, { Schema, Document } from 'mongoose';

interface IAttendance extends Document {
  employee_id: mongoose.Types.ObjectId;
  rfid_tag: string;
  pin:Number;
  timestamp: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
  employee_id: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  rfid_tag: { type: String, required: true },
  pin: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Attendance || mongoose.model<IAttendance>(
  "Attendance", 
  AttendanceSchema, 
  "Attendances" // 👈 Explicitly specify the collection name
);

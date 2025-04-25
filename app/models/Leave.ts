import mongoose, { Schema, Document } from 'mongoose';

interface ILeave extends Document {
  employee_id: mongoose.Types.ObjectId;
  rfid_tag: string;
  pin: Number;  
  timestamp: Date;
}

const LeaveSchema = new Schema<ILeave>({
  employee_id: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  rfid_tag: { type: String, required: true },
  pin: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

// export default mongoose.models.Leaves || mongoose.model<ILeave>("Leaves", LeaveSchema);
export default mongoose.models.Leave || mongoose.model<ILeave>(
  "Leave", 
  LeaveSchema, 
  "Leaves" // 👈 Explicitly specify the collection name
);
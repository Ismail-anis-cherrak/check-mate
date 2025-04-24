import mongoose, { Schema, Document } from 'mongoose';

interface IEmployee extends Document {
  rfid_tag: string;
  pin: Number; 
  first_name: string;
  last_name: string;
  department_id: mongoose.Types.ObjectId;
  schedule_id: mongoose.Types.ObjectId;
  phone_number: string;
  email: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    rfid_tag: { type: String, required: true, unique: true,
     },
    pin: { type: Number, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    department_id: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    schedule_id: { type: Schema.Types.ObjectId, ref: "Schedule", required: true },
    phone_number: { type: String },
    email: { type: String },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema);

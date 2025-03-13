import mongoose, { Schema, Document } from 'mongoose';

interface IDepartment extends Document {
  department_name: string;
  created_at: Date;
  updated_at: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    department_name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.models.Department || mongoose.model<IDepartment>("Department", DepartmentSchema);

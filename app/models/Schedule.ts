import mongoose, { Schema, Document } from 'mongoose';

interface ISchedule extends Document {
  start_time: string;
  end_time: string;
  day_of_week: number;
}

const ScheduleSchema = new Schema<ISchedule>({
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  day_of_week: { type: Number, required: true },
});

export default mongoose.models.Schedule || mongoose.model<ISchedule>("Schedule", ScheduleSchema);

// import mongoose, { Schema, Document } from 'mongoose';

// interface ISchedule extends Document {
//   start_time: string;
//   end_time: string;
//   day_of_week: number;
// }

// const ScheduleSchema = new Schema<ISchedule>({
//   start_time: { type: String, required: true },
//   end_time: { type: String, required: true },
//   day_of_week: { type: Number, required: true },
// });

// export default mongoose.models.Schedule || mongoose.model<ISchedule>("Schedule", ScheduleSchema);

import mongoose, { Schema, Document } from 'mongoose';

interface IShift {
  start_day: number;    // 0 = Sunday, ..., 6 = Saturday
  end_day: number;
  start_time: string;   // "HH:mm"
  end_time: string;     // "HH:mm"
}

interface ISchedule extends Document {
  name: string;              // Optional: "Night Shift", "Day Shift", etc.
  shifts: IShift[];
}

const ShiftSchema = new Schema<IShift>(
  {
    start_day: { type: Number, required: true },
    end_day: { type: Number, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
  },
  { _id: false }
);

const ScheduleSchema = new Schema<ISchedule>({
  shifts: { type: [ShiftSchema], required: true }
});

export default mongoose.models.Schedule || mongoose.model<ISchedule>("Schedule", ScheduleSchema);

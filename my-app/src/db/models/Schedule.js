import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },

    groom: { type: String, required: true },
    bride: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String },
    memo: { type: String },
    status: {
      type: String,
      enum: ['pending', 'ongoing', 'upcoming', 'completed', 'canceled'],
      default: 'pending',
    },
    currentStep: { type: Number, enum: [0, 1, 2, 3], default: 0 },
  },
  { timestamps: true }
);

delete mongoose.models.Schedule; // ✅ 기존 모델 제거
export default mongoose.models.Schedule ||
  mongoose.model('Schedule', ScheduleSchema);

import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    mainUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    groom: { type: String, required: true },
    bride: { type: String, required: true },
    date: { type: String, required: true },
    time: {
      type: String, // "11:30"
      required: true,
    },
    location: { type: String },
    memo: { type: String },
    status: {
      type: String,
      enum: [
        'pending',
        'wakeup',
        'departure',
        'arrival',
        'completed',
        'delayed',
        'canceled',
      ],
      default: 'pending',
    },
    subStatus: {
      type: String,
      enum: ['unassigned', 'assigned', 'completed'],
      default: 'unassigned',
    },

    currentStep: { type: Number, enum: [0, 1, 2, 3], default: 0 },
  },
  { timestamps: true }
);

delete mongoose.models.Schedule; // ✅ 기존 모델 제거
export default mongoose.models.Schedule ||
  mongoose.model('Schedule', ScheduleSchema);

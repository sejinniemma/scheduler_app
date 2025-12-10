import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    groom: {
      type: String,
      required: true,
    },
    bride: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    memo: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'ongoing', 'upcoming', 'completed', 'canceled'],
      default: 'pending',
    },
    currentStep: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// tenantId + date 복합 인덱스
ScheduleSchema.index({ tenantId: 1, date: 1 });

export const Schedule =
  mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);


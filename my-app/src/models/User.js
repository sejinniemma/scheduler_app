import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ['PHOTOGRAPHER', 'ADMIN'],
      default: 'PHOTOGRAPHER',
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

// tenantId + phone 복합 인덱스 (멀티테넌트 고려)
UserSchema.index({ tenantId: 1, phone: 1 });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);

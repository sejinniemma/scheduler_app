import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ['PHOTOGRAPHER', 'ADMIN'],
      default: 'PHOTOGRAPHER',
    },
  },
  { timestamps: true }
);

delete mongoose.models.User; // ✅ 기존 모델 제거
export default mongoose.models.User || mongoose.model('User', UserSchema);

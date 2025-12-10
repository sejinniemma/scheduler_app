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
    address: { type: String, required: true },
    // 주 촬영 지역
    mainLocation: { type: String, required: true },
    // 차량 유무
    hasVehicle: { type: Boolean, default: false },
    startDate: { type: Date, required: true },
  },
  { timestamps: true }
);

delete mongoose.models.User; // ✅ 기존 모델 제거
export default mongoose.models.User || mongoose.model('User', UserSchema);

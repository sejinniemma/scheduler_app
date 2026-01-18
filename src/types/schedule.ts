export interface Schedule {
  id: string;
  mainUser: string;
  subUser?: string;
  groom: string;
  bride: string;
  time: string;
  userArrivalTime?: string; // 작가 도착 시간 (예: "10:30")
  location?: string;
  venue?: string;
  date: string;
  scheduledAt?: string | Date; // 로직/쿼리용: Date 객체 또는 ISO string
  memo?: string;
  status: string; // 'unassigned' | 'assigned' | 'confirmed'
  currentStep?: number;
  reportStatus?: string | null; // 현재 사용자의 Report 상태
  createdAt?: string;
  updatedAt?: string;
}

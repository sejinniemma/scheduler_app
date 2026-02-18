/**
 * 시간 단위 (밀리초) — 가독성용 상수
 */
export const TimeMs = {
  MIN: 60 * 1000,
  HOUR: 60 * 60 * 1000,
} as const;

/** 알림/지연 체크에 사용하는 시간 창 길이 (분) */
export const NOTIFICATION_WINDOW_MINUTES = 15;

/** YYYY-MM-DD 형식의 오늘 날짜 */
export function getToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** date + time 문자열을 Date로 파싱 (HH:mm 또는 HH:mm:ss) */
export function parseArrivalTime(date: string, timeStr: string): Date {
  const t = timeStr?.length === 5 ? `${timeStr}:00` : timeStr || '00:00:00';
  return new Date(`${date}T${t}`);
}

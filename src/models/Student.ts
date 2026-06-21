// models/Student.ts

export type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface ClassSession {
  id: number;
  date: string;
  isAttendanceOpen: boolean;
}

export interface StudentClass {
  id: number;
  name: string;
  recurrenceDays: Weekday[];
  startDate: string;
  endDate: string;
  sessions: ClassSession[];
}

// Decoded from a scanned QR payload: { qrToken, token, sessionId }
export interface ScannedQrPayload {
  qrToken: string;
  token: string;
  sessionId: number;
}

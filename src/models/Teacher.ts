// models/Teacher.ts

export type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface EnrollmentRef {
  id: number;
  studentId: number;
}

export interface ClassSession {
  id: number;
  date: string;
  isAttendanceOpen: boolean;
}

export interface TeacherClass {
  id: number;
  name: string;
  recurrenceDays: Weekday[];
  startDate: string;
  endDate: string;
  enrollments: EnrollmentRef[];
  sessions: ClassSession[];
}

export interface AttendanceRecord {
  userId: number;
  name: string;
  status: "PRESENT" | "ABSENT";
}

export interface SessionAttendance {
  sessionId: number;
  date: string;
  attendance: AttendanceRecord[];
}

// Returned by the QR microservice's /qr/start and /qr/active.
export interface QrSession {
  sessionId: number;
  classId: number;
  className: string;
  qrToken: string;
  currentToken: string;
  qrImage: string;
  expiresAt: number;
  startedAt: number;
}

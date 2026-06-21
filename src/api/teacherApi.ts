// src/api/teacherApi.ts
import { apiClient, qrClient } from "./config";
import type {
  TeacherClass,
  SessionAttendance,
  QrSession,
} from "../models/Teacher";

export const teacherApi = {
  // ======================
  // Classes / Sessions (main backend)
  // ======================

  async getMyClasses(): Promise<{ total: number; classes: TeacherClass[] }> {
    const res = await apiClient.get("/teacher/my-classes");
    return res.data;
  },

  async openAttendance(sessionId: number) {
    const res = await apiClient.post("/teacher/open-attendance", {
      sessionId,
    });
    return res.data;
  },

  async closeAttendance(sessionId: number) {
    const res = await apiClient.post("/teacher/close-attendance", {
      sessionId,
    });
    return res.data;
  },

  async getAttendance(sessionId: number): Promise<SessionAttendance> {
    const res = await apiClient.get("/teacher/attendance", {
      params: { sessionId },
    });
    return res.data;
  },

  // ======================
  // QR (standalone qr-attendance-service)
  // ======================

  async startQrSession(sessionId: number): Promise<QrSession> {
    const res = await qrClient.post("/qr/start", { sessionId });
    return res.data;
  },

  async stopQrSession(sessionId: number) {
    const res = await qrClient.post("/qr/stop", { sessionId });
    return res.data;
  },

  async getActiveQrSession(sessionId: number): Promise<QrSession | null> {
    try {
      const res = await qrClient.get("/qr/active", {
        params: { sessionId },
      });
      return res.data;
    } catch (err: any) {
      // The QR service returns 404 when no run is active for this
      // session — that's an expected, non-error state while polling.
      if (err?.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },
};

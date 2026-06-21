// src/api/studentApi.ts
import { apiClient, qrClient } from "./config";
import type { StudentClass } from "../models/Student";

export const studentApi = {
  // ======================
  // Classes / Sessions (main backend)
  // ======================

  async getMyClasses(): Promise<{ total: number; classes: StudentClass[] }> {
    const res = await apiClient.get("/student/my-classes");
    return res.data;
  },

  // Fallback path: marks attendance directly without going through a QR
  // scan. Only use this where there's some other proof of presence —
  // for a scanned QR code, use verifyQrScan below instead, which goes
  // through the QR microservice's token check.
  async markAttendance(sessionId: number) {
    const res = await apiClient.post("/student/mark-attendance", {
      sessionId,
    });
    return res.data;
  },

  // ======================
  // QR Attendance (standalone qr-attendance-service)
  // ======================

  async getActiveQrSession(sessionId: number) {
    try {
      const res = await qrClient.get("/qr/active", {
        params: { sessionId },
      });
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Verifies a scanned QR code and marks attendance. The QR service
   * forwards our Authorization header to the main backend, which
   * resolves who we are — we never send a studentId ourselves.
   */
  async verifyQrScan(payload: {
    sessionId: number;
    qrToken: string;
    token: string;
  }) {
    const res = await qrClient.post("/qr/verify", payload);
    return res.data;
  },
};

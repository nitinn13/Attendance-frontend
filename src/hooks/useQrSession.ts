import { useEffect, useRef, useState } from "react";
import { teacherApi } from "../api/teacherApi";
import type { QrSession } from "../models/Teacher";

interface UseQrSessionResult {
  qrState: QrSession | null;
  loading: boolean;
  error: string;
  presentCount: number | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

/**
 * Manages the lifecycle of a single QR run for a given session:
 * starting it, polling the QR service for the rotating image, polling
 * the main backend for a live present-count, and stopping it (either
 * on demand or automatically when the component unmounts).
 */
export function useQrSession(
  sessionId: number | null,
  options?: { stopOnUnmount?: boolean }
): UseQrSessionResult {
  const [qrState, setQrState] = useState<QrSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [presentCount, setPresentCount] = useState<number | null>(null);

  const qrStateRef = useRef<QrSession | null>(null);
  qrStateRef.current = qrState;

  const start = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError("");
    try {
      const session = await teacherApi.startQrSession(sessionId);
      setQrState(session);
    } catch (e: any) {
      console.error("Error starting QR session:", e);
      setError(
        e?.response?.data?.message ||
          "Failed to start QR. Make sure attendance is open for this session."
      );
    } finally {
      setLoading(false);
    }
  };

  const stop = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      await teacherApi.stopQrSession(sessionId);
    } catch (e) {
      console.error("Error stopping QR session:", e);
    } finally {
      setQrState(null);
      setPresentCount(null);
      setLoading(false);
    }
  };

  // Poll the QR service for the live, rotating QR image.
  useEffect(() => {
    if (!sessionId || !qrState) return;

    const interval = setInterval(async () => {
      try {
        const latest = await teacherApi.getActiveQrSession(sessionId);
        if (!latest) {
          setQrState(null);
          return;
        }
        setQrState(latest);
      } catch (e) {
        console.error("Error polling QR session:", e);
      }
    }, 2000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, qrState !== null]);

  // Poll the main backend's attendance roster for a live present-count.
  useEffect(() => {
    if (!sessionId || !qrState) return;

    const fetchCount = async () => {
      try {
        const data = await teacherApi.getAttendance(sessionId);
        setPresentCount(
          data.attendance.filter((a) => a.status === "PRESENT").length
        );
      } catch (e) {
        console.error("Error fetching live attendance count:", e);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, qrState !== null]);

  // Stop the run automatically if the consumer unmounts while it's live
  // (e.g. teacher navigates away mid-scan). Opt-out via options.
  useEffect(() => {
    return () => {
      if (options?.stopOnUnmount !== false && qrStateRef.current && sessionId) {
        teacherApi.stopQrSession(sessionId).catch((e) => {
          console.error("Failed to stop QR session on unmount:", e);
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return { qrState, loading, error, presentCount, start, stop };
}

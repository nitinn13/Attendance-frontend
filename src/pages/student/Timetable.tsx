import { useState, useEffect, useCallback, useMemo } from "react";
import QrScanner from "../../components/QrScanner";
import { studentApi } from "../../api/studentApi";
import type { StudentClass, ClassSession } from "../../models/Student";

interface SessionWithClass {
  session: ClassSession;
  classId: number;
  className: string;
}

interface ScannedPayload {
  qrToken: string;
  token: string;
  sessionId: number;
}

type MessageType = "success" | "error" | "info";

interface StatusMessage {
  text: string;
  type: MessageType;
}

// Secure local format converter
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const useClasses = () => {
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadClasses() {
      try {
        setLoading(true);
        setError(null);
        const data = await studentApi.getMyClasses();
        if (!mounted) return;
        setClasses(data.classes || []);
      } catch (err) {
        if (!mounted) return;
        console.error("Error loading classes:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load classes"
        );
        setClasses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadClasses();
    return () => {
      mounted = false;
    };
  }, []);

  return { classes, loading, error };
};

const QRScannerModal: React.FC<{
  target: SessionWithClass;
  message: StatusMessage | null;
  onScan: (result: string | null) => void;
  onClose: () => void;
}> = ({ target, message, onScan, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="relative bg-linear-to-r from-slate-900 to-indigo-950 px-6 py-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors group"
          >
            <svg
              className="w-5 h-5 group-hover:rotate-90 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl mb-3 backdrop-blur-sm text-indigo-300">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Scan Attendance QR
          </h2>
          <p className="text-indigo-200/80 text-xs font-medium mt-0.5">
            {target.className}
          </p>
        </div>

        <div className="p-6 bg-slate-50/50">
          <div className="relative mb-5 bg-white p-2 rounded-2xl border border-slate-100 shadow-inner">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-600 rounded-tl-lg z-10"></div>
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-600 rounded-tr-lg z-10"></div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-600 rounded-bl-lg z-10"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-600 rounded-br-lg z-10"></div>
            <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-900">
              <QrScanner
                onDecode={onScan}
                onError={(error) => console.error(error)}
              />
            </div>
          </div>

          {!message && (
            <div className="text-center mb-5 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Align scanner with the QR code on screen
            </div>
          )}

          {message && (
            <div
              className={`mb-5 rounded-xl p-4 border text-sm font-medium ${
                message.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : message.type === "error"
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-indigo-50 border-indigo-200 text-indigo-800"
              }`}
            >
              <div className="flex gap-2.5">
                <span className="mt-0.5">
                  {message.type === "success"
                    ? "✓"
                    : message.type === "error"
                    ? "✕"
                    : "ℹ"}
                </span>
                <p>{message.text}</p>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl transition-all active:scale-[0.99]"
          >
            Dismiss Scanner
          </button>
        </div>
      </div>
    </div>
  );
};

const SessionCard: React.FC<{
  item: SessionWithClass;
  hasAttendance: boolean;
  onRecordAttendance: (item: SessionWithClass) => void;
}> = ({ item, hasAttendance, onRecordAttendance }) => {
  const isActive = item.session.isAttendanceOpen;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5 mb-2 flex-wrap">
          <h2 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
            {item.className}
          </h2>
          {isActive && !hasAttendance && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 animate-pulse">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Session Open
            </span>
          )}
        </div>
        <p className="text-xs font-medium text-slate-400">
          Session Reference:{" "}
          <span className="font-mono bg-slate-50 px-1 py-0.5 rounded">
            #{item.session.id}
          </span>
        </p>
      </div>

      <div className="sm:self-center">
        {hasAttendance ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-semibold text-sm rounded-xl border border-emerald-100">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Present
          </div>
        ) : isActive ? (
          <button
            onClick={() => onRecordAttendance(item)}
            className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            Scan QR Code
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-400 font-medium text-sm rounded-xl border border-slate-100">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Locked
          </span>
        )}
      </div>
    </div>
  );
};

export default function Timetable() {
  const { classes, loading, error } = useClasses();
  const [attendance, setAttendance] = useState<Record<number, boolean>>({});
  const [scanning, setScanning] = useState(false);
  const [selectedTarget, setSelectedTarget] =
    useState<SessionWithClass | null>(null);
  const [message, setMessage] = useState<StatusMessage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string>(() =>
    formatLocalDate(new Date())
  );

  const handlePrevDate = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    setSelectedDate(formatLocalDate(current));
  };

  const handleNextDate = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    setSelectedDate(formatLocalDate(current));
  };

  // Flatten every class's sessions, scoped to the selected date — a
  // class is a recurring course now, so "today's timetable" means
  // "sessions across all my classes whose date matches today".
  const sessionsForSelectedDate: SessionWithClass[] = useMemo(() => {
    const result: SessionWithClass[] = [];
    for (const cls of classes) {
      for (const session of cls.sessions || []) {
        if (session.date.startsWith(selectedDate)) {
          result.push({ session, classId: cls.id, className: cls.name });
        }
      }
    }
    return result.sort((a, b) => a.className.localeCompare(b.className));
  }, [classes, selectedDate]);

  const handleScan = useCallback(
    async (result: string | null) => {
      if (!result || isProcessing || !selectedTarget) return;

      setIsProcessing(true);
      setMessage({ text: "Verifying QR code...", type: "info" });

      try {
        const parsed: ScannedPayload = JSON.parse(result);

        if (
          !parsed.sessionId ||
          !parsed.qrToken ||
          !parsed.token
        ) {
          throw new Error("This doesn't look like a valid attendance QR code.");
        }

        if (parsed.sessionId !== selectedTarget.session.id) {
          throw new Error(
            "This QR code is for a different class session."
          );
        }

        const data = await studentApi.verifyQrScan({
          sessionId: parsed.sessionId,
          qrToken: parsed.qrToken,
          token: parsed.token,
        });

        setAttendance((prev) => ({
          ...prev,
          [selectedTarget.session.id]: true,
        }));
        setMessage({
          text: data.message || "Attendance verified successfully!",
          type: "success",
        });

        setTimeout(() => {
          setScanning(false);
          setMessage(null);
          setSelectedTarget(null);
          setIsProcessing(false);
        }, 1800);
      } catch (err: any) {
        console.error(err);
        const text =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          (err instanceof Error ? err.message : "Verification failed");
        setMessage({ text, type: "error" });
        setIsProcessing(false);
        setTimeout(() => setMessage(null), 3000);
      }
    },
    [isProcessing, selectedTarget]
  );

  const handleRecordAttendance = useCallback((item: SessionWithClass) => {
    setSelectedTarget(item);
    setScanning(true);
    setIsProcessing(false);
    setMessage(null);
  }, []);

  const handleCloseScanner = useCallback(() => {
    setScanning(false);
    setSelectedTarget(null);
    setMessage(null);
    setIsProcessing(false);
  }, []);

  const legibleDateHeader = useMemo(() => {
    if (selectedDate === formatLocalDate(new Date())) return "Today";
    return new Date(selectedDate + "T00:00:00").toLocaleDateString(
      undefined,
      { weekday: "short", month: "short", day: "numeric" }
    );
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 space-y-8 font-sans antialiased text-slate-800">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 bg-linear-to-r from-slate-900 via-indigo-950 to-blue-900 bg-clip-text ">
            My Timetable
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Select a date to view and scan in for your sessions.
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start lg:self-center border border-slate-200/40">
          <button
            onClick={handlePrevDate}
            className="p-2.5 hover:bg-white rounded-lg text-slate-600 hover:text-indigo-600 transition-all active:scale-95"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="relative flex items-center gap-2 px-4 group cursor-pointer min-w-35 justify-center">
            <span className="text-sm font-bold text-slate-700 tracking-tight">
              {legibleDateHeader}
            </span>
            <svg
              className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
          </div>

          <button
            onClick={handleNextDate}
            className="p-2.5 hover:bg-white rounded-lg text-slate-600 hover:text-indigo-600 transition-all active:scale-95"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-4">
        {loading && (
          <div className="text-center py-20 bg-white border border-dashed rounded-2xl">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent" />
            <p className="mt-3 text-sm font-medium text-slate-500">
              Loading your schedule...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && sessionsForSelectedDate.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Sessions
            </h2>
            <div className="grid gap-4">
              {sessionsForSelectedDate.map((item) => (
                <SessionCard
                  key={item.session.id}
                  item={item}
                  hasAttendance={attendance[item.session.id] || false}
                  onRecordAttendance={handleRecordAttendance}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && !error && sessionsForSelectedDate.length === 0 && (
          <div className="text-center py-24 bg-white border border-dashed border-slate-200 rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-slate-700 font-bold text-base">
              No Sessions Today
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              You have no classes scheduled for this date.
            </p>
          </div>
        )}
      </main>

      {scanning && selectedTarget && (
        <QRScannerModal
          target={selectedTarget}
          message={message}
          onScan={handleScan}
          onClose={handleCloseScanner}
        />
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  CheckCircle2,
  Circle,
  QrCode,
  X,
  RefreshCw,
} from "lucide-react";
import { teacherApi } from "../../api/teacherApi";
import { useQrSession } from "../../hooks/useQrSession";
import type { TeacherClass, ClassSession } from "../../models/Teacher";

interface SessionWithClass {
  session: ClassSession;
  classId: number;
  className: string;
  enrolledCount: number;
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  // Pad single digits with a leading zero (months are 0-indexed)
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}
export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    toDateInputValue(new Date())
  );

  const [togglingSessionId, setTogglingSessionId] = useState<number | null>(
    null
  );

  // QR modal state
  const [qrSessionTarget, setQrSessionTarget] =
    useState<SessionWithClass | null>(null);

  const {
    qrState,
    loading: qrLoading,
    error: qrError,
    presentCount,
    start: startQr,
    stop: stopQr,
  } = useQrSession(qrSessionTarget?.session.id ?? null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await teacherApi.getMyClasses();
      setClasses(data.classes || []);
    } catch (e) {
      console.error(e);
      setError("Unable to load your classes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Flatten every class's sessions into a single list, scoped to the
  // selected date — a class is now a recurring course, so "today's
  // schedule" means "sessions across all my classes whose date matches".
  const sessionsForSelectedDate: SessionWithClass[] = useMemo(() => {
    const result: SessionWithClass[] = [];
    for (const cls of classes) {
      for (const session of cls.sessions || []) {
        if (session.date.startsWith(selectedDate)) {
          result.push({
            session,
            classId: cls.id,
            className: cls.name,
            enrolledCount: cls.enrollments?.length || 0,
          });
        }
      }
    }
    return result.sort((a, b) => a.className.localeCompare(b.className));
  }, [classes, selectedDate]);

  const handleToggleAttendance = async (item: SessionWithClass) => {
    try {
      setTogglingSessionId(item.session.id);
      if (item.session.isAttendanceOpen) {
        await teacherApi.closeAttendance(item.session.id);
      } else {
        await teacherApi.openAttendance(item.session.id);
      }
      await fetchClasses();
    } catch (e) {
      console.error(e);
      alert("Failed to update attendance status. Please try again.");
    } finally {
      setTogglingSessionId(null);
    }
  };

  const openQrModal = (item: SessionWithClass) => {
    setQrSessionTarget(item);
  };

  const closeQrModal = async () => {
    if (qrState) {
      await stopQr();
    }
    setQrSessionTarget(null);
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage attendance for your sessions
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date selector */}
        <div className="bg-white rounded-xl shadow-sm  p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className=" rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={() => setSelectedDate(toDateInputValue(new Date()))}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Today
            </button>
          </div>
          <p className="text-sm text-gray-500">
            {formatDateLabel(selectedDate)}
          </p>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-500">
            Loading your schedule...
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 rounded-lg p-6 text-center">
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchClasses}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && sessionsForSelectedDate.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm  p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">
              No sessions scheduled on this date.
            </p>
          </div>
        )}

        {!loading && !error && sessionsForSelectedDate.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessionsForSelectedDate.map((item) => {
              const isToggling = togglingSessionId === item.session.id;
              return (
                <div
                  key={item.session.id}
                  className="bg-white rounded-xl shadow-sm  overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {item.className}
                      </h3>
                      {item.session.isAttendanceOpen ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Open
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                          <Circle className="w-3.5 h-3.5" />
                          Closed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Users className="w-4 h-4" />
                      {item.enrolledCount} enrolled
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleAttendance(item)}
                        disabled={isToggling}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition disabled:opacity-50 ${
                          item.session.isAttendanceOpen
                            ? " -gray-300 text-gray-700 hover:bg-gray-50"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {isToggling
                          ? "Updating..."
                          : item.session.isAttendanceOpen
                          ? "Close"
                          : "Open Attendance"}
                      </button>

                      {item.session.isAttendanceOpen && (
                        <button
                          onClick={() => openQrModal(item)}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition"
                        >
                          <QrCode className="w-4 h-4" />
                          QR
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        navigate(`/teacher/attendance/${item.classId}`)
                      }
                      className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 transition"
                    >
                      View full class →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrSessionTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {qrSessionTarget.className}
                </h2>
                <p className="text-sm text-gray-500">
                  Scan to mark attendance
                </p>
              </div>
              <button
                onClick={closeQrModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-square bg-gray-50 rounded-xl  flex items-center justify-center mb-4 overflow-hidden">
              {qrState?.qrImage ? (
                <img
                  src={qrState.qrImage}
                  alt="Attendance QR code"
                  className="w-full h-full object-contain p-4"
                />
              ) : qrLoading ? (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="text-sm">Generating...</span>
                </div>
              ) : (
                <div className="text-center text-gray-400 px-6">
                  <QrCode className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">
                    Press "Start QR" to display a scannable code
                  </p>
                </div>
              )}
            </div>

            {qrError && (
              <p className="text-sm text-red-600 mb-3">{qrError}</p>
            )}

            {qrState && (
              <p className="text-sm text-gray-600 mb-4 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {presentCount !== null
                  ? `${presentCount} marked present so far`
                  : "Checking attendance..."}
              </p>
            )}

            <div className="flex gap-2">
              {!qrState ? (
                <button
                  onClick={startQr}
                  disabled={qrLoading}
                  className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {qrLoading ? "Starting..." : "Start QR"}
                </button>
              ) : (
                <button
                  onClick={stopQr}
                  disabled={qrLoading}
                  className="flex-1  -gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Stop QR
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

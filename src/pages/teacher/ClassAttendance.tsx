import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  CheckCircle2,
  Circle,
  ArrowLeft,
  QrCode,
} from "lucide-react";
import { teacherApi } from "../../api/teacherApi";
import type { TeacherClass, SessionAttendance } from "../../models/Teacher";

export default function ClassAttendance() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [classData, setClassData] = useState<TeacherClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );
  const [sessionAttendance, setSessionAttendance] =
    useState<SessionAttendance | null>(null);
  const [rosterLoading, setRosterLoading] = useState(false);

  const [togglingSessionId, setTogglingSessionId] = useState<number | null>(
    null
  );

  const fetchClass = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await teacherApi.getMyClasses();
      const found = data.classes.find((c) => c.id === Number(classId));
      if (!found) {
        setError("Class not found, or you don't have access to it.");
        return;
      }
      setClassData(found);
    } catch (e) {
      console.error(e);
      setError("Unable to load this class. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClass();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const sortedSessions = useMemo(() => {
    if (!classData) return [];
    return [...classData.sessions].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [classData]);

  const fetchRoster = async (sessionId: number) => {
    try {
      setRosterLoading(true);
      const data = await teacherApi.getAttendance(sessionId);
      setSessionAttendance(data);
    } catch (e) {
      console.error(e);
      setSessionAttendance(null);
    } finally {
      setRosterLoading(false);
    }
  };

  const handleSelectSession = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    fetchRoster(sessionId);
  };

  const handleToggleAttendance = async (
    sessionId: number,
    currentlyOpen: boolean
  ) => {
    try {
      setTogglingSessionId(sessionId);
      if (currentlyOpen) {
        await teacherApi.closeAttendance(sessionId);
      } else {
        await teacherApi.openAttendance(sessionId);
      }
      await fetchClass();
      if (selectedSessionId === sessionId) {
        await fetchRoster(sessionId);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update attendance status. Please try again.");
    } finally {
      setTogglingSessionId(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading class...</p>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-red-50 rounded-lg p-6 text-center max-w-md">
          <p className="text-red-700 mb-4">{error || "Class not found."}</p>
          <button
            onClick={() => navigate("/teacher/my-classes")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            Back to My Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate("/teacher/my-classes")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Classes
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {classData.name}
          </h1>
          <p className="text-gray-600 mt-1">
            {classData.enrollments.length} enrolled ·{" "}
            {classData.sessions.length} sessions
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-[360px_1fr] gap-6">
        {/* Sessions list */}
        <div className="bg-white rounded-xl shadow-sm verflow-hidden h-fit">
          <div className="px-5 py-4  font-semibold text-gray-900">
            Sessions
          </div>
          <div className="max-h-[70vh] overflow-y-auto divide-y">
            {sortedSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition-colors ${
                  selectedSessionId === session.id
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDate(session.date)}
                </span>
                {session.isAttendanceOpen ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Open
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                    <Circle className="w-3.5 h-3.5" />
                    Closed
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Selected session detail */}
        <div className="bg-white rounded-xl shadow-sm -6">
          {!selectedSessionId ? (
            <div className="text-center py-16 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-3" />
              <p>Select a session to view or manage attendance.</p>
            </div>
          ) : (
            (() => {
              const session = sortedSessions.find(
                (s) => s.id === selectedSessionId
              )!;
              const isToggling = togglingSessionId === session.id;

              return (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {formatDate(session.date)}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {session.isAttendanceOpen
                          ? "Attendance is open"
                          : "Attendance is closed"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleToggleAttendance(
                            session.id,
                            session.isAttendanceOpen
                          )
                        }
                        disabled={isToggling}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 ${
                          session.isAttendanceOpen
                            ? "text-gray-700 hover:bg-gray-50"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {isToggling
                          ? "Updating..."
                          : session.isAttendanceOpen
                          ? "Close Attendance"
                          : "Open Attendance"}
                      </button>

                      {session.isAttendanceOpen && (
                        <button
                          onClick={() =>
                            navigate(
                              `/teacher/qr/${session.id}`
                            )
                          }
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition"
                        >
                          <QrCode className="w-4 h-4" />
                          Start QR
                        </button>
                      )}
                    </div>
                  </div>

                  {rosterLoading ? (
                    <p className="text-gray-400 text-sm py-8 text-center">
                      Loading roster...
                    </p>
                  ) : !sessionAttendance ? (
                    <p className="text-gray-400 text-sm py-8 text-center">
                      No data available for this session.
                    </p>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <Users className="w-4 h-4" />
                        {
                          sessionAttendance.attendance.filter(
                            (a) => a.status === "PRESENT"
                          ).length
                        }{" "}
                        / {sessionAttendance.attendance.length} present
                      </div>
                      <div className="divide-y ounded-lg overflow-hidden">
                        {sessionAttendance.attendance.map((record) => (
                          <div
                            key={record.userId}
                            className="flex items-center justify-between px-4 py-2.5"
                          >
                            <span className="text-sm text-gray-800">
                              {record.name}
                            </span>
                            <span
                              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                record.status === "PRESENT"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {record.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}

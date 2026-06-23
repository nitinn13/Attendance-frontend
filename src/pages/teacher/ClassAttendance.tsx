import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  CheckCircle2,
  Circle,
  ArrowLeft,
  QrCode,
  Search,
  Filter,
} from "lucide-react";
import { teacherApi } from "../../api/teacherApi";
import type { TeacherClass, SessionAttendance } from "../../models/Teacher";

type FilterStatus = "ALL" | "PRESENT" | "ABSENT";

export default function ClassAttendance() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [classData, setClassData] = useState<TeacherClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [sessionAttendance, setSessionAttendance] = useState<SessionAttendance | null>(null);
  const [rosterLoading, setRosterLoading] = useState(false);

  const [togglingSessionId, setTogglingSessionId] = useState<number | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");

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
    return [...classData.sessions].sort((a, b) => a.date.localeCompare(b.date));
  }, [classData]);

  // Client-side filtering logic for the roster
  const filteredRoster = useMemo(() => {
    if (!sessionAttendance) return [];
    
    return sessionAttendance.attendance.filter((record) => {
      const matchesSearch = record.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || 
        record.status.toUpperCase() === statusFilter;
        
      return matchesSearch && matchesStatus;
    });
  }, [sessionAttendance, searchQuery, statusFilter]);

  const fetchRoster = async (sessionId: number) => {
    try {
      setRosterLoading(true);
      // Reset filter states when switching sessions
      setSearchQuery("");
      setStatusFilter("ALL");
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

  const handleToggleAttendance = async (sessionId: number, currentlyOpen: boolean) => {
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
        <div className="animate-pulse text-gray-500 font-medium">Loading class...</div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-red-50 rounded-lg p-6 text-center max-w-md border border-red-100 shadow-sm">
          <p className="text-red-700 font-medium mb-4">{error || "Class not found."}</p>
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
      {/* Top Navigation / Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate("/teacher/my-classes")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Classes
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{classData.name}</h1>
          <p className="text-gray-600 mt-1">
            {classData.enrollments.length} enrolled · {classData.sessions.length} sessions
          </p>
        </div>
      </div>

      {/* Main Dashboard Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-[360px_1fr] gap-6">
        
        {/* Left Column: Sessions List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
          <div className="px-5 py-4 font-bold text-gray-900 border-b border-gray-100 bg-gray-50/50">
            Sessions
          </div>
          <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-100">
            {sortedSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition-colors ${
                  selectedSessionId === session.id
                    ? "bg-blue-50/70 border-l-4 border-blue-600 pl-4"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDate(session.date)}
                </span>
                {session.isAttendanceOpen ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Open
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
                    <Circle className="w-3.5 h-3.5" />
                    Closed
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Active Session Management & Roster */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {!selectedSessionId ? (
            <div className="text-center py-24 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-base font-medium">Select a session to view or manage attendance.</p>
            </div>
          ) : (
            (() => {
              const session = sortedSessions.find((s) => s.id === selectedSessionId)!;
              const isToggling = togglingSessionId === session.id;
              const totalPresent = sessionAttendance?.attendance.filter((a) => a.status === "PRESENT").length || 0;
              const totalStudents = sessionAttendance?.attendance.length || 0;

              return (
                <div>
                  {/* Active Session Title Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-100 mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{formatDate(session.date)}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block w-2 h-2 rounded-full ${session.isAttendanceOpen ? "bg-green-500" : "bg-gray-400"}`} />
                        <p className="text-sm text-gray-500">
                          {session.isAttendanceOpen ? "Attendance is actively open" : "Attendance window closed"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        onClick={() => handleToggleAttendance(session.id, session.isAttendanceOpen)}
                        disabled={isToggling}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-sm border transition disabled:opacity-50 ${
                          session.isAttendanceOpen
                            ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            : "bg-blue-600 text-white border-transparent hover:bg-blue-700"
                        }`}
                      >
                        {isToggling ? "Updating..." : session.isAttendanceOpen ? "Close Attendance" : "Open Attendance"}
                      </button>

                      {session.isAttendanceOpen && (
                        <button
                          onClick={() => navigate(`/teacher/qr/${session.id}`)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition shadow-sm"
                        >
                          <QrCode className="w-4 h-4" />
                          Start QR
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Roster Layout & States */}
                  {rosterLoading ? (
                    <div className="text-center py-16 text-gray-400">
                      <div className="animate-pulse font-medium">Loading session roster...</div>
                    </div>
                  ) : !sessionAttendance ? (
                    <p className="text-gray-400 text-sm py-16 text-center">
                      No data available for this session.
                    </p>
                  ) : (
                    <div>
                      {/* Search Bar and Roster Filter Toolbar */}
                      <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-center mb-6">
                        {/* Text Search Input */}
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search students by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        {/* Status Filter Segment */}
                        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg border border-gray-200">
                          {(["ALL", "PRESENT", "ABSENT"] as FilterStatus[]).map((status) => (
                            <button
                              key={status}
                              onClick={() => setStatusFilter(status)}
                              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                                statusFilter === status
                                  ? "bg-white text-gray-900 shadow-sm"
                                  : "text-gray-500 hover:text-gray-700"
                              }`}
                            >
                              {status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Headcount Stat Summary */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-100 mb-4">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>
                          Showing {filteredRoster.length} of {totalStudents} students (
                          <strong className="text-blue-700">{totalPresent}</strong> present)
                        </span>
                      </div>

                      {/* Roster Stream / List Table */}
                      {filteredRoster.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg text-gray-400">
                          <Filter className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm font-medium">No results found matching your active filters.</p>
                        </div>
                      ) : (
                        <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100 shadow-sm">
                          {filteredRoster.map((record) => (
                            <div
                              key={record.userId}
                              className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60 transition-colors"
                            >
                              <span className="text-sm font-medium text-gray-800">
                                {record.name}
                              </span>
                              <span
                                className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                                  record.status === "PRESENT"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-red-50 text-red-600 border-red-100"
                                }`}
                              >
                                {record.status.toUpperCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
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
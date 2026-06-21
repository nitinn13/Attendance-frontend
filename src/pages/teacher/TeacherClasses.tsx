import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Calendar, CheckCircle2 } from "lucide-react";
import { teacherApi } from "../../api/teacherApi";
import type { TeacherClass, Weekday } from "../../models/Teacher";

const WEEKDAY_LABELS: Record<Weekday, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

const TeacherClasses = () => {
  const navigate = useNavigate();

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function getTeacherClasses() {
    setIsLoading(true);
    setError("");

    try {
      const data = await teacherApi.getMyClasses();
      setClasses(data.classes || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
      setError("Unable to load your classes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getTeacherClasses();
  }, []);

  const formatDateRange = (cls: TeacherClass) => {
    const start = new Date(cls.startDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const end = new Date(cls.endDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${start} – ${end}`;
  };

  const formatWeekdays = (days: Weekday[]) =>
    days.map((d) => WEEKDAY_LABELS[d]).join(", ");

  const openSessionsToday = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return (cls: TeacherClass) =>
      cls.sessions?.some(
        (s) => s.date.startsWith(todayStr) && s.isAttendanceOpen
      );
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
            <p className="text-gray-600 mt-1">
              Manage your classes and track attendance
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Classes</p>
              <p className="text-3xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg
                className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-gray-600">Loading your classes...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={getTeacherClasses}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && classes.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Classes Yet
            </h3>
            <p className="text-gray-600">
              Classes you're assigned to will appear here.
            </p>
          </div>
        )}

        {/* Classes Grid */}
        {!isLoading && !error && classes.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Card Header */}
                <div className="bg-linear-to-r from-blue-500 to-blue-600 p-6 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <BookOpen className="w-8 h-8" />
                    {openSessionsToday(classItem) && (
                      <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Open Today
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{classItem.name}</h3>
                  <p className="text-blue-100 text-sm">
                    {formatWeekdays(classItem.recurrenceDays)}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Student Count */}
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Enrolled Students
                        </p>
                        <p className="font-semibold text-lg">
                          {classItem.enrollments?.length || 0}
                        </p>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Schedule</p>
                        <p className="font-semibold">
                          {formatDateRange(classItem)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {classItem.sessions?.length ?? 0} sessions total
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6">
                    <button
                      onClick={() =>
                        navigate(`/teacher/attendance/${classItem.id}`)
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition"
                    >
                      View Sessions
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherClasses;

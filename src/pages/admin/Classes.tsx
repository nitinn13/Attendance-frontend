// src/views/admin/Classes.tsx

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  BookOpen,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  CheckCircle2,
  Circle,
  Users,
  UserPlus,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Check,
} from "lucide-react";
import { adminApi } from "../../api/adminApi";

interface User {
  userId: number;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  createdAt: string;
}

interface Teacher {
  userId: number;
  name: string;
  email: string;
}

interface SessionData {
  id: number;
  classId: number;
  date: string;
  isAttendanceOpen: boolean;
}

interface ClassData {
  id: number;
  name: string;
  teacherId: number;
  recurrenceDays: Weekday[];
  startDate: string;
  endDate: string;
  teacher: Teacher;
  enrollments: any[];
  sessions: SessionData[];
}

interface Enrollment {
  id: number;
  classId: number;
  studentId: number;
  class: { id: number; name: string };
  student: {
    userId: number;
    name: string;
    email: string;
    role: string;
  };
}

interface CsvEnrollResult {
  message: string;
  totalRowsInFile: number;
  newlyEnrolled: number;
  alreadyEnrolled: string[];
  notFound: string[];
  wrongRole: string[];
}

const WEEKDAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

type Weekday = (typeof WEEKDAYS)[number];

const WEEKDAY_LABELS: Record<Weekday, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

export default function Classes() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [entriesPerPage, setEntriesPerPage] =
    useState(10);

  const [showModal, setShowModal] =
    useState(false);

  const [className, setClassName] =
    useState("");

  const [teacherId, setTeacherId] =
    useState<number | "">("");

  const [recurrenceDays, setRecurrenceDays] =
    useState<Weekday[]>([]);

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  const [createError, setCreateError] =
    useState<string | null>(null);

  const [sessionsPanelClass, setSessionsPanelClass] =
    useState<ClassData | null>(null);

  // ===== Roster panel (replaces the old standalone Enrollments page) =====

  const [rosterClass, setRosterClass] =
    useState<ClassData | null>(null);

  const [rosterSearch, setRosterSearch] =
    useState("");

  const [showEnrollModal, setShowEnrollModal] =
    useState(false);

  const [modalStudentSearch, setModalStudentSearch] =
    useState("");

  const [selectedStudentIds, setSelectedStudentIds] =
    useState<number[]>([]);

  const [submitting, setSubmitting] =
    useState(false);

  const [showBulkConfirm, setShowBulkConfirm] =
    useState(false);

  const [showCsvModal, setShowCsvModal] =
    useState(false);

  const [csvFile, setCsvFile] =
    useState<File | null>(null);

  const [csvSubmitting, setCsvSubmitting] =
    useState(false);

  const [csvResult, setCsvResult] =
    useState<CsvEnrollResult | null>(null);

  const [csvError, setCsvError] =
    useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [classesRes, teachersRes, studentsRes, enrollmentsRes] =
        await Promise.all([
          adminApi.getAllClasses(),
          adminApi.getAllTeachers(),
          adminApi.getAllStudents(),
          adminApi.getAllEnrollments(),
        ]);

      setClasses(classesRes || []);
      setTeachers(teachersRes.teachers || []);
      setStudents(studentsRes.students || []);
      setEnrollments(enrollmentsRes || []);
    } catch (error) {
      console.error(
        "Failed to fetch classes:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleWeekday = (day: Weekday) => {
    setRecurrenceDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const handleCreateClass = async () => {
    setCreateError(null);

    if (
      !className.trim() ||
      !teacherId ||
      recurrenceDays.length === 0 ||
      !startDate ||
      !endDate
    ) {
      setCreateError(
        "Please fill all fields and select at least one weekday"
      );
      return;
    }

    if (endDate < startDate) {
      setCreateError(
        "End date must be on or after start date"
      );
      return;
    }

    try {
      setCreating(true);

      await adminApi.createClass(
        className.trim(),
        Number(teacherId),
        recurrenceDays,
        startDate,
        endDate
      );

      setClassName("");
      setTeacherId("");
      setRecurrenceDays([]);
      setStartDate("");
      setEndDate("");
      setShowModal(false);

      await fetchData();
    } catch (error: any) {
      console.error(
        "Create class error:",
        error
      );

      setCreateError(
        error?.response?.data?.message ||
          "Failed to create class"
      );
    } finally {
      setCreating(false);
    }
  };

  const filteredClasses =
    useMemo(() => {
      const search =
        searchTerm.toLowerCase();

      return classes.filter(
        (cls) =>
          cls.name
            ?.toLowerCase()
            .includes(search) ||
          cls.teacher?.name
            ?.toLowerCase()
            .includes(search) ||
          cls.id
            .toString()
            .includes(search)
      );
    }, [classes, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredClasses.length /
      entriesPerPage
    )
  );

  const paginatedClasses =
    filteredClasses.slice(
      (currentPage - 1) *
      entriesPerPage,
      currentPage *
      entriesPerPage
    );

  const formatDateRange = (cls: ClassData) => {
    const start = new Date(cls.startDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    const end = new Date(cls.endDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${start} – ${end}`;
  };

  const formatWeekdays = (days: Weekday[]) =>
    days.map((d) => WEEKDAY_LABELS[d]).join(", ");

  const openSessionsCount = (cls: ClassData) =>
    cls.sessions?.filter((s) => s.isAttendanceOpen).length ?? 0;

  // ===== Roster panel logic =====

  const rosterEnrollments = useMemo(() => {
    if (!rosterClass) return [];
    return enrollments.filter((e) => e.classId === rosterClass.id);
  }, [enrollments, rosterClass]);

  const filteredRoster = useMemo(() => {
    const search = rosterSearch.toLowerCase();
    if (!search) return rosterEnrollments;
    return rosterEnrollments.filter(
      (e) =>
        e.student.name.toLowerCase().includes(search) ||
        e.student.email.toLowerCase().includes(search)
    );
  }, [rosterEnrollments, rosterSearch]);

  const openRoster = (cls: ClassData) => {
    setRosterClass(cls);
    setRosterSearch("");
  };

  const closeRoster = () => {
    setRosterClass(null);
    setRosterSearch("");
    setShowEnrollModal(false);
    setShowCsvModal(false);
    setShowBulkConfirm(false);
  };

  // Students not yet enrolled in the open roster's class.
  const enrollableStudents = useMemo(() => {
    if (!rosterClass) return [];
    const enrolledIds = new Set(
      rosterEnrollments.map((e) => e.studentId)
    );
    return students.filter(
      (s) => s.role === "STUDENT" && !enrolledIds.has(s.userId)
    );
  }, [students, rosterEnrollments, rosterClass]);

  const searchableModalStudents = useMemo(() => {
    if (!modalStudentSearch) return enrollableStudents;
    const search = modalStudentSearch.toLowerCase();
    return enrollableStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search)
    );
  }, [enrollableStudents, modalStudentSearch]);

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = searchableModalStudents.map((s) => s.userId);
    const allSelected = visibleIds.every((id) =>
      selectedStudentIds.includes(id)
    );

    if (allSelected) {
      setSelectedStudentIds((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedStudentIds((prev) =>
        Array.from(new Set([...prev, ...visibleIds]))
      );
    }
  };

  const handleEnrollStudents = async () => {
    if (!rosterClass || selectedStudentIds.length === 0) return;

    try {
      setSubmitting(true);
      await adminApi.enrollMultipleStudents(
        rosterClass.id,
        selectedStudentIds
      );
      setShowEnrollModal(false);
      setSelectedStudentIds([]);
      setModalStudentSearch("");
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to enroll students");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnrollAll = async () => {
    if (!rosterClass) return;

    try {
      setSubmitting(true);
      await adminApi.enrollAllStudents(rosterClass.id);
      setShowBulkConfirm(false);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to enroll all students");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCsvFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    setCsvResult(null);
    setCsvError(null);

    if (file && !file.name.toLowerCase().endsWith(".csv")) {
      setCsvError("Please select a .csv file");
      setCsvFile(null);
      return;
    }

    setCsvFile(file);
  };

  const handleCsvSubmit = async () => {
    if (!rosterClass || !csvFile) return;

    try {
      setCsvSubmitting(true);
      setCsvError(null);

      const data = await adminApi.enrollByCsv(rosterClass.id, csvFile);

      setCsvResult(data);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      setCsvError(
        err?.response?.data?.message ||
          "Failed to enroll students from CSV"
      );
    } finally {
      setCsvSubmitting(false);
    }
  };

  const resetCsvModal = () => {
    setShowCsvModal(false);
    setCsvFile(null);
    setCsvResult(null);
    setCsvError(null);
    setCsvSubmitting(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Class Management
          </h1>

          <p className="text-gray-500 mt-1">
            Manage classes and
            teachers
          </p>
        </div>

        <button
          onClick={() =>
            setShowModal(true)
          }
          className="flex items-center gap-2 px-4 py-2 bg-[#6d1d5e] text-white rounded-lg hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Create Class
        </button>
      </div>

      {/* Stats */}

      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm  p-6 max-w-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Total Classes
              </p>

              <h2 className="text-3xl font-bold text-gray-900">
                {classes.length}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}

      <div className="bg-white rounded-xl shadow-sm  overflow-hidden">
        {/* Toolbar */}

        <div className="p-5 -b flex flex-col lg:flex-row gap-4 justify-between">
          <div>
            <h2 className="font-semibold text-lg">
              All Classes
            </h2>
          </div>

          <div className="flex gap-3">
            <select
              value={
                entriesPerPage
              }
              onChange={(e) => {
                setEntriesPerPage(
                  Number(
                    e.target.value
                  )
                );

                setCurrentPage(1);
              }}
              className=" rounded-lg px-3 py-2 text-sm"
            >
              <option value={10}>
                10
              </option>

              <option value={25}>
                25
              </option>

              <option value={50}>
                50
              </option>
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />

              <input
                type="text"
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2  rounded-lg w-72"
              />
            </div>
          </div>
        </div>

        {/* Table */}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 -b">
              <tr>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Class Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Schedule
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Teacher
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Students
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Sessions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : paginatedClasses.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-gray-500"
                  >
                    No classes found
                  </td>
                </tr>
              ) : (
                paginatedClasses.map(
                  (cls) => (
                    <tr
                      key={cls.id}
                      className="-b hover:bg-gray-50 transition"
                    >

                      <td className="px-6 py-4">
                        {cls.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDateRange(cls)}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {formatWeekdays(cls.recurrenceDays)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {
                          cls.teacher
                            ?.name
                        }
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => openRoster(cls)}
                          className="flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-lg bg-blue-100 hover:bg-blue-300 text-sm transition-colors"
                        >
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {cls.enrollments?.length ?? 0}
                          </span>
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSessionsPanelClass(cls)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer bg-blue-100 hover:bg-blue-300 text-sm transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {cls.sessions?.length ?? 0}
                          </span>
                          {openSessionsCount(cls) > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              {openSessionsCount(cls)} open
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}

        <div className="-t px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing{" "}
            {
              paginatedClasses.length
            }{" "}
            of{" "}
            {
              filteredClasses.length
            }{" "}
            classes
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (prev) =>
                    prev - 1
                )
              }
              className="p-2  rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 text-sm">
              Page{" "}
              {
                currentPage
              }{" "}
              of{" "}
              {
                totalPages
              }
            </span>

            <button
              disabled={
                currentPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (prev) =>
                    prev + 1
                )
              }
              className="p-2  rounded-lg disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Class Modal */}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-5">
              Create Class
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Class Name
                </label>

                <input
                  type="text"
                  value={className}
                  onChange={(e) =>
                    setClassName(
                      e.target.value
                    )
                  }
                  placeholder="Enter class name"
                  className="w-full  rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Meets On
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {WEEKDAYS.map((day) => {
                    const active = recurrenceDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWeekday(day)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold  transition-colors ${
                          active
                            ? "bg-[#6d1d5e] text-white -[#6d1d5e]"
                            : "bg-white text-gray-600 -gray-300 hover:-gray-400"
                        }`}
                      >
                        {WEEKDAY_LABELS[day]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                      setStartDate(e.target.value)
                    }
                    className="w-full  rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) =>
                      setEndDate(e.target.value)
                    }
                    className="w-full  rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Teacher
                </label>

                <select
                  value={teacherId}
                  onChange={(e) =>
                    setTeacherId(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full  rounded-lg px-3 py-2"
                >
                  <option value="">
                    Select Teacher
                  </option>

                  {teachers.map(
                    (
                      teacher
                    ) => (
                      <option
                        key={
                          teacher.userId
                        }
                        value={
                          teacher.userId
                        }
                      >
                        {
                          teacher.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {createError && (
                <p className="text-sm text-red-600">
                  {createError}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setCreateError(null);
                }}
                className="px-4 py-2  rounded-lg"
              >
                Cancel
              </button>

              <button
                disabled={creating}
                onClick={
                  handleCreateClass
                }
                className="px-4 py-2 bg-[#6d1d5e] text-white rounded-lg disabled:opacity-50"
              >
                {creating
                  ? "Creating..."
                  : "Create Class"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions Panel */}

      {sessionsPanelClass && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh]">
            <div className="p-6 -b flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {sessionsPanelClass.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {formatWeekdays(sessionsPanelClass.recurrenceDays)} ·{" "}
                  {formatDateRange(sessionsPanelClass)}
                </p>
              </div>
              <button
                onClick={() => setSessionsPanelClass(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-3">
              {sessionsPanelClass.sessions?.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-12">
                  No sessions found for this class.
                </p>
              ) : (
                <div className="space-y-1">
                  {sessionsPanelClass.sessions?.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50"
                    >
                      <span className="text-sm text-gray-700">
                        {new Date(session.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {session.isAttendanceOpen ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Open
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                          <Circle className="w-3.5 h-3.5" />
                          Closed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 -t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setSessionsPanelClass(null)}
                className="w-full px-4 py-2  bg-white rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roster Side Panel */}

      {rosterClass && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeRoster}
          />

          <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {rosterClass.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {rosterEnrollments.length} students enrolled
                </p>
              </div>
              <button
                onClick={closeRoster}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions */}
            <div className="p-4 flex gap-2 flex-wrap">
              <button
                onClick={() => setShowEnrollModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#6d1d5e] text-white text-sm font-semibold hover:opacity-90 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Enroll Students
              </button>
              <button
                onClick={() => setShowBulkConfirm(true)}
                className="px-3 py-2 rounded-lg border bg-white text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Enroll All
              </button>
              <button
                onClick={() => setShowCsvModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-white text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload CSV
              </button>
            </div>

            {/* Search */}
            <div className="p-4 ">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search enrolled students..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm"
                />
              </div>
            </div>

            {/* Roster list */}
            <div className="flex-1 overflow-y-auto">
              {filteredRoster.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-16">
                  {rosterEnrollments.length === 0
                    ? "No students enrolled yet."
                    : "No students match your search."}
                </p>
              ) : (
                <div className="divide-y">
                  {filteredRoster.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="px-6 py-3.5 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {enrollment.student.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {enrollment.student.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Enroll Students Modal (scoped to rosterClass) */}
          {showEnrollModal && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 p-6">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
                <div className="p-5 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">
                    Enroll Students — {rosterClass.name}
                  </h3>
                  <button
                    onClick={() => {
                      setShowEnrollModal(false);
                      setSelectedStudentIds([]);
                      setModalStudentSearch("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={modalStudentSearch}
                      onChange={(e) =>
                        setModalStudentSearch(e.target.value)
                      }
                      className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm"
                    />
                  </div>
                  {searchableModalStudents.length > 0 && (
                    <button
                      onClick={handleSelectAllVisible}
                      className="text-xs text-[#6d1d5e] font-semibold mt-2 hover:underline"
                    >
                      {searchableModalStudents.every((s) =>
                        selectedStudentIds.includes(s.userId)
                      )
                        ? "Deselect all"
                        : "Select all visible"}
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto flex-1">
                  {searchableModalStudents.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-12">
                      {enrollableStudents.length === 0
                        ? "All students are already enrolled."
                        : "No students match your search."}
                    </p>
                  ) : (
                    <div className="divide-y">
                      {searchableModalStudents.map((student) => {
                        const checked = selectedStudentIds.includes(
                          student.userId
                        );
                        return (
                          <label
                            key={student.userId}
                            className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                toggleStudentSelection(student.userId)
                              }
                              className="rounded"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {student.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {student.email}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="p-4 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowEnrollModal(false);
                      setSelectedStudentIds([]);
                      setModalStudentSearch("");
                    }}
                    className="px-4 py-2 border rounded-lg text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={
                      submitting || selectedStudentIds.length === 0
                    }
                    onClick={handleEnrollStudents}
                    className="px-4 py-2 bg-[#6d1d5e] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    {submitting
                      ? "Processing..."
                      : `Enroll Selected (${selectedStudentIds.length})`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enroll All Confirm (scoped to rosterClass) */}
          {showBulkConfirm && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 p-6">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Enroll All Students
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  This will enroll every student in the system into{" "}
                  <span className="font-medium text-gray-700">
                    {rosterClass.name}
                  </span>
                  . Students already enrolled will be skipped.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowBulkConfirm(false)}
                    className="px-4 py-2 border rounded-lg text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={submitting}
                    onClick={handleEnrollAll}
                    className="px-4 py-2 bg-[#6d1d5e] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    {submitting ? "Enrolling..." : "Enroll All"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CSV Upload Modal (scoped to rosterClass) */}
          {showCsvModal && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 p-6">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh]">
                <div className="p-5 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Upload CSV — {rosterClass.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Enroll students in bulk using a CSV of email
                      addresses.
                    </p>
                  </div>
                  <button
                    onClick={resetCsvModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 overflow-y-auto flex-1 space-y-4">
                  {csvResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 bg-green-50 text-green-800 px-4 py-3 rounded-lg">
                        <Check className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-semibold">
                          {csvResult.newlyEnrolled} of{" "}
                          {csvResult.totalRowsInFile} students enrolled
                          successfully.
                        </p>
                      </div>

                      {csvResult.alreadyEnrolled.length > 0 && (
                        <div className="text-sm">
                          <p className="font-semibold text-gray-700 mb-1">
                            Already enrolled (
                            {csvResult.alreadyEnrolled.length})
                          </p>
                          <div className="bg-gray-50 border rounded-lg p-3 max-h-24 overflow-y-auto text-gray-600 space-y-0.5">
                            {csvResult.alreadyEnrolled.map((email) => (
                              <p key={email} className="truncate">
                                {email}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {csvResult.wrongRole.length > 0 && (
                        <div className="text-sm">
                          <p className="font-semibold text-gray-700 mb-1">
                            Not a student account (
                            {csvResult.wrongRole.length})
                          </p>
                          <div className="bg-gray-50 border rounded-lg p-3 max-h-24 overflow-y-auto text-gray-600 space-y-0.5">
                            {csvResult.wrongRole.map((email) => (
                              <p key={email} className="truncate">
                                {email}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {csvResult.notFound.length > 0 && (
                        <div className="text-sm">
                          <p className="font-semibold text-gray-700 mb-1">
                            Not found ({csvResult.notFound.length})
                          </p>
                          <div className="bg-gray-50 border rounded-lg p-3 max-h-24 overflow-y-auto text-gray-600 space-y-0.5">
                            {csvResult.notFound.map((email) => (
                              <p key={email} className="truncate">
                                {email}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <label
                        htmlFor="csv-file-input"
                        className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-8 px-4 cursor-pointer hover:border-[#6d1d5e]/40 hover:bg-gray-50 transition-colors"
                      >
                        <FileSpreadsheet className="w-8 h-8 text-gray-400" />
                        {csvFile ? (
                          <p className="text-sm font-semibold text-gray-700">
                            {csvFile.name}
                          </p>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-gray-600">
                              Click to select a CSV file
                            </p>
                            <p className="text-xs text-gray-400">
                              One email address per row
                            </p>
                          </>
                        )}
                        <input
                          id="csv-file-input"
                          type="file"
                          accept=".csv,text/csv"
                          onChange={handleCsvFileChange}
                          className="hidden"
                        />
                      </label>

                      {csvError && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <p>{csvError}</p>
                        </div>
                      )}

                      <p className="text-xs text-gray-400">
                        The file should contain one email per line. A
                        header row (e.g. "email") is optional. Students
                        not found, already enrolled, or without a
                        student account will be skipped and listed in
                        the results.
                      </p>
                    </>
                  )}
                </div>

                <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
                  {csvResult ? (
                    <button
                      onClick={resetCsvModal}
                      className="px-5 py-2.5 bg-[#6d1d5e] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-colors"
                    >
                      Done
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={resetCsvModal}
                        className="px-4 py-2.5 border bg-white rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={csvSubmitting || !csvFile}
                        onClick={handleCsvSubmit}
                        className="px-5 py-2.5 bg-[#6d1d5e] text-white rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                      >
                        {csvSubmitting ? "Uploading..." : "Upload & Enroll"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
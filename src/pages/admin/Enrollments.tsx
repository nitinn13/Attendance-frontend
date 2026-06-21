import { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  FileSpreadsheet,
  X,
  AlertCircle,
} from "lucide-react";
import { adminApi } from "../../api/adminApi";

interface Student {
  userId: number;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
}

interface ClassData {
  id: number;
  name: string;
}

interface Enrollment {
  id: number;
  classId: number;
  studentId: number;

  class: {
    id: number;
    name: string;
  };

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

export default function Enrollments() {
  const [enrollments, setEnrollments] =
    useState<Enrollment[]>([]);

  const [classes, setClasses] =
    useState<ClassData[]>([]);

  const [students, setStudents] =
    useState<Student[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [modalStudentSearch, setModalStudentSearch] = 
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [entriesPerPage, setEntriesPerPage] =
    useState(10);

  const [showEnrollModal, setShowEnrollModal] =
    useState(false);

  const [showBulkModal, setShowBulkModal] =
    useState(false);

  const [selectedClassId, setSelectedClassId] =
    useState<number | "">("");

  const [selectedStudentIds, setSelectedStudentIds] =
    useState<number[]>([]);

  const [bulkClassId, setBulkClassId] =
    useState<number | "">("");

  const [submitting, setSubmitting] =
    useState(false);

  const [showCsvModal, setShowCsvModal] =
    useState(false);

  const [csvClassId, setCsvClassId] =
    useState<number | "">("");

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

      const [
        enrollmentsRes,
        classesRes,
        studentsRes,
      ] = await Promise.all([
        adminApi.getAllEnrollments(),
        adminApi.getAllClasses(),
        adminApi.getAllStudents(),
      ]);

      setEnrollments(enrollmentsRes || []);
      setClasses(classesRes || []);
      setStudents(
        studentsRes.students || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents =
    useMemo(() => {
      if (!selectedClassId)
        return students.filter(
          (s) =>
            s.role === "STUDENT"
        );

      const enrolledIds =
        enrollments
          .filter(
            (e) =>
              e.classId ===
              selectedClassId
          )
          .map(
            (e) => e.studentId
          );

      return students.filter(
        (student) =>
          student.role ===
            "STUDENT" &&
          !enrolledIds.includes(
            student.userId
          )
      );
    }, [
      students,
      enrollments,
      selectedClassId,
    ]);

  const searchableModalStudents = useMemo(() => {
    if (!modalStudentSearch) return filteredStudents;
    const cleanSearch = modalStudentSearch.toLowerCase();
    return filteredStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(cleanSearch) ||
        s.email.toLowerCase().includes(cleanSearch)
    );
  }, [filteredStudents, modalStudentSearch]);

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = searchableModalStudents.map((s) => s.userId);
    const allSelected = visibleIds.every((id) => selectedStudentIds.includes(id));

    if (allSelected) {
      setSelectedStudentIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleEnrollStudents =
    async () => {
      if (
        !selectedClassId ||
        selectedStudentIds.length === 0
      ) {
        return;
      }

      try {
        setSubmitting(true);

        await adminApi.enrollMultipleStudents(
          Number(selectedClassId),
          selectedStudentIds
        );

        setShowEnrollModal(false);
        setSelectedClassId("");
        setSelectedStudentIds([]);
        setModalStudentSearch("");

        fetchData();
      } catch (err) {
        console.error(err);
        alert(
          "Failed to enroll students"
        );
      } finally {
        setSubmitting(false);
      }
    };

  const handleEnrollAll =
    async () => {
      if (!bulkClassId) return;

      try {
        setSubmitting(true);

        await adminApi.enrollAllStudents(
          Number(bulkClassId)
        );

        setShowBulkModal(false);
        setBulkClassId("");

        fetchData();
      } catch (err) {
        console.error(err);
        alert(
          "Failed to enroll all students"
        );
      } finally {
        setSubmitting(false);
      }
    };

  const resetCsvModal = () => {
    setShowCsvModal(false);
    setCsvClassId("");
    setCsvFile(null);
    setCsvResult(null);
    setCsvError(null);
    setCsvSubmitting(false);
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
    if (!csvClassId || !csvFile) return;

    try {
      setCsvSubmitting(true);
      setCsvError(null);

      const data = await adminApi.enrollByCsv(
        Number(csvClassId),
        csvFile
      );

      setCsvResult(data);
      fetchData();
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

  const filteredEnrollments =
    useMemo(() => {
      const search =
        searchTerm.toLowerCase();

      return enrollments.filter(
        (enrollment) =>
          enrollment.student.name
            .toLowerCase()
            .includes(search) ||
          enrollment.student.email
            .toLowerCase()
            .includes(search) ||
          enrollment.class.name
            .toLowerCase()
            .includes(search)
      );
    }, [enrollments, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredEnrollments.length /
        entriesPerPage
    )
  );

  const paginatedEnrollments =
    filteredEnrollments.slice(
      (currentPage - 1) *
        entriesPerPage,
      currentPage *
        entriesPerPage
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Enrollments
          </h1>

          <p className="text-gray-500 mt-1">
            Manage student
            enrollments
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() =>
              setShowBulkModal(true)
            }
            className="px-4 py-2 rounded-lg  bg-white"
          >
            Enroll All
          </button>

          <button
            onClick={() =>
              setShowCsvModal(true)
            }
            className="flex items-center gap-2 px-4 py-2 rounded-lg  bg-white"
          >
            <Upload className="w-4 h-4" />
            Upload CSV
          </button>

          <button
            onClick={() =>
              setShowEnrollModal(true)
            }
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6d1d5e] text-white"
          >
            <UserPlus className="w-4 h-4" />
            Enroll Students
          </button>
        </div>
      </div>

      {/* Stats */}

      <div className="mb-8">
        <div className="bg-white rounded-xl  shadow-sm p-6 max-w-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-8 h-8 text-[#6d1d5e]" />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Enrollments
              </p>

              <h2 className="text-3xl font-bold">
                {
                  enrollments.length
                }
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}

      <div className="bg-white rounded-xl  shadow-sm overflow-hidden">
        <div className="p-5 -b flex justify-between">
          <div />

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
              className=" rounded-lg px-3 py-2"
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
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                placeholder="Search..."
                className="pl-10 pr-4 py-2  rounded-lg w-72"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 -b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  ID
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  Class
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  Student
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  Email
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-12"
                  >
                    Loading...
                  </td>
                </tr>
              ) : paginatedEnrollments.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-12"
                  >
                    No enrollments
                    found
                  </td>
                </tr>
              ) : (
                paginatedEnrollments.map(
                  (
                    enrollment
                  ) => (
                    <tr
                      key={
                        enrollment.id
                      }
                      className="-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        #
                        {
                          enrollment.id
                        }
                      </td>

                      <td className="px-6 py-4">
                        {
                          enrollment
                            .class
                            .name
                        }
                      </td>

                      <td className="px-6 py-4">
                        {
                          enrollment
                            .student
                            .name
                        }
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {
                          enrollment
                            .student
                            .email
                        }
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="-t px-6 py-4 flex justify-between">
          <p className="text-sm text-gray-500">
            Showing{" "}
            {
              paginatedEnrollments.length
            }{" "}
            of{" "}
            {
              filteredEnrollments.length
            }
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (p) => p - 1
                )
              }
              className="p-2  rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span>
              Page{" "}
              {
                currentPage
              }{" "}
              of{" "}
              {totalPages}
            </span>

            <button
              disabled={
                currentPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (p) => p + 1
                )
              }
              className="p-2  rounded-lg disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Massive Workspace Multi-Select Modal */}

      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6 animate-fadeIn">
          {/* Expanded container to max-w-5xl / max-w-6xl with optimized taller layouts */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl lg:max-w-6xl flex flex-col h-[700px] max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 -b flex justify-between items-start bg-gray-50 rounded-t-xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Enroll Students
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Assign multiple students to a class container simultaneously.
                </p>
              </div>
              {selectedClassId && (
                <div className="bg-purple-100  -purple-200 text-[#6d1d5e] px-4 py-2 rounded-lg text-sm font-semibold">
                  {selectedStudentIds.length} Students Selected
                </div>
              )}
            </div>

            {/* Modal Content - Left (Controls) & Right (Grid Area) splits cleanly on larger screens */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col space-y-4 min-h-0">
              
              {/* Dropdown Layout Box */}
              <div className="max-w-md">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  1. Target Class
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(Number(e.target.value));
                    setSelectedStudentIds([]); 
                  }}
                  className="w-full  -gray-300 rounded-lg px-4 py-2.5 bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#6d1d5e]/20 focus:-[#6d1d5e]"
                >
                  <option value="">Choose class...</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedClassId ? (
                <div className="flex-1 flex flex-col min-h-0 space-y-3 pt-2">
                  
                  {/* Action Filters Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 max-w-xl">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                        2. Filter Available Students
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={modalStudentSearch}
                          onChange={(e) => setModalStudentSearch(e.target.value)}
                          placeholder="Search non-enrolled members by name or email address..."
                          className="w-full pl-10 pr-4 py-2  rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6d1d5e]/20 focus:-[#6d1d5e]"
                        />
                      </div>
                    </div>

                    {searchableModalStudents.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAllVisible}
                        className="sm:self-end px-4 py-2  -gray-200 rounded-lg text-sm font-semibold text-[#6d1d5e] bg-white hover:bg-gray-50 transition-colors"
                      >
                        {searchableModalStudents.every((id) => selectedStudentIds.includes(id.userId))
                          ? "Deselect All Visible"
                          : "Select All Visible"}
                      </button>
                    )}
                  </div>

                  {/* Wide 3-Column Item Selector Grid */}
                  <div className=" -gray-200 rounded-xl overflow-y-auto flex-1 bg-gray-50/50 p-4 min-h-0">
                    {searchableModalStudents.length === 0 ? (
                      <div className="text-center py-20 text-gray-400 text-sm">
                        No students found matching your criteria.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {searchableModalStudents.map((student) => {
                          const isChecked = selectedStudentIds.includes(student.userId);
                          return (
                            <div
                              key={student.userId}
                              onClick={() => toggleStudentSelection(student.userId)}
                              className={`flex items-start gap-3.5 p-4 rounded-xl  cursor-pointer transition-all ${
                                isChecked 
                                  ? "bg-purple-50/60 -purple-400 shadow-sm ring-1 ring-purple-400" 
                                  : "bg-white -gray-200 hover:-gray-300 hover:shadow-sm"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-md  flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                  isChecked
                                    ? "bg-[#6d1d5e] -[#6d1d5e] text-white"
                                    : "-gray-300 bg-white"
                                }`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                  {student.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate mt-1">
                                  {student.email}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="text-center py-24 bg-gray-50 rounded-xl  -dashed -gray-300 text-gray-400 flex flex-col items-center justify-center flex-1">
                  <Users className="w-12 h-12 text-gray-300 mb-2" />
                  <p className="text-base font-semibold text-gray-500">No Class Selected</p>
                  <p className="text-sm text-gray-400 max-w-xs mt-1">
                    Choose a class above to load and filter students available for enrollment.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 -t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => {
                  setShowEnrollModal(false);
                  setSelectedClassId("");
                  setSelectedStudentIds([]);
                  setModalStudentSearch("");
                }}
                className="px-5 py-2.5  bg-white rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                disabled={submitting || !selectedClassId || selectedStudentIds.length === 0}
                onClick={handleEnrollStudents}
                className="px-6 py-2.5 bg-[#6d1d5e] text-white rounded-lg text-sm font-bold hover:bg-[#59174d] disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-md"
              >
                {submitting ? "Processing..." : `Enroll Selected (${selectedStudentIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Modal */}

      {showBulkModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Enroll All Students
            </h2>

            <select
              value={bulkClassId}
              onChange={(e) =>
                setBulkClassId(
                  Number(
                    e.target.value
                  )
                )
              }
              className="w-full  rounded-lg px-3 py-2"
            >
              <option value="">
                Select Class
              </option>

              {classes.map(
                (cls) => (
                  <option
                    key={cls.id}
                    value={cls.id}
                  >
                    {cls.name}
                  </option>
                )
              )}
            </select>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() =>
                  setShowBulkModal(
                    false
                  )
                }
                className="px-4 py-2  rounded-lg"
              >
                Cancel
              </button>

              <button
                disabled={
                  submitting || !bulkClassId
                }
                onClick={
                  handleEnrollAll
                }
                className="px-4 py-2 bg-[#6d1d5e] text-white rounded-lg disabled:opacity-50"
              >
                Enroll All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}

      {showCsvModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 -b flex justify-between items-start bg-gray-50 rounded-t-xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Upload CSV
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Enroll students in bulk using a CSV of email addresses.
                </p>
              </div>
              <button
                onClick={resetCsvModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {csvResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-green-50  -green-200 text-green-800 px-4 py-3 rounded-lg">
                    <Check className="w-5 h-5 flex-shrink-0" />
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
                      <div className="bg-gray-50  rounded-lg p-3 max-h-28 overflow-y-auto text-gray-600 space-y-0.5">
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
                      <div className="bg-gray-50  rounded-lg p-3 max-h-28 overflow-y-auto text-gray-600 space-y-0.5">
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
                      <div className="bg-gray-50  rounded-lg p-3 max-h-28 overflow-y-auto text-gray-600 space-y-0.5">
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
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      1. Target Class
                    </label>
                    <select
                      value={csvClassId}
                      onChange={(e) =>
                        setCsvClassId(Number(e.target.value))
                      }
                      className="w-full  -gray-300 rounded-lg px-4 py-2.5 bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#6d1d5e]/20 focus:-[#6d1d5e]"
                    >
                      <option value="">Choose class...</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      2. CSV File
                    </label>

                    <label
                      htmlFor="csv-file-input"
                      className="flex flex-col items-center justify-center gap-2 -2 -dashed -gray-300 rounded-xl py-8 px-4 cursor-pointer hover:-[#6d1d5e]/40 hover:bg-gray-50 transition-colors"
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
                  </div>

                  {csvError && (
                    <div className="flex items-start gap-2 bg-red-50  -red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>{csvError}</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-400">
                    The file should contain one email per line. A header
                    row (e.g. "email") is optional — it will be detected
                    automatically. Students not found, already enrolled,
                    or without a student account will be skipped and
                    listed in the results.
                  </p>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 -t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
              {csvResult ? (
                <button
                  onClick={resetCsvModal}
                  className="px-6 py-2.5 bg-[#6d1d5e] text-white rounded-lg text-sm font-bold hover:bg-[#59174d] transition-colors shadow-md"
                >
                  Done
                </button>
              ) : (
                <>
                  <button
                    onClick={resetCsvModal}
                    className="px-5 py-2.5  bg-white rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    disabled={
                      csvSubmitting || !csvClassId || !csvFile
                    }
                    onClick={handleCsvSubmit}
                    className="px-6 py-2.5 bg-[#6d1d5e] text-white rounded-lg text-sm font-bold hover:bg-[#59174d] disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-md"
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
  );
}
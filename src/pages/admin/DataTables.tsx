// src/pages/admin/DataTables.tsx

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { adminApi } from "../../api/adminApi";

interface User {
  userId: number;
  name: string;
  email: string;
  university?: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  createdAt: string;
}

export default function DataTables() {
  const [activeTab, setActiveTab] = useState<
    "students" | "teachers"
  >("students");

  const [students, setStudents] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);

  const [studentCount, setStudentCount] =
    useState(0);

  const [teacherCount, setTeacherCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [entriesPerPage, setEntriesPerPage] =
    useState(10);

  const [universityFilter, setUniversityFilter] =
    useState("");

  const [joinedFrom, setJoinedFrom] =
    useState("");

  const [joinedTo, setJoinedTo] =
    useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [studentRes, teacherRes] =
        await Promise.all([
          adminApi.getAllStudents(),
          adminApi.getAllTeachers(),
        ]);

      setStudents(
        studentRes.students || []
      );

      setTeachers(
        teacherRes.teachers || []
      );

      setStudentCount(
        studentRes.total || 0
      );

      setTeacherCount(
        teacherRes.total || 0
      );
    } catch (error) {
      console.error(
        "Failed to fetch users:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const currentData = useMemo(() => {
    return activeTab === "students"
      ? students
      : teachers;
  }, [
    activeTab,
    students,
    teachers,
  ]);

  const resetFilters = () => {
    setSearchTerm("");
    setUniversityFilter("");
    setJoinedFrom("");
    setJoinedTo("");
    setCurrentPage(1);
  };

  const uniqueUniversities = useMemo(() => {
    const unis = new Set<string>();
    [...students, ...teachers].forEach((u) => {
      if (u.university) unis.add(u.university);
    });
    return Array.from(unis).sort();
  }, [students, teachers]);

  const hasActiveFilters =
    !!searchTerm || !!universityFilter || !!joinedFrom || !!joinedTo;

  const filteredData = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return currentData.filter((user) => {
      const matchesSearch =
        !search ||
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.userId.toString().includes(search) ||
        user.university?.toLowerCase().includes(search);

      const matchesUniversity =
        !universityFilter ||
        user.university === universityFilter;

      const joinedDate = new Date(user.createdAt);
      const matchesFrom =
        !joinedFrom || joinedDate >= new Date(joinedFrom);
      const matchesTo =
        !joinedTo || joinedDate <= new Date(joinedTo + "T23:59:59");

      return (
        matchesSearch &&
        matchesUniversity &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [currentData, searchTerm, universityFilter, joinedFrom, joinedTo]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredData.length /
        entriesPerPage
    )
  );

  const paginatedData =
    filteredData.slice(
      (currentPage - 1) *
        entriesPerPage,
      currentPage *
        entriesPerPage
    );

  const changeTab = (
    tab: "students" | "teachers"
  ) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm("");
    setUniversityFilter("");
    setJoinedFrom("");
    setJoinedTo("");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          User Management
        </h1>

        <p className="text-gray-500 mt-1">
          View all students and
          teachers
        </p>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm  p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <GraduationCap className="w-8 h-8 text-[#6d1d5e]" />
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Total Students
              </p>

              <h2 className="text-3xl font-bold text-gray-900">
                {studentCount}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm  p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100">
              <Users className="w-8 h-8 text-green-600" />
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Total Teachers
              </p>

              <h2 className="text-3xl font-bold text-gray-900">
                {teacherCount}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}

      <div className="bg-white rounded-xl shadow-sm  overflow-hidden">
        {/* Toolbar */}

        <div className="p-5  flex flex-col gap-4">
          {/* Top row: tabs + entries + search */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => changeTab("students")}
                className={`px-5 py-2 rounded-lg font-medium transition ${
                  activeTab === "students"
                    ? "bg-[#6d1d5e] text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Students
              </button>

              <button
                onClick={() => changeTab("teachers")}
                className={`px-5 py-2 rounded-lg font-medium transition ${
                  activeTab === "teachers"
                    ? "bg-[#6d1d5e] text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Teachers
              </button>
            </div>

            <div className="flex gap-3 flex-wrap">
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className=" rounded-lg px-3 py-2 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${
                    activeTab === "students" ? "students" : "teachers"
                  }...`}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2  rounded-lg w-72"
                />
              </div>
            </div>
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                University
              </label>
              <select
                value={universityFilter}
                onChange={(e) => {
                  setUniversityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className=" rounded-lg px-3 py-2 text-sm min-w-45"
              >
                <option value="">All Universities</option>
                {uniqueUniversities.map((uni) => (
                  <option key={uni} value={uni}>
                    {uni}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Joined From
              </label>
              <input
                type="date"
                value={joinedFrom}
                onChange={(e) => {
                  setJoinedFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className=" rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Joined To
              </label>
              <input
                type="date"
                value={joinedTo}
                onChange={(e) => {
                  setJoinedTo(e.target.value);
                  setCurrentPage(1);
                }}
                className=" rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-semibold text-gray-600  rounded-lg hover:bg-gray-50 transition-colors self-end"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 ">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  ID
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Name
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Email
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  University
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Role
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Joined
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-500"
                  >
                    {hasActiveFilters
                      ? "No records match the current filters."
                      : "No records found"}
                  </td>
                </tr>
              ) : (
                paginatedData.map((user) => (
                  <tr
                    key={user.userId}
                    className=" hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      #{user.userId}
                    </td>

                    <td className="px-6 py-4">
                      {user.name}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {user.email}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {user.university ? (
                        user.university
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === "STUDENT"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}

        <div className=" px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {paginatedData.length} of {filteredData.length} records
            {hasActiveFilters && (
              <span className="ml-1 text-gray-400">(filtered)</span>
            )}
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
    </div>
  );
}
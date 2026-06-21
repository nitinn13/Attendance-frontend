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

  const filteredData = useMemo(() => {
    const search =
      searchTerm.toLowerCase();

    return currentData.filter(
      (user) =>
        user.name
          ?.toLowerCase()
          .includes(search) ||
        user.email
          ?.toLowerCase()
          .includes(search) ||
        user.userId
          .toString()
          .includes(search)
    );
  }, [currentData, searchTerm]);

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

        <div className="p-5 -b flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <button
              onClick={() =>
                changeTab(
                  "students"
                )
              }
              className={`px-5 py-2 rounded-lg font-medium transition ${
                activeTab ===
                "students"
                  ? "bg-[#6d1d5e] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Students
            </button>

            <button
              onClick={() =>
                changeTab(
                  "teachers"
                )
              }
              className={`px-5 py-2 rounded-lg font-medium transition ${
                activeTab ===
                "teachers"
                  ? "bg-[#6d1d5e] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Teachers
            </button>
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
                placeholder={`Search ${
                  activeTab ===
                  "students"
                    ? "students"
                    : "teachers"
                }`}
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
                  ID
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Name
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Email
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
                    colSpan={5}
                    className="text-center py-12 text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : paginatedData.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-gray-500"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                paginatedData.map(
                  (user) => (
                    <tr
                      key={
                        user.userId
                      }
                      className="-b hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        #
                        {
                          user.userId
                        }
                      </td>

                      <td className="px-6 py-4">
                        {user.name}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {user.email}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role ===
                            "STUDENT"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {
                            user.role
                          }
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {new Date(
                          user.createdAt
                        ).toLocaleDateString()}
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
              paginatedData.length
            }{" "}
            of{" "}
            {
              filteredData.length
            }{" "}
            records
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
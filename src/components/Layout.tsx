// src/components/Layout.tsx
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  const loc = useLocation();
  const isTeacher = loc.pathname.startsWith("/teacher");
  const isStudent = loc.pathname.startsWith("/student");
  const isAdmin = loc.pathname.startsWith("/admin");


  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            
            
            {/* Title - Responsive text size and truncation */}
            <h1 className="text-sm sm:text-base lg:text-lg font-semibold truncate">
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </h1>
          </div>

          {/* Role Display */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {isTeacher && (
              <span className="px-2 sm:px-3 py-1 rounded bg-gray-800 text-white text-xs sm:text-sm font-medium">
                Teacher
              </span>
            )}
            {isStudent && (
              <span className="px-2 sm:px-3 py-1 rounded bg-gray-800 text-white text-xs sm:text-sm font-medium">
                Student
              </span>
            )}
            {isAdmin && (
              <span className="px-2 sm:px-3 py-1 rounded bg-gray-800 text-white text-xs sm:text-sm font-medium">
                Admin              </span>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
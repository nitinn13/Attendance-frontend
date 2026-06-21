// src/components/Sidebar.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, LogOut, BookOpen, User, Settings, MessageSquare, Calendar, FileText, Users, GraduationCap, Clock } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isTeacher = location.pathname.startsWith("/teacher");
  const isStudent = location.pathname.startsWith("/student");
  const isAdmin = location.pathname.startsWith("/admin");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    closeMobileMenu();
    navigate("/");
  };

  // Light-themed modern active state styling
  const linkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive 
        ? "bg-blue-50 text-blue-600 font-semibold shadow-sm border border-blue-100/50" 
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
    }`;
  };

  // Active left indicator bar highlight
  const activeIndicator = (path: string) => 
    location.pathname === path && (
      <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-600 rounded-r-md" />
    );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header / Brand */}
      <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center font-bold tracking-wider text-white shadow-md shadow-blue-600/10 shrink-0">
          B
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-800 truncate tracking-wide">Bennett University</div>
          <div className="text-xs font-semibold text-slate-400 truncate tracking-tight">CAMPUS DASHBOARD</div>
        </div>
      </div>

      {/* Navigation Area with fixed internal scroll containment */}
      <div className="flex-1 min-h-0 overflow-y-auto py-6 pr-1 my-2 custom-scrollbar">
        {/* Teacher Navigation */}
        {isTeacher && (
          <nav className="space-y-1">
            <Link to="/teacher/dashboard" className={linkClass("/teacher/dashboard")} onClick={closeMobileMenu}>
              {activeIndicator("/teacher/dashboard")}
              <Clock size={18} />
              <span>Attendance</span>
            </Link>
            <Link to="/teacher/my-classes" className={linkClass("/teacher/my-classes")} onClick={closeMobileMenu}>
              {activeIndicator("/teacher/my-classes")}
              <BookOpen size={18} />
              <span>My Classes</span>
            </Link>
            <Link to="/teacher/profile" className={linkClass("/teacher/profile")} onClick={closeMobileMenu}>
              {activeIndicator("/teacher/profile")}
              <User size={18} />
              <span>Profile</span>
            </Link>
            <Link to="/teacher/settings" className={linkClass("/teacher/settings")} onClick={closeMobileMenu}>
              {activeIndicator("/teacher/settings")}
              <Settings size={18} />
              <span>Settings</span>
            </Link>
          </nav>
        )}

        {isAdmin && (
          <nav className="space-y-1">
            <Link to="/admin/users" className={linkClass("/admin/users")} onClick={closeMobileMenu}>
              {activeIndicator("/admin/users")}
              <Clock size={18} />
              <span>Users</span>
            </Link>
            <Link to="/admin/classes" className={linkClass("/admin/classes")} onClick={closeMobileMenu}>
              {activeIndicator("/admin/classes")}
              <BookOpen size={18} />
              <span>Classes</span>
            </Link>
            <Link to="/admin/device-management" className={linkClass("/admin/device-management")} onClick={closeMobileMenu}>
              {activeIndicator("/admin/device-management")}
              <User size={18} />
              <span>Device Management</span>
            </Link>
          </nav>
        )}

        {/* Student Navigation */}
        {isStudent && (
          <nav className="space-y-1">
            <Link to="/student/dashboard" className={linkClass("/student/dashboard")} onClick={closeMobileMenu}>
              {activeIndicator("/student/dashboard")}
              <User size={18} />
              <span>Profile</span>
            </Link>
            <Link to="/student/messages" className={linkClass("/student/messages")} onClick={closeMobileMenu}>
              {activeIndicator("/student/messages")}
              <MessageSquare size={18} />
              <span>Messages</span>
            </Link>
            <Link to="/student/attendance" className={linkClass("/student/attendance")} onClick={closeMobileMenu}>
              {activeIndicator("/student/attendance")}
              <Clock size={18} />
              <span>Attendance</span>
            </Link>
            <Link to="/student/timetable" className={linkClass("/student/timetable")} onClick={closeMobileMenu}>
              {activeIndicator("/student/timetable")}
              <Calendar size={18} />
              <span>Time Table</span>
            </Link>
            <Link to="/student/leave" className={linkClass("/student/leave")} onClick={closeMobileMenu}>
              {activeIndicator("/student/leave")}
              <FileText size={18} />
              <span>Leave & Outpass</span>
            </Link>
            <Link to="/student/enrollment" className={linkClass("/student/enrollment")} onClick={closeMobileMenu}>
              {activeIndicator("/student/enrollment")}
              <GraduationCap size={18} />
              <span>Enrollment</span>
            </Link>
            <Link to="/student/hallticket" className={linkClass("/student/hallticket")} onClick={closeMobileMenu}>
              {activeIndicator("/student/hallticket")}
              <FileText size={18} />
              <span>Hall Ticket</span>
            </Link>
            <Link to="/student/room-partner" className={linkClass("/student/room-partner")} onClick={closeMobileMenu}>
              {activeIndicator("/student/room-partner")}
              <Users size={18} />
              <span>Room Partner</span>
            </Link>
            <Link to="/student/result" className={linkClass("/student/result")} onClick={closeMobileMenu}>
              {activeIndicator("/student/result")}
              <GraduationCap size={18} />
              <span>Result</span>
            </Link>
          </nav>
        )}
      </div>

      {/* Action Footer (Fixed to Bottom) */}
      <div className="mt-auto pt-4 border-t border-slate-100 space-y-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>

        {/* Slogan Container */}
        <div className="text-[11px] font-semibold tracking-wide text-slate-400 text-center bg-slate-50 rounded-xl py-2.5 px-3 border border-slate-100">
          ReMark: <span className="text-blue-600">Stop Proxy</span> Start Authenticity
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl shadow-md hover:bg-slate-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-30 transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar Layout Frame */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40
          w-72 h-screen max-h-screen bg-white text-slate-800 p-5 flex flex-col border-r border-slate-200/80
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
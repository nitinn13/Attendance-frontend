// src/views/admin/DeviceManagement.tsx

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Smartphone,
  ShieldAlert,
  RotateCcw,
  X,
  AlertTriangle,
  Users,
  CheckCircle2
} from "lucide-react";
import { adminApi } from "../../api/adminApi";

interface User {
  userId: number;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  createdAt: string;
}

interface ModalState {
  isOpen: boolean;
  type: "single" | "all";
  targetEmail?: string;
}

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export default function DeviceManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Custom states replacing native alerts/confirms
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: "single" });
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });

  const [resettingEmail, setResettingEmail] = useState<string | null>(null);
  const [resettingAll, setResettingAll] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const triggerToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [studentsRes, teachersRes] = await Promise.all([
        adminApi.getAllStudents(),
        adminApi.getAllTeachers(),
      ]);

      const allUsers = [
        ...(studentsRes.students || []),
        ...(teachersRes.teachers || []),
      ];
      setUsers(allUsers);
    } catch (err) {
      console.error(err);
      triggerToast("Failed to fetch users list", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetDevice = async (email: string) => {
    try {
      setResettingEmail(email);
      setModal({ isOpen: false, type: "single" });
      await adminApi.deleteDevice(email);
      triggerToast(`Device reset successfully for ${email}`, "success");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to reset device", "error");
    } finally {
      setResettingEmail(null);
    }
  };

  const handleResetAllDevices = async () => {
    try {
      setResettingAll(true);
      setModal({ isOpen: false, type: "all" });
      const res = await adminApi.deleteAllDevices();
      triggerToast(`${res.usersUpdated || 0} devices reset successfully`, "success");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to reset all devices", "error");
    } finally {
      setResettingAll(false);
    }
  };

  // Performance Optimization: Combined text searching and stats computing
  const { filteredUsers, studentCount, teacherCount } = useMemo(() => {
    const search = searchTerm.toLowerCase();
    
    let sCount = 0;
    let tCount = 0;
    
    const filtered = users.filter((user) => {
      if (user.role === "STUDENT") sCount++;
      if (user.role === "TEACHER") tCount++;
      
      return (
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    });

    return { filteredUsers: filtered, studentCount: sCount, teacherCount: tCount };
  }, [users, searchTerm]);

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen relative font-sans antialiased text-gray-900">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl transition-all duration-300 transform translate-y-0 border text-sm max-w-md ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />}
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="ml-2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform scale-100 transition-transform border border-gray-100">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Device Reset</h3>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              {modal.type === "all" ? (
                <span>Are you sure you want to reset devices for <strong className="text-red-600 text-semibold">ALL users</strong>? This action cannot be undone.</span>
              ) : (
                <span>Are you sure you want to clear the registered device identifier associated with <strong className="text-gray-900 font-medium">{modal.targetEmail}</strong>?</span>
              )}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModal({ isOpen: false, type: "single" })}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => modal.type === "all" ? handleResetAllDevices() : handleResetDevice(modal.targetEmail || "")}
                className={`px-4 py-2.5 rounded-xl text-white font-medium transition-all text-sm shadow-sm ${
                  modal.type === "all" 
                    ? "bg-red-600 hover:bg-red-700 shadow-red-100" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                }`}
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Device Management
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Manage, audit, and reset secure user hardware authorization binds.
          </p>
        </div>

        <button
          onClick={() => setModal({ isOpen: true, type: "all" })}
          disabled={resettingAll}
          className="bg-red-600 text-white px-5 py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium shadow-md shadow-red-100 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <ShieldAlert className="w-4 h-4" />
          {resettingAll ? "Resetting..." : "Reset All Devices"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 flex items-center justify-between transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                Active Student Devices
              </p>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-0.5">
                {loading ? "..." : studentCount}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 flex items-center justify-between transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                Active Teacher Devices
              </p>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-0.5">
                {loading ? "..." : teacherCount}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        
        {/* Table Controls */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-2 text-gray-700 font-semibold text-lg">
            <Users className="w-5 h-5 text-gray-400" />
            Registered Users
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Table Layout */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-150">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4 text-left font-semibold">Name</th>
                <th className="px-6 py-4 text-left font-semibold">Email</th>
                <th className="px-6 py-4 text-left font-semibold">Role</th>
                <th className="px-6 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-16">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent mb-2"></div>
                    <p className="text-gray-400 font-medium">Retrieving active records...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-gray-500">
                    <Smartphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-base font-semibold text-gray-700">No users found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your keyword parameters or filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                        user.role === 'TEACHER' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : user.role === 'STUDENT'
                          ? 'bg-purple-50 text-purple-700 border-purple-100'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setModal({ isOpen: true, type: "single", targetEmail: user.email })}
                        disabled={resettingEmail === user.email}
                        className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white disabled:opacity-40 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ml-auto"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${resettingEmail === user.email ? 'animate-spin' : ''}`} />
                        {resettingEmail === user.email ? "Resetting..." : "Reset Device"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
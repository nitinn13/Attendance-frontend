import { Routes, Route, BrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Layout from "./components/Layout";
import DataTables from "./pages/admin/DataTables";
import Classes from "./pages/admin/Classes";
import DeviceManagement from "./pages/admin/DeviceManagement";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import ClassAttendance from "./pages/teacher/ClassAttendance";
import StudentDashboard from "./pages/student/StudentDashboard";
import Timetable from "./pages/student/Timetable";
import ComingSoon from "./components/ComingSoon";
import QrDisplay from "./pages/teacher/QrDisplay";
import ProtectedRoute from "./components/Protectedroute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin routes — only ADMIN can access */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="admin" element={<Layout />}>
            <Route index element={<DataTables />} />
            <Route path="classes" element={<Classes />} />
            <Route path="users" element={<DataTables />} />
            <Route path="device-management" element={<DeviceManagement />} />
          </Route>
        </Route>

        {/* Teacher routes — only TEACHER can access */}
        <Route element={<ProtectedRoute allowedRoles={["TEACHER"]} />}>
          <Route path="teacher" element={<Layout />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="my-classes" element={<TeacherClasses />} />
            <Route path="attendance/:classId" element={<ClassAttendance />} />
            <Route path="*" element={<TeacherDashboard />} />
          </Route>
          {/* QrDisplay is outside Layout (no nav chrome) but still teacher-only */}
          <Route path="teacher/qr/:sessionId" element={<QrDisplay />} />
        </Route>

        {/* Student routes — only STUDENT can access */}
        <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
          <Route path="student" element={<Layout />}>
            <Route index element={<Timetable />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="*" element={<ComingSoon />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
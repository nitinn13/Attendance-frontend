import { Routes, Route, BrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Layout from "./components/Layout";
import DataTables from "./pages/admin/DataTables";
import Classes from "./pages/admin/Classes";
import Enrollments from "./pages/admin/Enrollments";
import DeviceManagement from "./pages/admin/DeviceManagement";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import ClassAttendance from "./pages/teacher/ClassAttendance";
import StudentDashboard from "./pages/student/StudentDashboard";
import Timetable from "./pages/student/Timetable";
import ComingSoon from "./components/ComingSoon";
import QrDisplay from "./pages/teacher/QrDisplay";


export default function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin routes */}
        <Route path="admin" element={<Layout />}>
          <Route index element={<DataTables />} />
          <Route path="classes" element={<Classes />} />
          <Route path="users" element={<DataTables />} />
          <Route path="enrollment" element={<Enrollments />} />
          <Route path="device-management" element={<DeviceManagement />} />
        </Route>

        {/* Teacher routes */}
        <Route path="teacher" element={<Layout />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="my-classes" element={<TeacherClasses />} />
          <Route path="attendance/:classId" element={<ClassAttendance />} />
          <Route path="*" element={<TeacherDashboard />} />
        </Route>
        <Route path="teacher/qr/:sessionId" element={<QrDisplay />} />

        {/* Student routes */}
        <Route path="student" element={<Layout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="*" element={<ComingSoon />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

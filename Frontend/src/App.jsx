
import
  {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
  } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";

import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashBoard";
import CoordinatorDashboard from "./pages/coordinate/CoordinatorDashboard";
import ClubDashboard from "./pages/club/ClubDashboard";

import Timetable from "./pages/Timetable";
import Bookings from "./pages/Bookings";
import Exams from "./pages/Exams";
import Rescheduling from "./pages/Rescheduling";
import Rooms from "./pages/Rooms";
import Assistant from "./pages/Assistant";

function App()
{
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/rescheduling" element={<Rescheduling />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/assistant" element={<Assistant />} />
          </Route>
        </Route>

        {/* Faculty */}
        <Route element={<ProtectedRoute allowedRoles={["FACULTY"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/assistant" element={<Assistant />} />
          </Route>
        </Route>

        {/* Coordinator */}
        <Route element={<ProtectedRoute allowedRoles={["COORDINATOR"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/coordinator" element={<CoordinatorDashboard />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/rescheduling" element={<Rescheduling />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/assistant" element={<Assistant />} />
          </Route>
        </Route>

        {/* Club Representative */}
        <Route element={<ProtectedRoute allowedRoles={["CLUB_REP"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/club" element={<ClubDashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/assistant" element={<Assistant />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";

const pageTitles = {
  "/admin": "Admin Dashboard",
  "/faculty": "Faculty Dashboard",
  "/coordinator": "Coordinator Dashboard",
  "/club": "Club Dashboard",
  "/timetable": "Timetable",
  "/bookings": "Room Bookings",
  "/exams": "Exam Scheduling",
  "/rescheduling": "Rescheduling",
  "/rooms": "Room Management",
  "/assistant": "AI Assistant",
  "/faculty-management": "Faculty Management",
};

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:ml-64">
        <Header
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;

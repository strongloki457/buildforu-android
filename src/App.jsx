import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleGuard from "./components/common/RoleGuard";
import { useAuth } from "./hooks/useAuth";
import AppLayout from "./layouts/AppLayout";
import AdminDashboard from "./pages/AdminDashboard";
import CalendarPage from "./pages/CalendarPage";
import ChatPage from "./pages/ChatPage";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import FinancePage from "./pages/FinancePage";
import LoginPage from "./pages/LoginPage";
import MaterialsPage from "./pages/MaterialsPage";
import ProjectsPage from "./pages/ProjectsPage";
import SettingsPage from "./pages/SettingsPage";
import TasksPage from "./pages/TasksPage";
import WorkersPage from "./pages/WorkersPage";

function DashboardRouter() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminDashboard /> : <EmployeeDashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route
            path="/workers"
            element={
              <RoleGuard allowedRoles={["admin"]}>
                <WorkersPage />
              </RoleGuard>
            }
          />
          <Route
            path="/projects"
            element={
              <RoleGuard allowedRoles={["admin"]}>
                <ProjectsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/materials"
            element={
              <RoleGuard allowedRoles={["admin"]}>
                <MaterialsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/finance"
            element={
              <RoleGuard allowedRoles={["admin"]}>
                <FinancePage />
              </RoleGuard>
            }
          />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

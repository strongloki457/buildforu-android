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
import BillingPage from "./pages/BillingPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MarketMapPage from "./pages/MarketMapPage";
import MaterialsPage from "./pages/MaterialsPage";
import PricingPage from "./pages/PricingPage";
import ProjectsPage from "./pages/ProjectsPage";
import RegisterCompanyPage from "./pages/RegisterCompanyPage";
import SettingsPage from "./pages/SettingsPage";
import TasksPage from "./pages/TasksPage";
import WorkersPage from "./pages/WorkersPage";

function DashboardRouter() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminDashboard /> : <EmployeeDashboard />;
}

function FallbackRouter() {
  const { user } = useAuth();
  return <Navigate to={user ? "/dashboard" : "/"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/register-company" element={<RegisterCompanyPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/market-map" element={<MarketMapPage />} />
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
          <Route path="/settings/billing" element={<BillingPage />} />
        </Route>
      </Route>
      <Route path="*" element={<FallbackRouter />} />
    </Routes>
  );
}

import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleGuard from "./components/common/RoleGuard";
import { useAuth } from "./hooks/useAuth";
import { useI18n } from "./hooks/useI18n";
import AppLayout from "./layouts/AppLayout";

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const BillingPage = lazy(() => import("./pages/BillingPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const EmployeeDashboard = lazy(() => import("./pages/EmployeeDashboard"));
const FinancePage = lazy(() => import("./pages/FinancePage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const MarketMapPage = lazy(() => import("./pages/MarketMapPage"));
const MaterialsPage = lazy(() => import("./pages/MaterialsPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const RegisterCompanyPage = lazy(() => import("./pages/RegisterCompanyPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const WorkersPage = lazy(() => import("./pages/WorkersPage"));

function RouteFallback() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-sm text-slate-500">
      {t("common.loading")}
    </div>
  );
}

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
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/register-company" element={<RegisterCompanyPage />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
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
                <RoleGuard allowedRoles={["admin", "employee"]}>
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
            <Route
              path="/settings/billing"
              element={
                <RoleGuard allowedRoles={["admin"]}>
                  <BillingPage />
                </RoleGuard>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<FallbackRouter />} />
      </Routes>
    </Suspense>
  );
}

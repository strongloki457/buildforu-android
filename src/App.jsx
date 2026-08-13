import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicOnlyRoute from "./components/common/PublicOnlyRoute";
import RoleGuard from "./components/common/RoleGuard";
import { useAuth } from "./hooks/useAuth";
import { useI18n } from "./hooks/useI18n";
import AppLayout from "./layouts/AppLayout";

const AiAssistantPage = lazy(() => import("./pages/AiAssistantPage"));
const AttendanceReportsPage = lazy(() => import("./pages/AttendanceReportsPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const BillingPage = lazy(() => import("./pages/BillingPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const EmployeeDashboard = lazy(() => import("./pages/EmployeeDashboard"));
const FinancePage = lazy(() => import("./pages/FinancePage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const MarketMapPage = lazy(() => import("./pages/MarketMapPage"));
const MaterialsPage = lazy(() => import("./pages/MaterialsPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const RegisterCompanyPage = lazy(() => import("./pages/RegisterCompanyPage"));
const CheckoutSuccessPage = lazy(() => import("./pages/CheckoutSuccessPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const VerifyPendingPage = lazy(() => import("./pages/VerifyPendingPage"));
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
  const { user, isBooting } = useAuth();

  if (isBooting || !user) {
    return <RouteFallback />;
  }

  return String(user?.role || "").trim().toLowerCase() === "admin" ? <AdminDashboard /> : <EmployeeDashboard />;
}

function FallbackRouter() {
  const { user, isBooting } = useAuth();

  if (isBooting) {
    return <RouteFallback />;
  }

  return <Navigate to={user ? "/dashboard" : "/"} replace />;
}

const isNativeApp = Capacitor.isNativePlatform();

export default function App() {
  useEffect(() => {
    if (!isNativeApp) return;

    // BrowserRouter navigation pushes real history entries, so canGoBack tracks
    // in-app route depth — fall through to exiting only once there's nowhere left to go back to.
    const listenerPromise = CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, []);

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route
          path="/"
          element={isNativeApp ? <Navigate to="/login" replace /> : <LandingPage />}
        />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/register-company" element={<RegisterCompanyPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-pending" element={<VerifyPendingPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/market-map" element={<MarketMapPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/ai-assistant" element={<AiAssistantPage />} />
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
            <Route
              path="/attendance-reports"
              element={
                <RoleGuard allowedRoles={["admin"]}>
                  <AttendanceReportsPage />
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

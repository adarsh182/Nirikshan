import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/Layout";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import TestLogPage from "./pages/TestLog";
import TestDetailPage from "./pages/TestDetail";
import CapturePage from "./pages/Capture";
import ReferenceCardPage from "./pages/ReferenceCard";
import "./index.css";

function LoginRedirect() {
  const { token } = useAuth();
  return token ? <Navigate to="/" replace /> : <LoginPage />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRedirect />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/capture" element={<CapturePage />} />
            <Route path="/tests" element={<TestLogPage />} />
            <Route path="/tests/:id" element={<TestDetailPage />} />
            <Route path="/reference-card" element={<ReferenceCardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);

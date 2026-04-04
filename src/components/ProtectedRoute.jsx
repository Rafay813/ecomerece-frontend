import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AuthLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Checking session...</p>
      </div>
    </div>
  );
}

// ── Requires login ─────────────────────────────────────────────────────────
export function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AuthLoader />;
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

// ── Requires admin role ────────────────────────────────────────────────────
export function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AuthLoader />;
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
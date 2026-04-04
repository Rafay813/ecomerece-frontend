import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

function getSessionId() {
  return localStorage.getItem("cart_session_id") || "";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        authAPI.getMe()
          .then((res) => {
            setUser(res.user);
            localStorage.setItem("user", JSON.stringify(res.user));
          })
          .catch(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  // role can be "user" or "admin"
  // If "admin" → backend returns isPending=true (no token)
  // If "user"  → backend returns token → logged in immediately
  const register = useCallback(async (name, email, password, role = "user") => {
    setError(null);
    try {
      const res = await authAPI.register({ name, email, password, role });

      // Admin request submitted → pending, not logged in
      if (res.isPending) {
        return { success: false, isPending: true, message: res.message };
      }

      // Normal user → log in immediately
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      setUser(res.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const res = await authAPI.login({ email, password });
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      setUser(res.user);
      return { success: true };
    } catch (err) {
      // Pass through pending/rejected status flags from backend
      setError(err.message);

      // Try to parse the actual response for special flags
      // The error thrown by request() only has message, so we handle via message content
      const isPending = err.message?.toLowerCase().includes("pending");
      const isRejected = err.message?.toLowerCase().includes("rejected");

      return {
        success: false,
        message: err.message,
        isPending,
        isRejected,
      };
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  // ── Update profile ────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (data) => {
    try {
      const res = await authAPI.updateProfile(data);
      setUser(res.user);
      localStorage.setItem("user", JSON.stringify(res.user));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  const isAdmin = user?.role === "admin" && user?.status === "active";
  const isLoggedIn = !!user && user?.status === "active";

  return (
    <AuthContext.Provider value={{
      user, loading, error, isAdmin, isLoggedIn,
      login, logout, register, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
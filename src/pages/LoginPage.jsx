import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Min 6 characters";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    setApiError("");
    setIsPending(false);
    setIsRejected(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setIsPending(false);
    setIsRejected(false);

    const result = await login(form.email, form.password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else if (result.isPending) {
      setIsPending(true);
    } else if (result.isRejected) {
      setIsRejected(true);
    } else {
      setApiError(result.message);
    }
  };

  const fillDemo = (role) => {
    if (role === "admin") setForm({ email: "admin@store.com", password: "Admin@123456" });
    else setForm({ email: "user@store.com", password: "User@123456" });
    setApiError(""); setIsPending(false); setIsRejected(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-blue-600">Brand</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Demo quick fill buttons */}
        <div className="mb-6">
          <p className="text-xs text-gray-400 text-center mb-2">Quick login with demo accounts</p>
          <div className="grid grid-cols-2 gap-3">
            {/* Demo User */}
            <button onClick={() => fillDemo("user")}
              className="flex flex-col items-center gap-1.5 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-200 transition-all group">
              <span className="text-xl">👤</span>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-700 group-hover:text-blue-600">Demo User</p>
                <p className="text-xs text-gray-400">role: user</p>
              </div>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                Login instantly
              </span>
            </button>

            {/* Demo Admin */}
            <button onClick={() => fillDemo("admin")}
              className="flex flex-col items-center gap-1.5 p-3 border border-orange-200 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all group">
              <span className="text-xl">👑</span>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-700 group-hover:text-orange-600">Demo Admin</p>
                <p className="text-xs text-gray-400">role: admin</p>
              </div>
              <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                Full access
              </span>
            </button>
          </div>
        </div>

        {/* Pending notice */}
        {isPending && (
          <div className="mb-4 bg-amber-50 border border-amber-300 rounded-xl px-4 py-4 text-sm text-amber-800">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">⏳</span>
              <div>
                <p className="font-semibold mb-1">Admin Request Pending</p>
                <p className="text-xs">Your admin account request is waiting for approval. An existing admin will review your request soon.</p>
              </div>
            </div>
          </div>
        )}

        {/* Rejected notice */}
        {isRejected && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-4 text-sm text-red-700">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">❌</span>
              <div>
                <p className="font-semibold mb-1">Admin Request Rejected</p>
                <p className="text-xs">Your admin request was rejected. You can{" "}
                  <Link to="/register" className="underline font-medium">register as a regular user</Link> instead.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Generic error */}
        {apiError && !isPending && !isRejected && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="you@example.com" autoComplete="email"
              className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-colors ${errors.email ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-blue-500"}`} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <button type="button" className="text-xs text-blue-600 hover:underline">Forgot password?</button>
            </div>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" value={form.password}
                onChange={handleChange} placeholder="••••••••" autoComplete="current-password"
                className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-colors pr-10 ${errors.password ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-blue-500"}`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                  }
                </svg>
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
              : "Sign in"
            }
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
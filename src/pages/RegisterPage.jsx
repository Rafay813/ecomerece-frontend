import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "user" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingSuccess, setPendingSuccess] = useState(false); // for admin request submitted

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    else if (form.name.length < 2) e.name = "Name too short";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    const result = await register(form.name, form.email, form.password, form.role);
    setLoading(false);

    if (result.success) {
      navigate("/"); // normal user → logged in → go home
    } else if (result.isPending) {
      setPendingSuccess(true); // admin request submitted
    } else {
      setApiError(result.message);
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-blue-500", "bg-green-500"][strength];

  // ── Admin request submitted screen ───────────────────────────────────────
  if (pendingSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">⏳</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-500 text-sm mb-5">
            Your admin account request has been sent. An existing admin will review and approve or reject your request.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 text-left mb-6">
            <p className="font-semibold mb-1">What happens next?</p>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li>An admin will review your request</li>
              <li>Once approved, you can login with your credentials</li>
              <li>If rejected, you can register as a regular user</li>
            </ul>
          </div>
          <Link to="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Register form ─────────────────────────────────────────────────────────
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
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Join thousands of shoppers</p>
        </div>

        {/* Role selector */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">I want to register as</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setForm({ ...form, role: "user" })}
              className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all ${
                form.role === "user"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}>
              <span className="text-2xl">👤</span>
              <div className="text-center">
                <p className={`text-sm font-semibold ${form.role === "user" ? "text-blue-700" : "text-gray-700"}`}>
                  User
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Shop & order products</p>
              </div>
              {form.role === "user" && (
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>

            <button type="button" onClick={() => setForm({ ...form, role: "admin" })}
              className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all ${
                form.role === "admin"
                  ? "border-orange-400 bg-orange-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}>
              <span className="text-2xl">👑</span>
              <div className="text-center">
                <p className={`text-sm font-semibold ${form.role === "admin" ? "text-orange-700" : "text-gray-700"}`}>
                  Admin
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Manage store & products</p>
              </div>
              {form.role === "admin" && (
                <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* Admin note */}
          {form.role === "admin" && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700 flex items-start gap-2">
              <span className="shrink-0 mt-0.5">ℹ️</span>
              <span>Admin accounts require approval from an existing admin before you can login.</span>
            </div>
          )}
          {form.role === "user" && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 text-xs text-green-700 flex items-start gap-2">
              <span className="shrink-0 mt-0.5">✅</span>
              <span>User accounts are activated immediately — you can login right after signing up.</span>
            </div>
          )}
        </div>

        {/* Error */}
        {apiError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange}
              placeholder="John Doe" autoComplete="name"
              className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-colors ${errors.name ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-blue-500"}`} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" value={form.password}
                onChange={handleChange} placeholder="••••••••" autoComplete="new-password"
                className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-colors pr-10 ${errors.password ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-blue-500"}`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            {form.password && (
              <div className="mt-1.5">
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? strengthColor : "bg-gray-200"}`} />
                  ))}
                </div>
                <p className="text-xs text-gray-500">{strengthLabel}</p>
              </div>
            )}
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input type="password" name="confirm" value={form.confirm} onChange={handleChange}
              placeholder="••••••••" autoComplete="new-password"
              className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-colors ${errors.confirm ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-blue-500"}`} />
            {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
          </div>

          <button type="submit" disabled={loading}
            className={`w-full disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              form.role === "admin"
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}>
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {form.role === "admin" ? "Submitting request..." : "Creating account..."}</>
            ) : form.role === "admin" ? "Submit Admin Request" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
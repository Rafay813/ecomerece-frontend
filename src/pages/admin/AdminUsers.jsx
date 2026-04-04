import { useState, useEffect } from "react";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState("all"); // "all" | "pending"
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, pendingRes] = await Promise.all([
        authAPI.getAllUsers(),
        authAPI.getPendingRequests?.() || fetch(`${import.meta.env.VITE_API_URL}/auth/users/pending`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }).then(r => r.json()),
      ]);
      setUsers(usersRes.data);
      setPendingUsers(pendingRes.data || []);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleApprove = async (id, name) => {
    setActionLoading(id + "approve");
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/users/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" },
      });
      showToast(`✅ ${name}'s admin request approved!`);
      fetchAll();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject ${name}'s admin request?`)) return;
    setActionLoading(id + "reject");
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/users/${id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" },
      });
      showToast(`${name}'s request rejected.`);
      fetchAll();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return;
    setActionLoading(id + "delete");
    try {
      await authAPI.deleteUser(id);
      showToast("User deleted");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const admins = users.filter((u) => u.role === "admin" && u.status === "active").length;
  const activeUsers = users.filter((u) => u.status === "active").length;

  return (
    <div className="p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 text-sm">{users.length} registered accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users", value: users.length, color: "bg-blue-50 text-blue-700" },
          { label: "Active Admins", value: admins, color: "bg-orange-50 text-orange-700" },
          { label: "Active Accounts", value: activeUsers, color: "bg-green-50 text-green-700" },
          { label: "Pending Requests", value: pendingUsers.length, color: pendingUsers.length > 0 ? "bg-amber-50 text-amber-700 ring-2 ring-amber-300" : "bg-gray-50 text-gray-500" },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold">{loading ? "…" : s.value}</div>
            <div className="text-xs font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 w-fit">
        <button onClick={() => setTab("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          All Users ({users.length})
        </button>
        <button onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${tab === "pending" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          Pending Requests
          {pendingUsers.length > 0 && (
            <span className="bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {pendingUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* ── PENDING TAB ──────────────────────────────────────────────────────── */}
      {tab === "pending" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-gray-500 font-medium">No pending admin requests</p>
              <p className="text-gray-400 text-sm mt-1">All admin requests have been reviewed</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingUsers.map((u) => (
                <div key={u._id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-11 h-11 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-lg shrink-0">
                      {u.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">{u.name}</p>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          ⏳ Pending Admin
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{u.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Requested {new Date(u.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:shrink-0">
                    <button
                      onClick={() => handleApprove(u._id, u.name)}
                      disabled={actionLoading === u._id + "approve"}
                      className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      {actionLoading === u._id + "approve" ? "..." : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Approve</>}
                    </button>
                    <button
                      onClick={() => handleReject(u._id, u.name)}
                      disabled={actionLoading === u._id + "reject"}
                      className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 border border-red-200 text-sm px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      {actionLoading === u._id + "reject" ? "..." : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> Reject</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ALL USERS TAB ─────────────────────────────────────────────────────── */}
      {tab === "all" && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <input type="text" placeholder="Search by name or email..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-gray-200 rounded-full" /><div className="h-3 bg-gray-200 rounded w-32" /></div></td>
                        <td className="px-4 py-3 hidden md:table-cell"><div className="h-3 bg-gray-200 rounded w-40" /></td>
                        <td className="px-4 py-3"><div className="h-5 bg-gray-200 rounded-full w-14" /></td>
                        <td className="px-4 py-3"><div className="h-5 bg-gray-200 rounded-full w-14" /></td>
                        <td className="px-4 py-3 hidden lg:table-cell"><div className="h-3 bg-gray-200 rounded w-20" /></td>
                        <td className="px-4 py-3"><div className="h-7 bg-gray-200 rounded-lg w-16 ml-auto" /></td>
                      </tr>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-400">No users found</td></tr>
                  ) : filteredUsers.map((u) => {
                    const isMe = u._id === currentUser?._id;
                    const statusConfig = {
                      active: "bg-green-100 text-green-700",
                      pending: "bg-amber-100 text-amber-700",
                      rejected: "bg-red-100 text-red-600",
                    };
                    return (
                      <tr key={u._id} className={`hover:bg-gray-50 transition-colors ${isMe ? "bg-blue-50/30" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${u.role === "admin" ? "bg-orange-500" : "bg-blue-500"}`}>
                              {u.name[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{u.name} {isMe && <span className="text-xs text-blue-600">(you)</span>}</p>
                              <p className="text-xs text-gray-400 md:hidden">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.role === "admin" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                            {u.role === "admin" ? "👑 Admin" : "👤 User"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusConfig[u.status] || "bg-gray-100 text-gray-500"}`}>
                            {u.status === "pending" ? "⏳ Pending" : u.status === "rejected" ? "❌ Rejected" : "✅ Active"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                          {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3">
                          {!isMe && (
                            <button onClick={() => handleDelete(u._id, u.name)} disabled={actionLoading === u._id + "delete"}
                              className="float-right text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50">
                              {actionLoading === u._id + "delete" ? "…" : "Delete"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { orderAPI } from "../../services/api";

const STATUS_CONFIG = {
  pending:    { color: "bg-yellow-100 text-yellow-700", icon: "⏳" },
  confirmed:  { color: "bg-blue-100 text-blue-700",    icon: "✅" },
  processing: { color: "bg-purple-100 text-purple-700", icon: "⚙️" },
  shipped:    { color: "bg-orange-100 text-orange-700", icon: "🚚" },
  delivered:  { color: "bg-green-100 text-green-700",  icon: "📦" },
  cancelled:  { color: "bg-red-100 text-red-600",      icon: "❌" },
};

const STATUS_STEPS = ["confirmed", "processing", "shipped", "delivered"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filterStatus) params.status = filterStatus;
      // ✅ Use getMyAdminOrders — only this admin's orders
      const res = await orderAPI.getMyAdminOrders(params);
      setOrders(res.data);
      setPagination(res.pagination);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filterStatus, page]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await orderAPI.updateStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: res.data.status } : o)));
      showToast(`Order marked as "${newStatus}"`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setUpdating(null);
    }
  };

  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500 text-sm">{pagination?.total ?? "..."} orders containing your products</p>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
          <button key={status}
            onClick={() => { setFilterStatus(filterStatus === status ? "" : status); setPage(1); }}
            className={`rounded-xl p-3 text-center border-2 transition-all ${filterStatus === status ? "border-blue-500 bg-blue-50" : "border-transparent bg-white hover:border-gray-300"}`}>
            <div className="text-xl mb-1">{cfg.icon}</div>
            <div className="text-lg font-bold text-gray-900">{counts[status] || 0}</div>
            <div className="text-xs text-gray-500 capitalize">{status}</div>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 mb-4 items-center">
        <span className="text-sm text-gray-600 font-medium">Filter:</span>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setFilterStatus(""); setPage(1); }}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterStatus === "" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:border-gray-400"}`}>
            All
          </button>
          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
            <button key={status}
              onClick={() => { setFilterStatus(status); setPage(1); }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${filterStatus === status ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:border-gray-400"}`}>
              {cfg.icon} {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex justify-between mb-3">
                <div className="h-4 bg-gray-200 rounded w-40" />
                <div className="h-6 bg-gray-200 rounded-full w-24" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-56 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-32" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">No orders yet</h2>
          <p className="text-gray-500 text-sm">
            {filterStatus ? `No orders with status "${filterStatus}"` : "No orders for your products yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const isExpanded = expanded === order._id;
            const currentStepIndex = STATUS_STEPS.indexOf(order.status);

            return (
              <div key={order._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <p className="font-mono text-sm font-bold text-gray-800">#{order._id.slice(-10).toUpperCase()}</p>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                          {cfg.icon} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>📅 {new Date(order.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        <span>🛍️ {order.items?.length} item{order.items?.length !== 1 ? "s" : ""} (yours)</span>
                        <span className="font-semibold text-gray-800">${order.itemsTotal?.toFixed(2)}</span>
                      </div>
                      {/* Customer info */}
                      <div className="mt-2 text-xs text-gray-500">
                        <span className="font-medium text-gray-700">{order.shippingAddress?.fullName}</span>
                        <span className="mx-1">·</span>
                        <span>{order.shippingAddress?.phone}</span>
                        <span className="mx-1">·</span>
                        <span>{order.shippingAddress?.city}, {order.shippingAddress?.country}</span>
                      </div>
                    </div>

                    {/* Status updater */}
                    {!["delivered", "cancelled"].includes(order.status) && (
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <p className="text-xs text-gray-400 text-right">Update status</p>
                        <div className="flex gap-1.5 flex-wrap justify-end">
                          {STATUS_STEPS.filter((s) => STATUS_STEPS.indexOf(s) > currentStepIndex).map((nextStatus) => (
                            <button key={nextStatus}
                              onClick={() => handleStatusUpdate(order._id, nextStatus)}
                              disabled={updating === order._id}
                              className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1.5 rounded-lg transition-colors capitalize font-medium">
                              {updating === order._id ? "..." : `→ ${nextStatus}`}
                            </button>
                          ))}
                          <button onClick={() => handleStatusUpdate(order._id, "cancelled")}
                            disabled={updating === order._id}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition-colors font-medium">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Item previews — only this admin's items */}
                  <div className="flex gap-2 mb-3">
                    {order.items?.slice(0, 4).map((item, i) => (
                      <div key={i} className="relative">
                        <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        {item.quantity > 1 && (
                          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center leading-none">
                            {item.quantity}
                          </span>
                        )}
                      </div>
                    ))}
                    {order.items?.length > 4 && (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 font-medium">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  <button onClick={() => setExpanded(isExpanded ? null : order._id)}
                    className="text-xs text-blue-600 hover:underline font-medium">
                    {isExpanded ? "Hide details ▲" : "View details ▼"}
                  </button>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-4">
                    {/* Progress tracker */}
                    {!["cancelled"].includes(order.status) && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Order Progress</p>
                        <div className="flex items-start gap-1">
                          {STATUS_STEPS.map((step, i) => {
                            const isDone = STATUS_STEPS.indexOf(order.status) > i;
                            const isActive = step === order.status;
                            return (
                              <div key={step} className="flex-1 flex flex-col items-center gap-1">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? "bg-green-500 text-white" : isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                                  {isDone ? "✓" : i + 1}
                                </div>
                                <span className={`text-xs capitalize text-center ${isActive ? "text-blue-600 font-medium" : isDone ? "text-green-600" : "text-gray-400"}`}>
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Only this admin's items */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Items in This Order</p>
                      <div className="space-y-2">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-contain bg-gray-50 rounded-lg shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                              <p className="text-xs text-gray-400">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                            </div>
                            <span className="text-sm font-bold text-gray-900 shrink-0">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery address */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivery Address</p>
                      <div className="bg-white rounded-xl p-3 border border-gray-100 text-sm text-gray-700 space-y-0.5">
                        <p className="font-medium">{order.shippingAddress?.fullName}</p>
                        <p className="text-xs text-gray-500">{order.shippingAddress?.phone}</p>
                        <p className="text-xs text-gray-500">{order.shippingAddress?.address}</p>
                        <p className="text-xs text-gray-500">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                        <p className="text-xs text-gray-500">{order.shippingAddress?.country}</p>
                      </div>
                    </div>

                    {/* Your earnings from this order */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Earnings</p>
                      <div className="bg-white rounded-xl p-3 border border-gray-100 text-sm space-y-1.5">
                        <div className="flex justify-between text-gray-600">
                          <span>Items subtotal</span>
                          <span>${order.itemsTotal?.toFixed(2)}</span>
                        </div>
                        <hr className="border-gray-100" />
                        <div className="flex justify-between font-bold text-gray-900">
                          <span>Your Total (COD)</span>
                          <span>${order.itemsTotal?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {order.notes && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Customer Notes</p>
                        <p className="text-sm text-gray-600 bg-white rounded-xl p-3 border border-gray-100">{order.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">← Prev</button>
            <button onClick={() => setPage(page + 1)} disabled={page === pagination.totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
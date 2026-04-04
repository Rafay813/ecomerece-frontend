import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderAPI } from "../services/api";
import { useCart } from "../context/CartContext"; // ✅ FIX 1: import CartContext

const STATUS_CONFIG = {
  pending:    { color: "bg-yellow-100 text-yellow-700", icon: "⏳" },
  confirmed:  { color: "bg-blue-100 text-blue-700",    icon: "✅" },
  processing: { color: "bg-purple-100 text-purple-700", icon: "⚙️" },
  shipped:    { color: "bg-orange-100 text-orange-700", icon: "🚚" },
  delivered:  { color: "bg-green-100 text-green-700",  icon: "📦" },
  cancelled:  { color: "bg-red-100 text-red-600",      icon: "❌" },
};

export default function MyOrdersPage() {
  const { sessionId } = useCart(); // ✅ FIX 2: get real sessionId from context

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await orderAPI.getMy(sessionId); // ✅ FIX 3: use sessionId from context
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) load(); // ✅ FIX 4: only fetch once sessionId is available
  }, [sessionId]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    setCancelling(id);
    try {
      const res = await orderAPI.cancel(id);
      setOrders((prev) => prev.map((o) => (o._id === id ? res.data : o)));
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
              <div className="flex justify-between mb-3">
                <div className="h-4 bg-gray-200 rounded w-40" />
                <div className="h-6 bg-gray-200 rounded-full w-24" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-32 mb-4" />
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-500 text-sm">{orders.length} order{orders.length !== 1 ? "s" : ""} found</p>
          </div>
          <Link to="/products" className="text-sm text-blue-600 hover:underline">Continue Shopping</Link>
        </div>

        {/* Empty state */}
        {orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-500 text-sm mb-6">Start shopping and your orders will appear here.</p>
            <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Browse Products
            </Link>
          </div>
        )}

        {/* Orders list */}
        <div className="space-y-4">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const isExpanded = expanded === order._id;

            return (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Order header */}
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                      <p className="font-mono text-sm text-gray-700 font-medium">{order._id.slice(-12).toUpperCase()}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 ${cfg.color}`}>
                      {cfg.icon} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 mb-4">
                    <span>📅 {new Date(order.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span>🛍️ {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</span>
                    <span>💵 Cash on Delivery</span>
                    <span className="font-semibold text-gray-900">${order.totalAmount?.toFixed(2)}</span>
                  </div>

                  {/* Preview items (first 3) */}
                  <div className="flex gap-2 mb-4">
                    {order.items?.slice(0, 3).map((item, i) => (
                      <div key={i} className="relative">
                        <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        {item.quantity > 1 && (
                          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center leading-none">
                            {item.quantity}
                          </span>
                        )}
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 font-medium">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>

                  {/* COD notice for pending/confirmed */}
                  {["pending", "confirmed"].includes(order.status) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700 flex items-center gap-2 mb-4">
                      💵 Please prepare <strong>${order.totalAmount?.toFixed(2)}</strong> cash for delivery
                    </div>
                  )}
                  {order.status === "delivered" && (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 text-xs text-green-700 flex items-center gap-2 mb-4">
                      ✅ Delivered on {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : "—"}
                    </div>
                  )}

                  {/* Actions row */}
                  <div className="flex items-center gap-3">
                    <button onClick={() => setExpanded(isExpanded ? null : order._id)}
                      className="text-xs text-blue-600 hover:underline font-medium">
                      {isExpanded ? "Hide details ▲" : "View details ▼"}
                    </button>
                    {!["shipped", "delivered", "cancelled"].includes(order.status) && (
                      <button onClick={() => handleCancel(order._id)} disabled={cancelling === order._id}
                        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors">
                        {cancelling === order._id ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-4">
                    {/* All items */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Items Ordered</h4>
                      <div className="space-y-2">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-contain bg-gray-50 rounded-lg" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                              <p className="text-xs text-gray-400">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                            </div>
                            <span className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery address */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivery Address</h4>
                      <div className="bg-white rounded-xl p-3 border border-gray-100 text-sm text-gray-700">
                        <p className="font-medium">{order.shippingAddress?.fullName}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{order.shippingAddress?.phone}</p>
                        <p className="text-gray-500 text-xs">{order.shippingAddress?.address}, {order.shippingAddress?.city} {order.shippingAddress?.postalCode}</p>
                        <p className="text-gray-500 text-xs">{order.shippingAddress?.country}</p>
                      </div>
                    </div>

                    {/* Price breakdown */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price Breakdown</h4>
                      <div className="bg-white rounded-xl p-3 border border-gray-100 text-sm space-y-1.5">
                        <div className="flex justify-between text-gray-600">
                          <span>Items Total</span><span>${order.itemsTotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Shipping</span>
                          <span className={order.shippingCost === 0 ? "text-green-600" : ""}>
                            {order.shippingCost === 0 ? "FREE" : `$${order.shippingCost?.toFixed(2)}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Tax</span><span>${order.taxAmount?.toFixed(2)}</span>
                        </div>
                        <hr className="border-gray-100" />
                        <div className="flex justify-between font-bold text-gray-900">
                          <span>Total (COD)</span><span>${order.totalAmount?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {order.notes && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</h4>
                        <p className="text-sm text-gray-600 bg-white rounded-xl p-3 border border-gray-100">{order.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
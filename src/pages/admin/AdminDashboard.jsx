import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productAPI, authAPI, orderAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function StatCard({ title, value, sub, icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ myProducts: 0, myOrders: 0, users: 0, categories: 0 });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [myProdRes, catRes, usersRes, myOrderRes] = await Promise.all([
          productAPI.getMine({ limit: 5, sort: "createdAt" }),   // ✅ only my products
          productAPI.getCategories(),
          authAPI.getAllUsers(),
          orderAPI.getMyAdminOrders({ limit: 5 }),               // ✅ only my orders
        ]);
        setStats({
          myProducts: myProdRes.pagination.total,
          myOrders: myOrderRes.pagination.total,
          users: usersRes.total,
          categories: catRes.data.length,
        });
        setRecentProducts(myProdRes.data);
        setRecentOrders(myOrderRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const STATUS_COLOR = {
    confirmed:  "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    shipped:    "bg-orange-100 text-orange-700",
    delivered:  "bg-green-100 text-green-700",
    cancelled:  "bg-red-100 text-red-600",
    pending:    "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, <span className="font-medium text-blue-600">{user?.name}</span>! Here's your store overview.
        </p>
      </div>

      {/* Stats grid — shows THIS admin's stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="My Products" value={loading ? "…" : stats.myProducts} sub="listed by you" icon="📦" color="bg-blue-500" />
        <StatCard title="My Orders" value={loading ? "…" : stats.myOrders} sub="orders with your items" icon="🛒" color="bg-green-500" />
        <StatCard title="Categories" value={loading ? "…" : stats.categories} sub="store categories" icon="🏷️" color="bg-purple-500" />
        <StatCard title="Total Users" value={loading ? "…" : stats.users} sub="registered accounts" icon="👥" color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: "/admin/products/new", label: "Add Product",     icon: "➕", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
              { to: "/admin/products",     label: "My Products",     icon: "📋", color: "bg-green-50 text-green-700 hover:bg-green-100" },
              { to: "/admin/orders",       label: "My Orders",       icon: "🛒", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
              { to: "/",                   label: "View Store",      icon: "🏪", color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
            ].map((a) => (
              <Link key={a.to} to={a.to} className={`${a.color} rounded-xl p-4 text-center transition-colors`}>
                <div className="text-2xl mb-1">{a.icon}</div>
                <p className="text-xs font-medium">{a.label}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* My recent products */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">My Recent Products</h2>
            <Link to="/admin/products" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}</div>
          ) : recentProducts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm">No products yet</p>
              <Link to="/admin/products/new" className="text-blue-600 text-xs hover:underline mt-1 inline-block">Add your first product →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProducts.map((p) => (
                <div key={p._id} className="flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-10 h-10 object-contain bg-gray-50 rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">${p.price.toFixed(2)} · {p.stock} in stock</p>
                  </div>
                  <Link to={`/admin/products/${p._id}/edit`} className="text-xs text-blue-600 hover:underline shrink-0">Edit</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My recent orders */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">My Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs text-blue-600 hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-20" />
            </div>
          ))}</div>
        ) : recentOrders.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No orders for your products yet</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex gap-1 shrink-0">
                  {order.items?.slice(0, 2).map((item, i) => (
                    <img key={i} src={item.image} alt={item.name}
                      className="w-10 h-10 object-contain bg-white rounded-lg border border-gray-100" />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">
                    {order.shippingAddress?.fullName} · {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_COLOR[order.status] || "bg-gray-100 text-gray-600"}`}>
                    {order.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">${order.itemsTotal?.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
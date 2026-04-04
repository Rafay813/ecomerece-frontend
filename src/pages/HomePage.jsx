import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFeaturedProducts, useProducts, useCategories } from "../hooks/useProducts";
import { ProductCardSkeleton, ErrorMessage } from "../components/ui/Skeletons";
import { useAuth } from "../context/AuthContext";

const extraServices = [
  { title: "Source from Industry Hubs", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&h=200&fit=crop", icon: "🔍" },
  { title: "Customize Your Products", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop", icon: "📦" },
  { title: "Fast, reliable shipping by ocean or air", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&h=200&fit=crop", icon: "✈️" },
  { title: "Product monitoring and inspection", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop", icon: "🛡️" },
];

function Countdown() {
  const [time, setTime] = useState({ days: 4, hours: 13, mins: 34, secs: 56 });
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { days, hours, mins, secs } = prev;
        secs--;
        if (secs < 0) { secs = 59; mins--; }
        if (mins < 0) { mins = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        return { days, hours, mins, secs };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <div className="flex gap-2">
      {[["Days", time.days], ["Hour", time.hours], ["Min", time.mins], ["Sec", time.secs]].map(([label, val]) => (
        <div key={label} className="bg-gray-700 text-white rounded-md px-3 py-2 text-center min-w-[52px]">
          <div className="text-lg font-bold leading-tight">{pad(val)}</div>
          <div className="text-xs text-gray-300">{label}</div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { products: featuredProducts, loading: featuredLoading, error: featuredError } = useFeaturedProducts();
  const { products: allProducts, loading: allLoading } = useProducts({ limit: 10, sort: "orders" });
  const { categories } = useCategories();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) setActiveCategory(categories[0]);
  }, [categories, activeCategory]);

  // ── Navigate to products page with category filter ────────────────────────
  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    navigate(`/products?category=${encodeURIComponent(cat)}`);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Category sidebar — each click navigates to /products?category=... */}
          <div className="hidden md:block bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 mb-2">Categories</p>
            <ul className="space-y-0.5">
              {(categories.length > 0
                ? categories
                : ["Electronics", "Clothing", "Home & Outdoor", "Smartphones"]
              ).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${
                      activeCategory === cat
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    }`}
                  >
                    <span>{cat}</span>
                    <svg className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${activeCategory === cat ? "opacity-100" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </li>
              ))}
              {/* View all link */}
              <li className="pt-2 border-t border-gray-100 mt-2">
                <Link to="/products"
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-1 font-medium transition-colors">
                  View all products →
                </Link>
              </li>
            </ul>
          </div>

          {/* Banner */}
          <div className="md:col-span-2 bg-teal-100 rounded-xl overflow-hidden relative flex items-center min-h-[280px]">
            <div className="p-8 z-10">
              <p className="text-gray-700 text-lg">Latest trending</p>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">Electronic items</h2>
              <button
                onClick={() => navigate("/products?category=Electronics")}
                className="mt-6 inline-block bg-white text-gray-800 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-50 border border-gray-200 shadow-sm transition-colors"
              >
                Learn more
              </button>
            </div>
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
              alt="Electronics"
              className="absolute right-0 bottom-0 h-full w-3/5 object-cover opacity-80"
            />
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[140px]">{user?.email}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Link to="/admin"
                      className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-sm text-center py-2 rounded-lg transition-colors mb-2">
                      👑 Admin Panel
                    </Link>
                  )}
                  <Link to="/products"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm text-center py-2 rounded-lg transition-colors mb-2">
                    Browse Products
                  </Link>
                  <button onClick={logout}
                    className="w-full border border-gray-200 text-red-500 text-sm text-center py-2 rounded-lg hover:bg-red-50 transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Hi, user</p>
                      <p className="text-xs text-gray-500">let's get started</p>
                    </div>
                  </div>
                  <Link to="/register"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm text-center py-2 rounded-lg transition-colors mb-2">
                    Join now
                  </Link>
                  <Link to="/login"
                    className="block w-full border border-gray-200 text-blue-600 text-sm text-center py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    Log in
                  </Link>
                </>
              )}
            </div>
            <div className="bg-orange-400 rounded-xl p-4 text-white text-sm font-medium cursor-pointer hover:bg-orange-500 transition-colors">
              Get US $10 off with a new supplier
            </div>
            <div className="bg-teal-500 rounded-xl p-4 text-white text-sm font-medium cursor-pointer hover:bg-teal-600 transition-colors">
              Send quotes with supplier preferences
            </div>
          </div>
        </div>

        {/* ── Deals and offers ──────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="p-5 md:w-52 shrink-0 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">Deals and offers</h3>
              <p className="text-sm text-gray-500 mb-3">Limited time discounts</p>
              <Countdown />
            </div>
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-gray-100 overflow-hidden">
              {featuredLoading
                ? [...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 flex flex-col items-center gap-2 animate-pulse">
                      <div className="bg-gray-200 w-20 h-20 rounded" />
                      <div className="bg-gray-200 h-3 w-16 rounded" />
                      <div className="bg-gray-200 h-5 w-12 rounded-full" />
                    </div>
                  ))
                : featuredProducts.filter((p) => p.discount > 0).slice(0, 5).map((p) => (
                    <Link key={p._id} to={`/products/${p._id}`}
                      className="p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors group">
                      <img src={p.image} alt={p.name} className="w-20 h-20 object-contain group-hover:scale-105 transition-transform" />
                      <p className="text-sm text-gray-700 text-center line-clamp-1">{p.name}</p>
                      <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                        -{p.discount}%
                      </span>
                    </Link>
                  ))
              }
            </div>
          </div>
        </div>

        {/* ── Category sections ─────────────────────────────────────────── */}
        {["Home & Outdoor", "Electronics"].map((catName) => {
          const catProducts = allProducts.filter((p) =>
            p.category === catName || p.category.includes(catName.split(" ")[0])
          );
          if (catProducts.length === 0 && !allLoading) return null;
          return (
            <div key={catName} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-5">
                <div className={`${catName === "Home & Outdoor" ? "bg-amber-50" : "bg-blue-50"} p-5 flex flex-col justify-between md:col-span-1`}>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{catName}</h3>
                    <button
                      onClick={() => navigate(`/products?category=${encodeURIComponent(catName)}`)}
                      className="inline-block bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                    >
                      Source now
                    </button>
                  </div>
                </div>
                <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-gray-100">
                  {(allLoading ? [...Array(8)] : allProducts.slice(0, 8)).map((item, i) => (
                    item ? (
                      <Link key={item._id} to={`/products/${item._id}`}
                        className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                        <div>
                          <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">From<br /><span className="text-gray-600">USD {item.price}</span></p>
                        </div>
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-contain rounded" />
                      </Link>
                    ) : (
                      <div key={i} className="p-3 animate-pulse">
                        <div className="bg-gray-200 h-3 w-20 rounded mb-2" />
                        <div className="bg-gray-200 h-3 w-12 rounded" />
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* ── Supplier quote banner ──────────────────────────────────────── */}
        <div className="rounded-xl overflow-hidden relative bg-blue-600 min-h-[280px] flex flex-col md:flex-row items-center">
          <div className="p-8 z-10 relative flex-1">
            <h2 className="text-2xl font-bold text-white max-w-xs">An easy way to send requests to all suppliers</h2>
            <p className="text-blue-100 text-sm mt-3 max-w-sm">Get matched with verified suppliers worldwide.</p>
          </div>
          <div className="p-6 z-10 relative w-full md:w-auto">
            <div className="bg-white rounded-xl p-6 md:w-80 shadow-xl">
              <h3 className="font-semibold text-gray-800 mb-4">Send quote to suppliers</h3>
              <div className="space-y-3">
                <input type="text" placeholder="What item you need?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                <textarea placeholder="Type more details" rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none" />
                <div className="flex gap-2">
                  <input type="number" placeholder="Quantity"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  <select className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none bg-white">
                    <option>Pcs</option><option>Kg</option><option>Box</option>
                  </select>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                  Send inquiry
                </button>
              </div>
            </div>
          </div>
          <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=300&fit=crop"
            alt="warehouse" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        </div>

        {/* ── Recommended items ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recommended items</h2>
            <Link to="/products" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {featuredError ? (
            <ErrorMessage message={featuredError} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {featuredLoading
                ? [...Array(10)].map((_, i) => <ProductCardSkeleton key={i} />)
                : allProducts.map((p) => (
                    <Link key={p._id} to={`/products/${p._id}`}
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
                      <div className="bg-gray-50 h-40 flex items-center justify-center p-3 overflow-hidden">
                        <img src={p.image} alt={p.name}
                          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="p-3">
                        <span className="font-bold text-gray-900 text-sm">${p.price.toFixed(2)}</span>
                        {p.discount > 0 && (
                          <span className="ml-2 text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">-{p.discount}%</span>
                        )}
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.name}</p>
                      </div>
                    </Link>
                  ))
              }
            </div>
          )}
        </div>

        {/* ── Extra services ─────────────────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Our extra services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {extraServices.map((s, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                <div className="relative h-36 overflow-hidden">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow text-lg">{s.icon}</div>
                </div>
                <div className="p-3"><p className="text-sm font-medium text-gray-700">{s.title}</p></div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
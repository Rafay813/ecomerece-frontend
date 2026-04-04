import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useCategories } from "../../hooks/useProducts";

const navLinks = ["Hot offers", "Gift boxes", "Projects", "Menu item"];

export default function Header() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All category");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { count } = useCart();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { categories } = useCategories(); // ← real categories from API
  const menuRef = useRef(null);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Search handler ────────────────────────────────────────────────────────
  // Builds URL with both search text AND selected category
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (selectedCategory !== "All category") params.set("category", selectedCategory);
    navigate(`/products${params.toString() ? `?${params.toString()}` : ""}`);
    setMobileMenuOpen(false);
  };

  // ── Category dropdown change ───────────────────────────────────────────────
  // If no search text, immediately navigate to that category
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (!search.trim()) {
      if (cat === "All category") {
        navigate("/products");
      } else {
        navigate(`/products?category=${encodeURIComponent(cat)}`);
      }
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-blue-600">Brand</span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center border border-gray-300 rounded-md overflow-hidden max-w-2xl">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 text-sm outline-none"
          />
          {/* Category dropdown — real categories from API */}
          <div className="border-l border-gray-300 shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="outline-none bg-transparent text-sm text-gray-600 cursor-pointer px-2 py-2 max-w-[140px]"
            >
              <option value="All category">All category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm font-medium transition-colors">
            Search
          </button>
        </form>

        {/* Right icons - desktop */}
        <div className="hidden md:flex items-center gap-5 shrink-0">
          {/* Profile / User menu */}
          {isLoggedIn ? (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs mt-0.5 max-w-[60px] truncate">{user?.name?.split(" ")[0]}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                        👑 Admin
                      </span>
                    )}
                  </div>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin Panel
                    </Link>
                  )}
                  <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My Orders
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left border-t border-gray-100 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs mt-0.5">Profile</span>
            </Link>
          )}

          {/* Message */}
          <Link to="#" className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-xs mt-0.5">Message</span>
          </Link>

          {/* Orders */}
          <Link to="/orders" className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs mt-0.5">Orders</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors relative">
            <div className="relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </div>
            <span className="text-xs mt-0.5">My cart</span>
          </Link>
        </div>

        {/* Mobile: cart + menu */}
        <div className="md:hidden flex items-center gap-3">
          <Link to="/cart" className="relative text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button className="p-1 text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Secondary nav ──────────────────────────────────────────────── */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <Link to="/products" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              All category
            </Link>
            {navLinks.map((link) => (
              <Link key={link} to="#" className="hidden md:block text-gray-700 hover:text-blue-600 transition-colors">{link}</Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Panel
              </Link>
            )}
            {!isLoggedIn && (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors">Sign in</Link>
                <span className="text-gray-300">|</span>
                <Link to="/register" className="text-blue-600 hover:underline font-medium">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile menu ────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1">
          {/* Mobile category list */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Categories</p>
          <div className="grid grid-cols-2 gap-1 mb-3">
            {categories.slice(0, 6).map((cat) => (
              <button key={cat} onClick={() => { navigate(`/products?category=${encodeURIComponent(cat)}`); setMobileMenuOpen(false); }}
                className="text-left text-sm text-gray-700 py-1.5 px-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                {cat}
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-2">
            {navLinks.map((link) => (
              <Link key={link} to="#" className="block text-sm text-gray-700 py-2 hover:text-blue-600">{link}</Link>
            ))}
            <Link to="/products" className="block text-sm text-blue-600 py-2 font-medium">All Products →</Link>
          </div>
          <div className="border-t border-gray-100 pt-2 mt-1">
            {isLoggedIn ? (
              <>
                <p className="text-xs text-gray-400 mb-2">Signed in as {user?.name}</p>
                {isAdmin && <Link to="/admin" className="block text-sm text-orange-600 py-2 font-medium">👑 Admin Panel</Link>}
                <Link to="/orders" className="block text-sm text-gray-700 py-2">My Orders</Link>
                <button onClick={handleLogout} className="block text-sm text-red-500 py-2 w-full text-left">Logout</button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="flex-1 text-center border border-gray-300 text-gray-700 text-sm py-2 rounded-lg">Sign in</Link>
                <Link to="/register" className="flex-1 text-center bg-blue-600 text-white text-sm py-2 rounded-lg">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
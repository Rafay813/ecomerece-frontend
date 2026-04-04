import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productAPI } from "../../services/api";

export default function AdminProducts() {
  const Navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ Use getMine — only fetches this admin's products
      const res = await productAPI.getMine({ search, category, page, limit: 12 });
      setProducts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    productAPI.getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await productAPI.delete(id);
      showToast("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg flex items-center gap-2 transition-all ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
          {toast.type === "error" ? "❌" : "✅"} {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-500 text-sm">{pagination?.total ?? "..."} products listed by you</p>
        </div>
        <Link to="/admin/products/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 mb-4">
        <input type="text" placeholder="Search your products..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[180px] border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-blue-400">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => { setSearch(""); setCategory(""); setPage(1); }}
          className="text-sm text-gray-500 hover:text-red-500 border border-gray-200 px-3 py-2 rounded-lg transition-colors">
          Reset
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Featured</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-200 rounded-lg" /><div className="h-3 bg-gray-200 rounded w-40" /></div></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-3 bg-gray-200 rounded w-20" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-16" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-3 bg-gray-200 rounded w-12" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-3 bg-gray-200 rounded w-10" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="font-medium text-gray-500">You haven't listed any products yet</p>
                    <Link to="/admin/products/new" className="text-blue-600 text-sm hover:underline mt-1 inline-block">Add your first product →</Link>
                  </td>
                </tr>
              ) : products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 object-contain bg-gray-50 rounded-lg shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate max-w-[200px]">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{p.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-900">${p.price.toFixed(2)}</span>
                    {p.discount > 0 && <span className="ml-1 text-xs text-red-500">-{p.discount}%</span>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.stock > 10 ? "bg-green-100 text-green-700" : p.stock > 0 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                      {p.stock === 0 ? "Out" : p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs ${p.isFeatured ? "text-yellow-500" : "text-gray-300"}`}>
                      {p.isFeatured ? "⭐ Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/products/${p._id}/edit`}
                        className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors font-medium">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(p._id, p.name)} disabled={deleting === p._id}
                        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50">
                        {deleting === p._id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between text-sm text-gray-600">
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={!pagination.hasPrev}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">← Prev</button>
              <button onClick={() => setPage(page + 1)} disabled={!pagination.hasNext}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
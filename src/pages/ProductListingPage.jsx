import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useProducts, useCategories } from "../hooks/useProducts";
import { ProductCardList, ProductCardGrid } from "../components/ui/ProductCard";
import { ProductListSkeleton, ProductCardSkeleton, ErrorMessage } from "../components/ui/Skeletons";

const BRANDS = ["Samsung", "Apple", "Huawei", "Xiaomi", "Sony", "Canon", "GoPro", "Dell", "Amazfit"];
const CONDITIONS = ["Any", "Refurbished", "Brand new", "Old items"];
const RATINGS = [5, 4, 3, 2];

function StarRow({ count }) {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < count ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button className="flex items-center justify-between w-full mb-3" onClick={() => setOpen(!open)}>
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      {open && children}
    </div>
  );
}

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filters from URL
  const [viewMode, setViewMode] = useState("list");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [condition, setCondition] = useState("Any");
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [page, setPage] = useState(1);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const { categories } = useCategories();

  const searchQuery = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("category") || "";

  // Build API query params
  const apiParams = {
    ...(searchQuery && { search: searchQuery }),
    ...(categoryFilter && { category: categoryFilter }),
    ...(selectedBrands.length === 1 && { brand: selectedBrands[0] }),
    ...(condition !== "Any" && { condition }),
    ...(priceMin && { minPrice: priceMin }),
    ...(priceMax && { maxPrice: priceMax }),
    sort,
    page,
    limit: 10,
  };

  const { products, pagination, loading, error, refetch } = useProducts(apiParams);

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [searchQuery, categoryFilter, JSON.stringify(selectedBrands), condition, priceMin, priceMax, sort]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>›</span>
          {categoryFilter ? (
            <>
              <Link to="/products" className="hover:text-blue-600">Products</Link>
              <span>›</span>
              <span className="text-gray-700">{categoryFilter}</span>
            </>
          ) : searchQuery ? (
            <>
              <span className="text-gray-700">Search: "{searchQuery}"</span>
            </>
          ) : (
            <span className="text-gray-700">All Products</span>
          )}
        </nav>

        <div className="flex gap-4">
          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className="hidden md:block w-60 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-28">
              {/* Category filter */}
              <FilterSection title="Category">
                <ul className="space-y-1.5">
                  <li>
                    <button
                      onClick={() => { searchParams.delete("category"); setSearchParams(searchParams); }}
                      className={`text-sm block py-0.5 w-full text-left ${!categoryFilter ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}`}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => { searchParams.set("category", cat); setSearchParams(searchParams); }}
                        className={`text-sm block py-0.5 w-full text-left transition-colors ${categoryFilter === cat ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </FilterSection>

              {/* Brands */}
              <FilterSection title="Brands">
                <div className="space-y-2">
                  {BRANDS.slice(0, 6).map((b) => (
                    <label key={b} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggle(selectedBrands, setSelectedBrands, b)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
                      <span className="text-sm text-gray-600 group-hover:text-blue-600">{b}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Price range */}
              <FilterSection title="Price range">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-400" />
                    <input type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <button onClick={() => setPage(1)}
                    className="w-full border border-blue-500 text-blue-600 rounded-lg py-1.5 text-sm hover:bg-blue-50 transition-colors">
                    Apply
                  </button>
                </div>
              </FilterSection>

              {/* Condition */}
              <FilterSection title="Condition">
                <div className="space-y-2">
                  {CONDITIONS.map((c) => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="condition" value={c} checked={condition === c} onChange={() => setCondition(c)}
                        className="w-4 h-4 text-blue-600 cursor-pointer" />
                      <span className="text-sm text-gray-600">{c}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Ratings */}
              <FilterSection title="Ratings">
                <div className="space-y-2">
                  {RATINGS.map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedRatings.includes(r)} onChange={() => toggle(selectedRatings, setSelectedRatings, r)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
                      <StarRow count={r} />
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Reset */}
              <button
                onClick={() => { setSelectedBrands([]); setCondition("Any"); setSelectedRatings([]); setPriceMin(""); setPriceMax(""); setSort("createdAt"); }}
                className="w-full text-sm text-gray-500 hover:text-red-500 underline mt-1 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="text-sm text-gray-600">
                {loading ? (
                  <span className="animate-pulse bg-gray-200 rounded h-4 w-32 inline-block" />
                ) : (
                  <><span className="font-semibold">{pagination?.total ?? 0}</span> products found</>
                )}
              </p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                  Verified only
                </label>
                <select value={sort} onChange={(e) => setSort(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none bg-white focus:border-blue-400">
                  <option value="createdAt">Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="orders">Most Popular</option>
                </select>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button onClick={() => setViewMode("grid")} className={`p-1.5 ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" /></svg>
                  </button>
                  <button onClick={() => setViewMode("list")} className={`p-1.5 border-l border-gray-300 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {error ? (
              <ErrorMessage message={error} onRetry={refetch} />
            ) : loading ? (
              viewMode === "list" ? (
                <div className="space-y-3">{[...Array(5)].map((_, i) => <ProductListSkeleton key={i} />)}</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}</div>
              )
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">No products found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search term</p>
                <button onClick={() => { setSelectedBrands([]); setCondition("Any"); setPriceMin(""); setPriceMax(""); searchParams.delete("search"); searchParams.delete("category"); setSearchParams(searchParams); }}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Clear filters
                </button>
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-3">{products.map((p) => <ProductCardList key={p._id} product={p} />)}</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{products.map((p) => <ProductCardGrid key={p._id} product={p} />)}</div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-end gap-2 mt-6">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={!pagination.hasPrev}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => (
                  <button key={i + 1} onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg border text-sm ${page === i + 1 ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={!pagination.hasNext}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
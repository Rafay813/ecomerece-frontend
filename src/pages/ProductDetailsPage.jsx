import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProduct, useProducts } from "../hooks/useProducts";
import { useCart } from "../context/CartContext";
import { PageLoader, ErrorMessage } from "../components/ui/Skeletons";

const StarRating = ({ rating }) => {
  const full = Math.floor(rating / 2);
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className={`w-4 h-4 ${i < full ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className="text-sm text-gray-500">{rating}</span>
    </div>
  );
};

function ProductDetailsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="bg-gray-200 h-64 rounded-xl mb-4" />
        <div className="flex gap-2">{[...Array(4)].map((_, i) => <div key={i} className="bg-gray-200 w-16 h-16 rounded-lg" />)}</div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <div className="bg-gray-200 h-6 rounded w-3/4" />
        <div className="bg-gray-200 h-4 rounded w-1/2" />
        <div className="bg-gray-200 h-8 rounded w-1/3" />
        <div className="bg-gray-200 h-3 rounded w-full" />
        <div className="bg-gray-200 h-3 rounded w-5/6" />
      </div>
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 h-40 animate-pulse bg-gray-100" />
        <div className="bg-white rounded-xl border border-gray-200 p-4 h-24 animate-pulse bg-gray-100" />
      </div>
    </div>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);
  const { products: related } = useProducts({ limit: 5 });
  const { addToCart, loading: cartLoading } = useCart();

  const [selectedImg, setSelectedImg] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [addedFeedback, setAddedFeedback] = useState(false);

  const currentImg = selectedImg || product?.image;

  const handleAddToCart = async () => {
    await addToCart(product, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  if (loading) return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <ProductDetailsSkeleton />
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorMessage message={error} />
        <div className="text-center mt-4">
          <Link to="/products" className="text-blue-600 hover:underline text-sm">← Back to products</Link>
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const allImages = [product.image, ...(product.images || [])].filter(Boolean);
  const relatedProducts = related.filter((p) => p._id !== product._id && p.category === product.category).slice(0, 5);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1 flex-wrap">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>›</span>
          <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-blue-600">{product.category}</Link>
          <span>›</span>
          <span className="text-gray-700 line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ── Image gallery ─────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="bg-gray-50 rounded-xl h-64 flex items-center justify-center mb-4 overflow-hidden">
              <img src={currentImg} alt={product.name} className="h-full w-full object-contain" />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(img)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${currentImg === img ? "border-blue-500" : "border-gray-200 hover:border-gray-300"}`}>
                    <img src={img} alt="" className="w-full h-full object-contain bg-gray-50" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Save
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>

          {/* ── Product info ──────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h1 className="text-xl font-bold text-gray-900 leading-tight mb-2">{product.name}</h1>
            <div className="flex items-center gap-3 mb-3">
              <StarRating rating={product.rating} />
              <span className="text-sm text-gray-500">{product.orders} orders</span>
              {product.freeShipping && <span className="text-sm text-green-500 font-medium">Free Shipping</span>}
            </div>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
              {product.discount > 0 && (
                <span className="bg-red-100 text-red-600 text-sm font-semibold px-2 py-0.5 rounded-full">-{product.discount}%</span>
              )}
            </div>

            <hr className="my-4 border-gray-100" />

            <div className="space-y-2.5 mb-4">
              {[
                ["Status", product.inStock ? <span className="text-green-500 font-medium flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> In stock ({product.stock})</span> : <span className="text-red-500 font-medium">Out of stock</span>],
                ["Brand", <span className="text-gray-700">{product.brand}</span>],
                ["Condition", <span className="text-gray-700">{product.condition}</span>],
                ["Category", <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="text-blue-600 hover:underline">{product.category}</Link>],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500 w-20 shrink-0">{label}:</span>
                  {value}
                </div>
              ))}
            </div>

            <hr className="my-4 border-gray-100" />

            <p className="text-sm text-gray-600 leading-relaxed mb-4">{product.description}</p>

            {product.features?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {product.features.map((f) => (
                  <span key={f} className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full border border-blue-100">{f}</span>
                ))}
              </div>
            )}

            {/* Quantity + CTA */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-50 text-gray-600 text-lg font-medium transition-colors">−</button>
                <span className="px-4 py-2 text-sm font-medium border-x border-gray-300 min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2 hover:bg-gray-50 text-gray-600 text-lg font-medium transition-colors">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={cartLoading || !product.inStock}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${addedFeedback ? "bg-green-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
              >
                {addedFeedback ? (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Added!</>
                ) : cartLoading ? "Adding..." : "Add to cart"}
              </button>
              <Link to="/cart" className="bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                Buy now
              </Link>
            </div>
          </div>

          {/* ── Seller / shipping ─────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Seller info</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                  {product.brand?.[0] || "S"}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800">{product.brand} Store</p>
                  <p className="text-xs text-gray-500">Verified Supplier</p>
                </div>
              </div>
              <div className="space-y-1.5 text-sm mb-3">
                <div className="flex justify-between text-gray-600">
                  <span>Seller rating</span><span className="font-medium text-gray-800">94.5%</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Orders completed</span><span className="font-medium text-gray-800">1,240+</span>
                </div>
              </div>
              <button className="w-full border border-blue-500 text-blue-600 text-sm py-2 rounded-lg hover:bg-blue-50 transition-colors mb-2">Visit store</button>
              <button className="w-full border border-gray-200 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors">Contact supplier</button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-800">{product.freeShipping ? "Free Delivery" : "Standard Delivery"}</p>
                  <p className="text-xs text-gray-500">5–7 business days</p>
                </div>
              </div>
              <hr className="border-gray-100" />
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-800">30-Day Returns</p>
                  <p className="text-xs text-gray-500">Free return policy. <span className="text-blue-600 cursor-pointer">Details</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 mt-4">
          <div className="flex border-b border-gray-100">
            {["description", "reviews", "shipping"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="p-6 text-sm text-gray-600">
            {activeTab === "description" && (
              <div className="space-y-3">
                <p>{product.description}</p>
                <p>This product meets the highest quality standards. All items are thoroughly inspected before shipping to ensure you receive the best possible product.</p>
                {product.features?.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {product.features.map((f) => <li key={f}>{f}</li>)}
                    <li>1-year warranty included</li>
                    <li>Compatible with standard accessories</li>
                  </ul>
                )}
              </div>
            )}
            {activeTab === "reviews" && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900">{(product.rating / 2).toFixed(1)}</div>
                    <div className="text-gray-500 text-xs mt-1">out of 5</div>
                    <StarRating rating={product.rating} />
                    <div className="text-xs text-gray-400 mt-1">{product.orders} reviews</div>
                  </div>
                </div>
                <p className="text-gray-400">Be the first to write a review for this product.</p>
              </div>
            )}
            {activeTab === "shipping" && (
              <div className="space-y-4">
                {[["Standard Shipping", "5–7 business days", product.freeShipping ? "Free" : "$5.99"],
                  ["Express Shipping", "2–3 business days", "$9.99"],
                  ["Same Day Delivery", "Today (order before 12pm)", "$14.99"]].map(([title, time, cost]) => (
                  <div key={title} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800">{title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{time}</p>
                    </div>
                    <span className={`font-medium text-sm ${cost === "Free" ? "text-green-500" : "text-gray-700"}`}>{cost}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Related products ──────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Related products</h2>
              <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="text-sm text-blue-600 hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedProducts.map((p) => (
                <Link key={p._id} to={`/products/${p._id}`} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="bg-gray-50 h-36 flex items-center justify-center p-3 overflow-hidden">
                    <img src={p.image} alt={p.name} className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-600 line-clamp-2 mb-1">{p.name}</p>
                    <span className="font-bold text-sm text-gray-900">${p.price.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
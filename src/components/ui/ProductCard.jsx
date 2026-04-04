import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export const StarRating = ({ rating }) => {
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

const HeartIcon = ({ filled }) => (
  <svg className={`w-5 h-5 ${filled ? "fill-red-500 text-red-500" : "text-gray-400"}`} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

// ── Grid card ──────────────────────────────────────────────────────────────────
export function ProductCardGrid({ product }) {
  const { addToCart } = useCart();
  const id = product._id || product.id;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
      <Link to={`/products/${id}`} className="block">
        <div className="relative bg-gray-50 h-40 flex items-center justify-center p-4 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          {product.discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
              -{product.discount}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-full">
                Out of stock
              </span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-3">
        {/* Brand name tag */}
        {product.brand && product.brand !== "Generic" && (
          <span className="inline-block text-xs text-blue-600 font-medium mb-1">
            {product.brand}
          </span>
        )}
        <Link to={`/products/${id}`}>
          <p className="text-sm text-gray-700 line-clamp-2 hover:text-blue-600 transition-colors min-h-[2.5rem]">
            {product.name}
          </p>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through ml-1">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg p-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Add to cart"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── List card ──────────────────────────────────────────────────────────────────
export function ProductCardList({ product }) {
  const { addToCart } = useCart();
  const [wished, setWished] = useState(false);
  const id = product._id || product.id;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-md transition-shadow relative">
      <Link to={`/products/${id}`} className="shrink-0">
        <div className="w-32 h-32 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <div className="flex-1 min-w-0 pr-8">
        {/* Brand name — replaces the Admin badge */}
        
        <Link to={`/products/${id}`}>
          <h2 className="font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h2>
        </Link>
        {product.brand && product.brand !== "Generic" && (
          <div className="flex items-center gap-1.5 mb-1">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-xs text-gray-500 font-medium">{product.brand}</span>
          </div>
        )}


        <div className="flex items-center gap-3 mt-1">
          <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
          {product.discount > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
              -{product.discount}%
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
          <StarRating rating={product.rating} />
          <span className="text-gray-300">•</span>
          <span className="text-gray-500">{product.orders} orders</span>
          <span className="text-gray-300">•</span>
          {product.freeShipping
            ? <span className="text-green-500 font-medium">Free Shipping</span>
            : <span className="text-gray-400">Paid Shipping</span>
          }
        </div>

        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.description}</p>

        <div className="flex items-center gap-3 mt-2">
          <Link
            to={`/products/${id}`}
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            View details
          </Link>
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {product.stock === 0 ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </div>

      <button
        onClick={() => setWished(!wished)}
        className="absolute top-4 right-4 w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:border-red-300 transition-colors"
      >
        <HeartIcon filled={wished} />
      </button>
    </div>
  );
}
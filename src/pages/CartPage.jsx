import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { PageLoader } from "../components/ui/Skeletons";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, total, count, loading } = useCart();
  const { isLoggedIn } = useAuth(); // ✅ added
  const navigate = useNavigate();   // ✅ added

  const shipping = total > 500 ? 0 : 10.0;
  const tax = total * 0.08;
  const grandTotal = total + shipping + tax;

  if (loading && cartItems.length === 0) return <PageLoader />;

  if (!loading && cartItems.length === 0) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl border border-gray-200 p-16 max-w-md mx-auto">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mb-6">Looks like you haven't added anything yet.</p>
            <Link to="/products" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getProductId = (item) =>
    item.product?._id || item.product?.id || item.product || item._id;

  const getProductImage = (item) => item.product?.image || item.image || "";
  const getProductName = (item) => item.product?.name || item.name || "Product";
  const getProductPrice = (item) => item.price || item.product?.price || 0;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-4">

        <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>›</span>
          <span className="text-gray-700">My Cart</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <h1 className="font-bold text-lg text-gray-800">Shopping Cart</h1>
              <span className="text-sm text-gray-500">{count} item{count !== 1 ? "s" : ""}</span>
            </div>

            <div className="hidden md:grid grid-cols-12 gap-4 bg-white rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {cartItems.map((item) => {
              const pid = getProductId(item);
              const image = getProductImage(item);
              const name = getProductName(item);
              const price = getProductPrice(item);

              return (
                <div key={pid} className={`bg-white rounded-xl border border-gray-200 p-4 transition-opacity ${loading ? "opacity-60 pointer-events-none" : ""}`}>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                    <div className="md:col-span-6 flex items-center gap-3">
                      <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                        <img src={image} alt={name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${pid}`} className="font-medium text-gray-800 hover:text-blue-600 text-sm line-clamp-2 transition-colors">{name}</Link>
                        <button onClick={() => removeFromCart(pid)} className="text-red-400 hover:text-red-600 text-xs mt-1.5">
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2 text-center">
                      ${price.toFixed(2)}
                    </div>

                    <div className="md:col-span-2 flex justify-center">
                      <div className="flex items-center border rounded">
                        <button onClick={() => updateQuantity(pid, item.quantity - 1)} className="px-2">-</button>
                        <span className="px-3">{item.quantity}</span>
                        <button onClick={() => updateQuantity(pid, item.quantity + 1)} className="px-2">+</button>
                      </div>
                    </div>

                    <div className="md:col-span-2 text-right font-bold">
                      ${(price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 p-4">
              <Link to="/products" className="text-blue-600">Continue Shopping</Link>
              <button onClick={clearCart} className="text-red-400">Clear Cart</button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-28">
              <h3 className="font-bold mb-4">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <hr />

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* ✅ ONLY CHANGE HERE */}
              <button
                onClick={() => isLoggedIn ? navigate("/checkout") : navigate("/login")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium mt-5 transition-colors"
              >
                🔒 Proceed to Checkout
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
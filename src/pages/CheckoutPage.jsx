import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { orderAPI } from "../services/api";

// ✅ FIX 2: Removed broken getSessionId() that was reading wrong localStorage key

const STATUS_STEPS = ["confirmed", "processing", "shipped", "delivered"];

export default function CheckoutPage() {
  const navigate = useNavigate();

  // ✅ FIX 3: Get sessionId directly from CartContext — guaranteed to match the cart
  const { cartItems, total, count, clearCart, sessionId } = useCart();

  const shipping = total > 500 ? 0 : 10;
  const tax = parseFloat((total * 0.08).toFixed(2));
  const grandTotal = parseFloat((total + shipping + tax).toFixed(2));

  const [form, setForm] = useState({
    fullName: "", phone: "", address: "", city: "", postalCode: "", country: "Pakistan", notes: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[0-9+\-\s]{10,15}$/.test(form.phone)) e.phone = "Enter a valid phone number";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.postalCode.trim()) e.postalCode = "Postal code is required";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  // ── Place order ─────────────────────────────────────────────────────────────
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      // ✅ FIX 4: sessionId comes from context — always matches the actual cart
      const res = await orderAPI.place({
        sessionId,
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
        },
        notes: form.notes,
      });

      // ✅ FIX 5: Backend returns { success: true, data: order } — unwrap .data
      setPlacedOrder(res.data);
      await clearCart();
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (placedOrder) {
    return (
      <div className="bg-gray-100 min-h-screen py-10">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            {/* Success icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h2>
            <p className="text-gray-500 text-sm mb-1">Your order has been confirmed.</p>
            <p className="text-gray-400 text-xs mb-6">Order ID: <span className="font-mono text-gray-600">{placedOrder._id}</span></p>

            {/* COD notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-semibold text-amber-800 text-sm">Cash on Delivery</p>
                  <p className="text-amber-700 text-xs mt-0.5">
                    Please have <strong>${placedOrder.totalAmount?.toFixed(2)}</strong> ready when your order arrives.
                    Our delivery partner will collect payment at your door.
                  </p>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left text-sm">
              <h3 className="font-semibold text-gray-800 mb-3">Delivery Details</h3>
              <div className="space-y-1.5 text-gray-600">
                <p><span className="text-gray-400 w-24 inline-block">Name:</span> {placedOrder.shippingAddress?.fullName}</p>
                <p><span className="text-gray-400 w-24 inline-block">Phone:</span> {placedOrder.shippingAddress?.phone}</p>
                <p><span className="text-gray-400 w-24 inline-block">Address:</span> {placedOrder.shippingAddress?.address}</p>
                <p><span className="text-gray-400 w-24 inline-block">City:</span> {placedOrder.shippingAddress?.city}, {placedOrder.shippingAddress?.postalCode}</p>
              </div>
            </div>

            {/* Status tracker */}
            <div className="mb-6">
              <p className="text-xs text-gray-400 mb-3 text-left font-medium uppercase tracking-wide">Order Status</p>
              <div className="flex items-center gap-1">
                {STATUS_STEPS.map((step, i) => {
                  const isActive = step === placedOrder.status;
                  const isDone = STATUS_STEPS.indexOf(placedOrder.status) > i;
                  return (
                    <div key={step} className="flex-1 flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isDone ? "bg-green-500 text-white" : isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                        {isDone ? "✓" : i + 1}
                      </div>
                      <span className={`text-xs capitalize ${isActive ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price summary */}
            <div className="border border-gray-100 rounded-xl p-4 mb-6 text-sm text-left space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Items ({placedOrder.items?.length})</span>
                <span>${placedOrder.itemsTotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={placedOrder.shippingCost === 0 ? "text-green-600" : ""}>
                  {placedOrder.shippingCost === 0 ? "FREE" : `$${placedOrder.shippingCost?.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${placedOrder.taxAmount?.toFixed(2)}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between font-bold text-gray-900">
                <span>Total to Pay</span>
                <span>${placedOrder.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link to="/" className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Continue Shopping
              </Link>
              <Link to="/orders" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                View My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty cart guard ────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl border border-gray-200 p-12 max-w-sm mx-4">
          <p className="text-gray-400 text-lg mb-4">Your cart is empty</p>
          <Link to="/products" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // ── Checkout form ───────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-100 min-h-screen py-6">
      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-5 flex items-center gap-1">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>›</span>
          <Link to="/cart" className="hover:text-blue-600">Cart</Link>
          <span>›</span>
          <span className="text-gray-700">Checkout</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* ── Left: Shipping form ───────────────────────────────────── */}
            <div className="lg:col-span-3 space-y-4">

              {/* Delivery address */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  Delivery Address
                </h2>

                {errors.api && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.api}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name *" error={errors.fullName}>
                    <input name="fullName" value={form.fullName} onChange={handleChange}
                      placeholder="e.g. Ahmed Khan" className={inp(errors.fullName)} />
                  </Field>
                  <Field label="Phone Number *" error={errors.phone}>
                    <input name="phone" value={form.phone} onChange={handleChange}
                      placeholder="e.g. 0300-1234567" className={inp(errors.phone)} />
                  </Field>
                  <Field label="Street Address *" error={errors.address} className="sm:col-span-2">
                    <input name="address" value={form.address} onChange={handleChange}
                      placeholder="House #, Street, Area" className={inp(errors.address)} />
                  </Field>
                  <Field label="City *" error={errors.city}>
                    <input name="city" value={form.city} onChange={handleChange}
                      placeholder="e.g. Lahore" className={inp(errors.city)} />
                  </Field>
                  <Field label="Postal Code *" error={errors.postalCode}>
                    <input name="postalCode" value={form.postalCode} onChange={handleChange}
                      placeholder="e.g. 54000" className={inp(errors.postalCode)} />
                  </Field>
                  <Field label="Country" className="sm:col-span-2">
                    <select name="country" value={form.country} onChange={handleChange} className={inp()}>
                      <option>Pakistan</option>
                      <option>Afghanistan</option>
                      <option>India</option>
                      <option>Bangladesh</option>
                      <option>UAE</option>
                      <option>Saudi Arabia</option>
                      <option>Other</option>
                    </select>
                  </Field>
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  Payment Method
                </h2>
                <label className="flex items-center gap-4 p-4 border-2 border-blue-500 bg-blue-50 rounded-xl cursor-pointer">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">💵</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Cash on Delivery (COD)</p>
                      <p className="text-xs text-gray-500">Pay with cash when your order arrives at your door</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium shrink-0">
                    Available
                  </span>
                </label>

                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
                  <span className="text-base shrink-0 mt-0.5">ℹ️</span>
                  <span>Please have the exact amount ready. Our delivery partner may not carry change.</span>
                </div>
              </div>

              {/* Order notes */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  Order Notes <span className="text-sm font-normal text-gray-400">(Optional)</span>
                </h2>
                <textarea name="notes" value={form.notes} onChange={handleChange}
                  rows={3} placeholder="Any special instructions for delivery..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 resize-none" />
              </div>
            </div>

            {/* ── Right: Order summary ──────────────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-28">
                <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 mb-4 max-h-52 overflow-y-auto pr-1">
                  {cartItems.map((item) => {
                    const pid = item.product?._id || item.product;
                    const name = item.product?.name || "Product";
                    const image = item.product?.image || "";
                    const price = item.price || 0;
                    return (
                      <div key={pid} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                          <img src={image} alt={name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate font-medium">{name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 shrink-0">
                          ${(price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <hr className="border-gray-100 mb-4" />

                {/* Totals */}
                <div className="space-y-2 text-sm mb-5">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({count} items)</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    {shipping === 0
                      ? <span className="text-green-600 font-medium">FREE 🎉</span>
                      : <span>${shipping.toFixed(2)}</span>}
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-gray-400">Free shipping on orders over $500</p>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
                    <span>Total (COD)</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order CTA */}
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Placing Order...</>
                  ) : (
                    <><span>📦</span> Place Order — ${grandTotal.toFixed(2)}</>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-3">
                  💵 Pay <strong>${grandTotal.toFixed(2)}</strong> cash upon delivery
                </p>

                <Link to="/cart" className="block text-center text-xs text-blue-600 hover:underline mt-3">
                  ← Back to Cart
                </Link>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Field({ label, error, children, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function inp(error) {
  return `w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-colors ${
    error ? "border-red-400 bg-red-50 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
  }`;
}
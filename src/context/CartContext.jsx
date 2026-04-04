import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartAPI } from "../services/api";

const CartContext = createContext();

function getSessionId(userId = null) {
  const key = userId ? `cart_session_${userId}` : "cart_session_guest";
  let sid = localStorage.getItem(key);
  if (!sid) {
    sid = "sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, sid);
  }
  return sid;
}

export function CartProvider({ children, userId = null }) {
  const sessionId = getSessionId(userId);
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const res = await cartAPI.get(sessionId);
      setCart(res.data);
    } catch (err) {
      console.error("Failed to load cart:", err.message);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    setLoading(true);
    try {
      const res = await cartAPI.addItem(sessionId, product._id, quantity);
      setCart(res.data);
    } catch (err) {
      console.error("Add to cart failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    setLoading(true);
    try {
      const res = await cartAPI.updateItem(sessionId, productId, quantity);
      setCart(res.data);
    } catch (err) {
      console.error("Update cart failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const res = await cartAPI.removeItem(sessionId, productId);
      setCart(res.data);
    } catch (err) {
      console.error("Remove from cart failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const res = await cartAPI.clear(sessionId);
      setCart(res.data);
    } catch (err) {
      console.error("Clear cart failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const total = cart.total ?? cart.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;
  const count = cart.count ?? cart.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{
      cart, cartItems: cart.items || [],
      total, count, loading,
      sessionId,              // ✅ FIX 1: export sessionId so CheckoutPage can use it
      addToCart, updateQuantity, removeFromCart, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
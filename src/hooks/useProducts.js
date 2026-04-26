import { useState, useEffect, useCallback } from "react";
import { productAPI } from "../services/api";

// ─── USE PRODUCTS ─────────────────────────────────────────────────────────────
// Fetch products with optional filters
export function useProducts(params = {}) {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stringify params for dependency comparison
  const paramsKey = JSON.stringify(params);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productAPI.getAll(params);
      setProducts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, pagination, loading, error, refetch: fetchProducts };
}

// ─── USE FEATURED PRODUCTS ───────────────────────────────────────────────────
export function useFeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await productAPI.getFeatured();
        setProducts(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { products, loading, error };
}

// ─── USE SINGLE PRODUCT ──────────────────────────────────────────────────────
export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await productAPI.getById(id);
        setProduct(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  return { product, loading, error };
}

// ─── USE CATEGORIES ──────────────────────────────────────────────────────────
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await productAPI.getCategories();
        setCategories(res.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { categories, loading };
}
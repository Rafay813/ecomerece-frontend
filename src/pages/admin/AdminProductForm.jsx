import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { productAPI, uploadAPI } from "../../services/api";

const CATEGORIES = ["Electronics","Clothing","Home & Outdoor","Smartphones","Laptops","Cameras","Audio","Watches","Tools","Sports","Other"];
const CONDITIONS = ["Brand new", "Refurbished", "Old items"];

const empty = {
  name: "", price: "", originalPrice: "", image: "", description: "",
  category: "Electronics", brand: "", stock: "", discount: "0",
  condition: "Brand new", features: "", freeShipping: false, isFeatured: false, isActive: true,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await productAPI.getById(id);
        const p = res.data;
        setForm({
          name: p.name || "",
          price: p.price?.toString() || "",
          originalPrice: p.originalPrice?.toString() || "",
          image: p.image || "",
          description: p.description || "",
          category: p.category || "Electronics",
          brand: p.brand || "",
          stock: p.stock?.toString() || "",
          discount: p.discount?.toString() || "0",
          condition: p.condition || "Brand new",
          features: (p.features || []).join(", "),
          freeShipping: p.freeShipping || false,
          isFeatured: p.isFeatured || false,
          isActive: p.isActive !== false,
        });
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, isEdit]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = "Valid price required";
    if (!form.image.trim()) e.image = "Image is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.stock || isNaN(form.stock) || Number(form.stock) < 0) e.stock = "Valid stock required";
    if (form.discount && (isNaN(form.discount) || Number(form.discount) < 0 || Number(form.discount) > 100))
      e.discount = "Discount must be 0–100";
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.uploadImage(file);
      setForm((prev) => ({ ...prev, image: res.url }));
      if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stock: Number(form.stock),
        discount: Number(form.discount) || 0,
        features: form.features
          ? form.features.split(",").map((f) => f.trim()).filter(Boolean)
          : [],
      };
      if (isEdit) {
        await productAPI.update(id, payload);
        showToast("Product updated successfully!");
      } else {
        await productAPI.create(payload);
        showToast("Product created successfully!");
        setTimeout(() => navigate("/admin/products"), 1200);
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="p-6 animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 rounded w-48" />
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-gray-200 rounded-lg" />)}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-3xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg ${
          toast.type === "error" ? "bg-red-500" : "bg-green-500"
        }`}>
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/products" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? "Edit Product" : "Add New Product"}</h1>
          <p className="text-gray-500 text-sm">{isEdit ? `Editing product ID: ${id}` : "Fill in the details below"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Basic Information</h2>
          <div className="space-y-4">
            <Field label="Product Name *" error={errors.name}>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="e.g. Sony WH-1000XM4 Headphones" className={input(errors.name)} />
            </Field>

            <Field label="Description *" error={errors.description}>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                placeholder="Detailed product description..."
                className={`${input(errors.description)} resize-none`} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Category *">
                <select name="category" value={form.category} onChange={handleChange} className={input()}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Brand">
                <input name="brand" value={form.brand} onChange={handleChange}
                  placeholder="e.g. Sony, Apple" className={input()} />
              </Field>
            </div>

            <Field label="Condition">
              <select name="condition" value={form.condition} onChange={handleChange} className={input()}>
                {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Pricing & Stock</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (USD) *" error={errors.price}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input name="price" value={form.price} onChange={handleChange} type="number" step="0.01" min="0"
                  placeholder="0.00" className={`${input(errors.price)} pl-7`} />
              </div>
            </Field>

            <Field label="Original Price (USD)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input name="originalPrice" value={form.originalPrice} onChange={handleChange}
                  type="number" step="0.01" min="0"
                  placeholder="0.00 (optional)" className={`${input()} pl-7`} />
              </div>
            </Field>

            <Field label="Stock Quantity *" error={errors.stock}>
              <input name="stock" value={form.stock} onChange={handleChange} type="number" min="0"
                placeholder="0" className={input(errors.stock)} />
            </Field>

            <Field label="Discount (%)" error={errors.discount}>
              <div className="relative">
                <input name="discount" value={form.discount} onChange={handleChange}
                  type="number" min="0" max="100"
                  placeholder="0" className={`${input(errors.discount)} pr-7`} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
              </div>
            </Field>
          </div>
        </div>

        {/* Media */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Media</h2>
          <Field label="Main Image *" error={errors.image}>
            <div className="space-y-3">
              {/* Upload from PC */}
              <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-lg px-3 py-4 cursor-pointer transition-colors ${
                uploading
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              }`}>
                <input type="file" accept="image/*" onChange={handleImageUpload}
                  className="hidden" disabled={uploading} />
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-blue-600">Uploading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-500">Click to upload image from PC</span>
                    <span className="text-xs text-gray-400">(JPG, PNG, WebP · max 5MB)</span>
                  </>
                )}
              </label>

              {/* OR divider */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or paste URL</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* URL input */}
              <input name="image" value={form.image} onChange={handleChange}
                placeholder="https://images.unsplash.com/..." className={input(errors.image)} />
            </div>
          </Field>

          {/* Preview */}
          {form.image && (
            <div className="mt-3 flex items-center gap-3">
              <img src={form.image} alt="preview"
                className="w-20 h-20 object-contain bg-gray-50 rounded-lg border border-gray-200"
                onError={(e) => { e.target.style.display = "none"; }} />
              <p className="text-xs text-gray-500">Image preview</p>
            </div>
          )}
        </div>

        {/* Extra Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Extra Details</h2>
          <Field label="Features (comma-separated)">
            <input name="features" value={form.features} onChange={handleChange}
              placeholder="e.g. Noise Canceling, 30hr Battery, Metallic" className={input()} />
          </Field>
          <div className="flex flex-wrap gap-6 mt-4">
            {[
              { name: "freeShipping", label: "Free Shipping" },
              { name: "isFeatured", label: "Featured Product" },
              { name: "isActive", label: "Active (visible in store)" },
            ].map((cb) => (
              <label key={cb.name} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name={cb.name} checked={form[cb.name]} onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
                <span className="text-sm text-gray-700">{cb.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading || uploading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isEdit ? "Saving..." : "Creating..."}
              </>
            ) : isEdit ? "Save Changes" : "Create Product"}
          </button>
          <Link to="/admin/products"
            className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 border border-gray-200 rounded-xl transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function input(error) {
  return `w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${
    error ? "border-red-400 bg-red-50 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
  }`;
}
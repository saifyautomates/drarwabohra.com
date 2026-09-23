"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Product, ProductCategory } from "@/lib/data";
import { ErrorNote, Field, SavedNote, api } from "@/components/admin/ui";

const CATEGORIES: ProductCategory[] = [
  "Hair Care",
  "Skin Care",
  "Homeopathy",
  "Wellness",
];

interface DraftState {
  title: string;
  slug: string;
  tagline: string;
  description: string;
  benefits: string;
  howToUse: string;
  ingredients: string;
  price: string;
  originalPrice: string;
  size: string;
  category: ProductCategory;
  image: string;
  inStock: boolean;
  featured: boolean;
  order: number;
}

const EMPTY: DraftState = {
  title: "",
  slug: "",
  tagline: "",
  description: "",
  benefits: "",
  howToUse: "",
  ingredients: "",
  price: "",
  originalPrice: "",
  size: "50 ml",
  category: "Hair Care",
  image: "",
  inStock: true,
  featured: true,
  order: 0,
};

export default function ProductsClient({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [list, setList] = useState<Product[]>(initialProducts);
  const [editing, setEditing] = useState<Product | null>(null);
  const [draft, setDraft] = useState<DraftState>(EMPTY);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const sorted = [...list].sort((a, b) => a.order - b.order);
  const filtered =
    filterCategory === "All"
      ? sorted
      : sorted.filter((p) => p.category === filterCategory);

  function startAdd() {
    setEditing(null);
    setDraft({ ...EMPTY, order: list.length + 1 });
    setShowModal(true);
    setError(null);
    setSaved(false);
  }

  function startEdit(p: Product) {
    setEditing(p);
    setDraft({
      title: p.title,
      slug: p.slug,
      tagline: p.tagline,
      description: p.description,
      benefits: (p.benefits || []).join("\n"),
      howToUse: p.howToUse || "",
      ingredients: p.ingredients || "",
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      size: p.size || "",
      category: p.category,
      image: p.image,
      inStock: p.inStock,
      featured: p.featured,
      order: p.order,
    });
    setShowModal(true);
    setError(null);
    setSaved(false);
  }

  // Handle direct file selection from phone album / gallery / camera
  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file (JPEG, PNG, WebP).");
      return;
    }

    setCompressing(true);
    setError(null);

    try {
      // Client-side resizing and optimization via HTML5 Canvas
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_DIM = 960;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            setError("Failed to process image.");
            setCompressing(false);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);

          setDraft((prev) => ({
            ...prev,
            image: compressedDataUrl,
          }));
          setCompressing(false);
        };
        img.onerror = () => {
          setError("Failed to load chosen image.");
          setCompressing(false);
        };
        img.src = readerEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Failed to read image file from your album.");
      setCompressing(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const priceNum = parseFloat(draft.price);
    if (!draft.title.trim()) {
      setError("Please provide a product title.");
      setSaving(false);
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Please provide a valid selling price greater than ₹0.");
      setSaving(false);
      return;
    }

    const benefitsArray = draft.benefits
      .split("\n")
      .map((s) => s.trim().replace(/^[-*•]\s*/, ""))
      .filter(Boolean);

    const payload = {
      title: draft.title.trim(),
      slug:
        draft.slug.trim() ||
        draft.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      tagline: draft.tagline.trim(),
      description: draft.description.trim(),
      benefits: benefitsArray,
      howToUse: draft.howToUse.trim(),
      ingredients: draft.ingredients.trim(),
      price: priceNum,
      originalPrice: draft.originalPrice ? parseFloat(draft.originalPrice) : undefined,
      size: draft.size.trim() || "Standard",
      category: draft.category,
      image: draft.image.trim() || "/images/dr-arwa-bohra.png",
      inStock: draft.inStock,
      featured: draft.featured,
      order: Number(draft.order) || 0,
    };

    const url = editing
      ? `/api/admin/products/${editing.id}`
      : "/api/admin/products";
    const method = editing ? "PUT" : "POST";

    const res = await api<{ product: Product }>(url, method, payload);
    setSaving(false);

    if (!res.ok || !res.data?.product) {
      setError(res.error ?? "Failed to save product.");
      return;
    }

    const savedProduct = res.data.product;
    setList((prev) =>
      (editing
        ? prev.map((x) => (x.id === savedProduct.id ? savedProduct : x))
        : [...prev, savedProduct]
      ).sort((a, b) => a.order - b.order)
    );

    setShowModal(false);
    setEditing(null);
    setSaved(true);
    router.refresh();
  }

  async function onDelete(p: Product) {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    setError(null);
    const res = await api(`/api/admin/products/${p.id}`, "DELETE");
    if (!res.ok) {
      setError(res.error ?? "Delete failed.");
      return;
    }
    setList((prev) => prev.filter((x) => x.id !== p.id));
    router.refresh();
  }

  async function toggleInStock(p: Product) {
    const nextState = !p.inStock;
    setList((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, inStock: nextState } : x))
    );
    const res = await api<{ product: Product }>(`/api/admin/products/${p.id}`, "PUT", {
      ...p,
      inStock: nextState,
    });
    if (!res.ok) {
      // Revert on error
      setList((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, inStock: !nextState } : x))
      );
      setError("Failed to update in-stock status.");
    } else {
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {/* Top action row & metrics */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilterCategory(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filterCategory === c
                  ? "bg-emerald text-white shadow-xs"
                  : "bg-white text-smoke border border-line hover:border-emerald/40 hover:text-ink"
              }`}
            >
              {c} {c === "All" ? `(${list.length})` : `(${list.filter((x) => x.category === c).length})`}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={startAdd}
          className="btn-primary flex items-center justify-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <span className="text-lg leading-none">+</span> Add Product
        </button>
      </div>

      <SavedNote saved={saved} />
      <ErrorNote error={error} />

      {/* Product list cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white/70 p-12 text-center">
          <p className="font-display text-lg text-ink">No products found</p>
          <p className="mt-1 text-xs text-smoke">
            {filterCategory === "All"
              ? "Click '+ Add Product' above to list your first clinic product."
              : `No products in "${filterCategory}".`}
          </p>
          <button
            type="button"
            onClick={startAdd}
            className="btn-outline mt-4 text-xs"
          >
            + Add Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const discountPct = p.originalPrice && p.originalPrice > p.price
              ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
              : null;

            return (
              <div
                key={p.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-white shadow-xs transition-all hover:border-emerald/40 hover:shadow-card"
              >
                {/* Image & Badges */}
                <div className="relative aspect-square w-full overflow-hidden bg-paper">
                  {p.image ? (
                    p.image.startsWith("data:") || p.image.startsWith("/") ? (
                      <img
                        src={p.image}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-smoke text-xs">
                      No Image
                    </div>
                  )}

                  <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
                    <span className="rounded-full bg-paper/95 px-2.5 py-0.5 text-[11px] font-bold text-emerald-dark backdrop-blur border border-line shadow-xs">
                      {p.category}
                    </span>
                    {discountPct && (
                      <span className="rounded-full bg-gold/90 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-xs">
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>

                  <div className="absolute right-2.5 top-2.5">
                    <button
                      type="button"
                      onClick={() => void toggleInStock(p)}
                      title={p.inStock ? "Mark Out of Stock" : "Mark In Stock"}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border transition-colors shadow-xs ${
                        p.inStock
                          ? "bg-emerald-soft text-emerald-dark border-emerald/30 hover:bg-emerald/20"
                          : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                      }`}
                    >
                      {p.inStock ? "● In Stock" : "○ Sold Out"}
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-smoke">
                      <span>{p.size}</span>
                      <span className="font-mono text-[11px] text-smoke/70">
                        {p.id}
                      </span>
                    </div>

                    <h3 className="mt-1 font-display text-base font-bold text-ink leading-snug">
                      {p.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-smoke">
                      {p.tagline || p.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display text-lg font-bold text-ink">
                          ₹{p.price}
                        </span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="text-xs text-smoke line-through">
                            ₹{p.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="rounded-lg border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-ink hover:border-emerald hover:text-emerald-dark transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(p)}
                        className="rounded-lg border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal Drawer */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-line bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-ink">
                  {editing ? "Edit Product" : "Add New Clinic Product"}
                </h2>
                <p className="text-xs text-smoke">
                  Fill in clinical details and select a photo from your phone album.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-smoke hover:bg-paper hover:text-ink transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              {/* Photo Upload Section */}
              <div className="rounded-2xl border border-line bg-paper/60 p-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
                  Product Photo (From Phone Album or Camera)
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Thumbnail Preview */}
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-line bg-white shadow-xs flex items-center justify-center">
                    {draft.image ? (
                      <img
                        src={draft.image}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-center text-[11px] text-smoke px-2">
                        No photo selected
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelected}
                      className="hidden"
                      id="album-file-input"
                    />

                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={compressing}
                        className="btn-primary text-xs flex items-center gap-2"
                      >
                        <span>📷</span>
                        {compressing
                          ? "Processing photo…"
                          : draft.image
                          ? "Choose Different Photo from Album"
                          : "Upload from Phone Album / Gallery"}
                      </button>

                      {draft.image && (
                        <button
                          type="button"
                          onClick={() => setDraft((p) => ({ ...p, image: "" }))}
                          className="btn-outline text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-smoke">
                      Supports phone gallery, camera, iPhone photos and Android storage. High-resolution images are automatically optimized.
                    </p>

                    <div className="pt-1">
                      <input
                        type="text"
                        placeholder="Or enter image URL (e.g. /images/products/hair-serum.jpg)"
                        value={draft.image}
                        onChange={(e) =>
                          setDraft((p) => ({ ...p, image: e.target.value }))
                        }
                        className="input-text text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Product Name / Title *">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Arwa Botanical Hair Regrowth Serum"
                    value={draft.title}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        title: e.target.value,
                        slug:
                          editing || p.slug
                            ? p.slug
                            : e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/(^-|-$)/g, ""),
                      }))
                    }
                    className="input-text"
                  />
                </Field>

                <Field label="Category *">
                  <select
                    value={draft.category}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        category: e.target.value as ProductCategory,
                      }))
                    }
                    className="input-text"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Selling Price (₹) *">
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="499"
                    value={draft.price}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, price: e.target.value }))
                    }
                    className="input-text"
                  />
                </Field>

                <Field label="Original MRP (₹) (Optional)">
                  <input
                    type="number"
                    min="0"
                    placeholder="699"
                    value={draft.originalPrice}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, originalPrice: e.target.value }))
                    }
                    className="input-text"
                  />
                </Field>

                <Field label="Size / Volume">
                  <input
                    type="text"
                    placeholder="e.g. 50 ml, 30 ml, 100g"
                    value={draft.size}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, size: e.target.value }))
                    }
                    className="input-text"
                  />
                </Field>
              </div>

              <Field label="Tagline (One-line summary for cards)">
                <input
                  type="text"
                  placeholder="e.g. Natural follicle energizer for acute hairfall & thinning"
                  value={draft.tagline}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, tagline: e.target.value }))
                  }
                  className="input-text"
                />
              </Field>

              <Field label="Full Description *">
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed description of what the product does and why Dr. Arwa recommends it."
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, description: e.target.value }))
                  }
                  className="input-text"
                />
              </Field>

              <Field label="Key Benefits (One benefit per line)">
                <textarea
                  rows={3}
                  placeholder="Stops excess hair fall within 4 weeks&#10;Stimulates dormant follicles&#10;100% steroid-free"
                  value={draft.benefits}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, benefits: e.target.value }))
                  }
                  className="input-text font-mono text-xs"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="How to Use (Instructions)">
                  <textarea
                    rows={2}
                    placeholder="Apply 1-2 ml directly on clean scalp, massage gently..."
                    value={draft.howToUse}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, howToUse: e.target.value }))
                    }
                    className="input-text text-xs"
                  />
                </Field>

                <Field label="Ingredients">
                  <textarea
                    rows={2}
                    placeholder="Arnica Montana, Jaborandi, Rosemary Extract, Vitamin E..."
                    value={draft.ingredients}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, ingredients: e.target.value }))
                    }
                    className="input-text text-xs"
                  />
                </Field>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 rounded-xl border border-line bg-paper/40 p-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={draft.inStock}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, inStock: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-line text-emerald focus:ring-emerald"
                  />
                  <span>In Stock (Available for orders)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={draft.featured}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, featured: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-line text-emerald focus:ring-emerald"
                  />
                  <span>Featured on Homepage</span>
                </label>

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-smoke">Display Order:</span>
                  <input
                    type="number"
                    min="0"
                    value={draft.order}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, order: Number(e.target.value) || 0 }))
                    }
                    className="input-text w-16 py-1 text-center text-xs"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || compressing}
                  className="btn-primary text-xs px-6 disabled:opacity-60"
                >
                  {saving ? "Saving…" : editing ? "Update Product" : "Publish Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

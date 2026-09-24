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
  gallery: string[];
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
  gallery: [],
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
  const [targetSlot, setTargetSlot] = useState<number | null>(null);
  const [urlInput, setUrlInput] = useState<string>("");

  const sorted = [...list].sort((a, b) => a.order - b.order);
  const filtered =
    filterCategory === "All"
      ? sorted
      : sorted.filter((p) => p.category === filterCategory);

  function startAdd() {
    setEditing(null);
    setDraft({ ...EMPTY, gallery: [], order: list.length + 1 });
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
      image: p.image || "",
      gallery: p.gallery || [],
      inStock: p.inStock,
      featured: p.featured,
      order: p.order,
    });
    setShowModal(true);
    setError(null);
    setSaved(false);
  }

  // Handle direct file selection from phone album / gallery / camera with instant canvas compression
  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setTargetSlot(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file (JPEG, PNG, WebP).");
      setTargetSlot(null);
      return;
    }

    setCompressing(true);
    setError(null);

    try {
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
            setTargetSlot(null);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);

          setDraft((prev) => {
            const currentGallery = [...(prev.gallery || [])];
            let newImage = prev.image;
            let newGallery = [...currentGallery];

            if (targetSlot === 0) {
              newImage = compressedDataUrl;
            } else if (targetSlot !== null && targetSlot >= 1 && targetSlot <= 4) {
              const gIdx = targetSlot - 1;
              if (gIdx < newGallery.length) {
                newGallery[gIdx] = compressedDataUrl;
              } else {
                newGallery.push(compressedDataUrl);
              }
            } else {
              // Auto-fill next available slot
              if (!newImage) {
                newImage = compressedDataUrl;
              } else if (newGallery.length < 4) {
                newGallery.push(compressedDataUrl);
              } else {
                newImage = compressedDataUrl;
              }
            }

            return {
              ...prev,
              image: newImage,
              gallery: newGallery.slice(0, 4),
            };
          });

          setCompressing(false);
          setTargetSlot(null);
        };
        img.onerror = () => {
          setError("Failed to load chosen image.");
          setCompressing(false);
          setTargetSlot(null);
        };
        img.src = readerEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Failed to read image file from your album.");
      setCompressing(false);
      setTargetSlot(null);
    }
  }

  function triggerSlotUpload(slot: number) {
    setTargetSlot(slot);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }

  function handleMakeCover(slot: number) {
    if (slot <= 0) return;
    setDraft((prev) => {
      const gIdx = slot - 1;
      const chosen = prev.gallery?.[gIdx];
      if (!chosen) return prev;
      const oldCover = prev.image;
      const remaining = (prev.gallery || []).filter((_, i) => i !== gIdx);
      return {
        ...prev,
        image: chosen,
        gallery: oldCover ? [oldCover, ...remaining].slice(0, 4) : remaining.slice(0, 4),
      };
    });
  }

  function handleRemovePhoto(slot: number) {
    setDraft((prev) => {
      if (slot === 0) {
        if (prev.gallery && prev.gallery.length > 0) {
          return {
            ...prev,
            image: prev.gallery[0],
            gallery: prev.gallery.slice(1),
          };
        }
        return { ...prev, image: "" };
      } else {
        const gIdx = slot - 1;
        return {
          ...prev,
          gallery: (prev.gallery || []).filter((_, i) => i !== gIdx),
        };
      }
    });
  }

  function handleAddUrlPhoto() {
    const url = urlInput.trim();
    if (!url) return;
    setDraft((prev) => {
      if (!prev.image) {
        return { ...prev, image: url };
      }
      if ((prev.gallery || []).length < 4) {
        return { ...prev, gallery: [...(prev.gallery || []), url] };
      }
      return prev;
    });
    setUrlInput("");
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
      gallery: (draft.gallery || [])
        .map((g) => g.trim())
        .filter((g) => g && g !== draft.image)
        .slice(0, 4),
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
              {/* Photo Upload Section - Up to 5 Photos */}
              <div className="rounded-2xl border border-line bg-paper/60 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                      Product Photos (Up to 5 Photos per Product)
                    </label>
                    <p className="text-[11px] text-smoke mt-0.5">
                      First photo is the main cover. You can add up to 4 extra photos for full-screen zoom and gallery views.
                    </p>
                  </div>
                  <span className="self-start sm:self-auto rounded-full bg-emerald-soft px-2.5 py-0.5 text-xs font-bold text-emerald-dark">
                    {[draft.image, ...(draft.gallery || [])].filter(Boolean).length} / 5 Added
                  </span>
                </div>

                {/* 5-Slot Photo Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[0, 1, 2, 3, 4].map((slotIdx) => {
                    const photoSrc =
                      slotIdx === 0
                        ? draft.image
                        : draft.gallery?.[slotIdx - 1] || "";
                    const isCover = slotIdx === 0;

                    return (
                      <div
                        key={slotIdx}
                        className={`group relative aspect-square rounded-2xl border-2 overflow-hidden transition-all flex flex-col items-center justify-center ${
                          photoSrc
                            ? isCover
                              ? "border-emerald ring-2 ring-emerald/20 bg-white"
                              : "border-line bg-white shadow-xs"
                            : "border-dashed border-smoke/30 bg-cream/30 hover:border-emerald hover:bg-emerald-soft/20 cursor-pointer"
                        }`}
                        onClick={() => {
                          if (!photoSrc) triggerSlotUpload(slotIdx);
                        }}
                      >
                        {photoSrc ? (
                          <>
                            <img
                              src={photoSrc}
                              alt={`Photo ${slotIdx + 1}`}
                              className="h-full w-full object-cover"
                            />

                            {/* Badge */}
                            <div className="absolute top-1.5 left-1.5 z-10 pointer-events-none">
                              {isCover ? (
                                <span className="rounded-md bg-emerald text-white px-1.5 py-0.5 text-[9px] font-extrabold uppercase shadow-xs">
                                  Cover
                                </span>
                              ) : (
                                <span className="rounded-md bg-ink/70 text-white px-1.5 py-0.5 text-[9px] font-semibold backdrop-blur">
                                  #{slotIdx + 1}
                                </span>
                              )}
                            </div>

                            {/* Hover Actions Overlay */}
                            <div className="absolute inset-0 bg-ink/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 z-20">
                              {!isCover && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMakeCover(slotIdx);
                                  }}
                                  className="w-full rounded-lg bg-emerald px-2 py-1 text-[10px] font-bold text-white shadow-xs hover:bg-emerald-dark transition-colors"
                                  title="Set as Main Cover Photo"
                                >
                                  Make Cover
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerSlotUpload(slotIdx);
                                }}
                                className="w-full rounded-lg bg-white/90 px-2 py-1 text-[10px] font-semibold text-ink hover:bg-white transition-colors"
                              >
                                Replace
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemovePhoto(slotIdx);
                                }}
                                className="w-full rounded-lg bg-red-600/90 px-2 py-1 text-[10px] font-semibold text-white hover:bg-red-700 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="p-2 text-center">
                            <span className="text-xl">📷</span>
                            <span className="block mt-1 text-[11px] font-semibold text-smoke">
                              {isCover ? "+ Cover" : `+ Photo ${slotIdx + 1}`}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Hidden File Input for instant camera / album pick */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelected}
                  className="hidden"
                  id="album-file-input"
                />

                {/* Bottom Quick Controls & URL Input */}
                <div className="mt-4 pt-3 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const currentCount = [draft.image, ...(draft.gallery || [])].filter(Boolean).length;
                      if (currentCount >= 5) {
                        setError("Maximum 5 photos allowed per product. Remove a photo to upload another.");
                        return;
                      }
                      triggerSlotUpload(currentCount);
                    }}
                    disabled={compressing || [draft.image, ...(draft.gallery || [])].filter(Boolean).length >= 5}
                    className="btn-primary w-full sm:w-auto text-xs flex items-center justify-center gap-2"
                  >
                    <span>📷</span>
                    <span>
                      {compressing
                        ? "Optimizing photo in browser…"
                        : [draft.image, ...(draft.gallery || [])].filter(Boolean).length >= 5
                        ? "Max 5 Photos Reached"
                        : "+ Add Photo from Phone / Album"}
                    </span>
                  </button>

                  <div className="flex w-full sm:w-auto items-center gap-2 flex-1 sm:max-w-md">
                    <input
                      type="text"
                      placeholder="Or enter image URL (/images/products/...)"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddUrlPhoto();
                        }
                      }}
                      className="input-text text-xs flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrlPhoto}
                      disabled={!urlInput.trim() || [draft.image, ...(draft.gallery || [])].filter(Boolean).length >= 5}
                      className="btn-outline !py-2 !px-3 text-xs shrink-0 font-semibold"
                    >
                      + Add URL
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-smoke mt-2">
                  ⚡ Images are optimized on-device using client-side canvas for ultra-fast loading without slowing down the site.
                </p>
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

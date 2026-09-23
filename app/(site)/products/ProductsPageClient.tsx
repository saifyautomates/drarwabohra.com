"use client";

import { useState, useMemo } from "react";
import type { Product, ProductCategory } from "@/lib/data";
import ProductCard from "@/components/site/ProductCard";

const CATEGORIES: ("All" | ProductCategory)[] = [
  "All",
  "Hair Care",
  "Skin Care",
  "Homeopathy",
  "Wellness",
];

interface ProductsPageClientProps {
  products: Product[];
  whatsapp: string;
  upiNumber?: string;
  shippingCharge?: number;
}

export default function ProductsPageClient({
  products,
  whatsapp,
  upiNumber = "7049205128",
  shippingCharge = 80,
}: ProductsPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="space-y-10">
      {/* Search & Category Filter Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-emerald text-white shadow-xs"
                  : "bg-paper text-smoke border border-line hover:border-emerald/40 hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search by concern, e.g. hairfall, acne…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-text text-xs pr-8"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-smoke hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-smoke">
        <p>
          Showing <strong>{filteredProducts.length}</strong> of{" "}
          <strong>{products.length}</strong> formulations
        </p>
        {selectedCategory !== "All" && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="text-emerald-dark font-semibold hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-white p-12 text-center">
          <p className="font-display text-lg text-ink">No formulations match your search</p>
          <p className="mt-1 text-xs text-smoke">
            Try adjusting your search keywords or browsing all categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="btn-outline mt-4 text-xs"
          >
            View All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              whatsapp={whatsapp}
              upiNumber={upiNumber}
            />
          ))}
        </div>
      )}

      {/* Delivery & Ordering Information Guide */}
      <div className="rounded-3xl border border-emerald-dark/15 bg-emerald-soft/25 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🌿</span>
          <h3 className="font-display text-lg font-bold text-ink">
            How to Order Products from Dr. Arwa Bohra
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs text-ink/85 mt-4">
          <div className="rounded-2xl border border-line bg-white p-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald text-white font-bold text-[11px] mb-2">
              1
            </span>
            <p className="font-bold text-ink mb-1">Select Formulation</p>
            <p className="text-smoke leading-relaxed">
              Click &quot;Buy on WhatsApp&quot; on any product to initiate your direct order request with our clinic team.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald text-white font-bold text-[11px] mb-2">
              2
            </span>
            <p className="font-bold text-ink mb-1">Easy UPI Transfer</p>
            <p className="text-smoke leading-relaxed">
              Transfer product amount + ₹{shippingCharge} delivery to UPI <strong>{upiNumber}</strong> and share the screenshot.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald text-white font-bold text-[11px] mb-2">
              3
            </span>
            <p className="font-bold text-ink mb-1">Doorstep Delivery</p>
            <p className="text-smoke leading-relaxed">
              Your parcel is securely packed and dispatched via tracked courier with personalized usage instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

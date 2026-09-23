"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/data";

interface ProductCardProps {
  product: Product;
  whatsapp: string;
  upiNumber?: string;
}

export default function ProductCard({
  product,
  whatsapp,
  upiNumber = "7049205128",
}: ProductCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [activeImage, setActiveImage] = useState(product.image);

  const allImages = [product.image, ...(product.gallery || [])].filter(Boolean);

  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : null;

  const orderMsg = encodeURIComponent(
    `Hi Dr. Arwa,\n\nI want to order:\n🧴 *${product.title}* (${product.size})\n💰 *Price:* ₹${product.price}\n\nPlease share delivery details and UPI payment instructions (${upiNumber}).`
  );
  const waUrl = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${orderMsg}`;

  const openModal = () => {
    setActiveImage(product.image);
    setShowDetail(true);
  };

  return (
    <>
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-white shadow-xs transition-all duration-300 hover:border-emerald/40 hover:shadow-card">
        {/* Image Container with Badges */}
        <div className="relative aspect-square w-full overflow-hidden bg-paper/60 cursor-pointer" onClick={openModal}>
          {product.image ? (
            product.image.startsWith("data:") || product.image.startsWith("/") ? (
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-smoke">
              Dr. Arwa Bohra Clinic
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5 pointer-events-none">
            <span className="rounded-full bg-paper/95 px-2.5 py-0.5 text-[11px] font-bold text-emerald-dark backdrop-blur border border-line shadow-xs">
              {product.category}
            </span>
            {discountPct && (
              <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-xs">
                {discountPct}% OFF
              </span>
            )}
          </div>

          <div className="absolute right-3 top-3 pointer-events-none">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border backdrop-blur shadow-xs ${
                product.inStock
                  ? "bg-emerald-soft/95 text-emerald-dark border-emerald/30"
                  : "bg-red-50/95 text-red-600 border-red-200"
              }`}
            >
              {product.inStock ? "In Stock" : "Sold Out"}
            </span>
          </div>

          {/* Multi-view badge */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-3 pointer-events-none">
              <span className="rounded-full bg-ink/75 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white backdrop-blur flex items-center gap-1 shadow-xs">
                <span>📸</span>
                <span>{allImages.length} Views</span>
              </span>
            </div>
          )}

          {/* Quick Details Hover Overlay */}
          <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="rounded-full bg-white/95 px-4 py-1.5 text-xs font-bold text-ink shadow-md backdrop-blur">
              Quick View
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div>
            <div className="flex items-center justify-between text-[11px] font-medium text-smoke">
              <span>{product.size}</span>
              <span className="text-emerald-dark font-semibold">100% Doctor Formulated</span>
            </div>

            <h3
              onClick={() => setShowDetail(true)}
              className="mt-1.5 font-display text-base sm:text-lg font-bold text-ink hover:text-emerald-dark transition-colors cursor-pointer leading-snug"
            >
              {product.title}
            </h3>

            <p className="mt-1 line-clamp-2 text-xs text-smoke">
              {product.tagline || product.description}
            </p>
          </div>

          {/* Pricing & CTA */}
          <div className="mt-4 pt-3 border-t border-line">
            <div className="flex items-baseline justify-between mb-3">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-xl sm:text-2xl font-bold text-ink">
                  ₹{product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-smoke line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-smoke">Pan-India Delivery</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={openModal}
                className="btn-outline text-xs py-2 px-2 text-center"
              >
                Details
              </button>

              {product.inStock ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary text-xs py-2 px-2 text-center flex items-center justify-center gap-1.5 bg-emerald-dark hover:bg-emerald"
                >
                  <span>Buy on WhatsApp</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="btn-primary text-xs py-2 px-2 text-center opacity-50 cursor-not-allowed"
                >
                  Sold Out
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-line bg-white p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setShowDetail(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-smoke hover:bg-paper hover:text-ink transition-colors z-10"
            >
              ✕
            </button>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Product Image & Gallery */}
              <div className="w-full sm:w-64 shrink-0 flex flex-col">
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-paper shadow-inner">
                  {activeImage && (
                    <img
                      src={activeImage}
                      alt={product.title}
                      className="h-full w-full object-cover transition-all duration-300"
                    />
                  )}
                  {activeImage === product.image ? (
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur">
                      Studio Packshot
                    </span>
                  ) : activeImage.includes("guide") ? (
                    <span className="absolute bottom-2 right-2 rounded-full bg-emerald-dark/80 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur">
                      Clinical Guide
                    </span>
                  ) : (
                    <span className="absolute bottom-2 right-2 rounded-full bg-gold/90 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur">
                      Clinic Batch
                    </span>
                  )}
                </div>

                {allImages.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImage(img)}
                        className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                          activeImage === img
                            ? "border-emerald shadow-sm ring-2 ring-emerald/30 scale-105"
                            : "border-line opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.title} view ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <span className="rounded-full bg-emerald-soft px-3 py-1 text-xs font-bold text-emerald-dark">
                  {product.category} · {product.size}
                </span>

                <h2 className="mt-2 font-display text-2xl font-bold text-ink leading-tight">
                  {product.title}
                </h2>

                <p className="mt-1 text-xs text-smoke font-medium">
                  {product.tagline}
                </p>

                <div className="mt-3 flex items-baseline gap-2.5">
                  <span className="font-display text-3xl font-bold text-ink">
                    ₹{product.price}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-smoke line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                  {discountPct && (
                    <span className="rounded bg-gold/20 text-gold-dark px-1.5 py-0.5 text-xs font-bold">
                      Save {discountPct}%
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs text-ink/80 leading-relaxed">
                  {product.description}
                </p>

                {/* Key Benefits */}
                {product.benefits && product.benefits.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                      Key Clinical Benefits:
                    </p>
                    <ul className="space-y-1 text-xs text-ink/80">
                      {product.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-dark font-bold">✓</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* How to Use */}
                {product.howToUse && (
                  <div className="mt-4 rounded-xl bg-paper p-3 border border-line">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-dark mb-1">
                      How to Use:
                    </p>
                    <p className="text-xs text-ink/80 leading-relaxed">
                      {product.howToUse}
                    </p>
                  </div>
                )}

                {/* Ingredients */}
                {product.ingredients && (
                  <div className="mt-3 text-[11px] text-smoke">
                    <strong className="text-ink">Actives &amp; Ingredients: </strong>
                    {product.ingredients}
                  </div>
                )}

                {/* Ordering Box */}
                <div className="mt-6 pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-smoke">Fast Dispatch via Courier</p>
                    <p className="text-xs font-semibold text-emerald-dark">
                      UPI Accepted: {upiNumber}
                    </p>
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary w-full sm:w-auto text-xs px-6 py-2.5 flex items-center justify-center gap-2"
                  >
                    <span>Order Now on WhatsApp →</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

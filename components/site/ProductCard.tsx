"use client";

import { useState, useEffect, useCallback } from "react";
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

  useEffect(() => {
    setActiveImage(product.image);
  }, [product.image]);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const allImages = [product.image, ...(product.gallery || [])].filter(Boolean);

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setIsZoomed(false);
  };

  const closeFullscreen = () => {
    setFullscreenIndex(null);
    setIsZoomed(false);
  };

  const nextFullscreen = useCallback(() => {
    if (fullscreenIndex === null || allImages.length <= 1) return;
    setFullscreenIndex((prev) => ((prev ?? 0) + 1) % allImages.length);
    setIsZoomed(false);
  }, [fullscreenIndex, allImages.length]);

  const prevFullscreen = useCallback(() => {
    if (fullscreenIndex === null || allImages.length <= 1) return;
    setFullscreenIndex((prev) =>
      (prev ?? 0) === 0 ? allImages.length - 1 : (prev ?? 0) - 1
    );
    setIsZoomed(false);
  }, [fullscreenIndex, allImages.length]);

  useEffect(() => {
    if (fullscreenIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFullscreen();
      if (e.key === "ArrowRight") nextFullscreen();
      if (e.key === "ArrowLeft") prevFullscreen();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreenIndex, nextFullscreen, prevFullscreen]);

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
          <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal();
              }}
              className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-ink shadow-md backdrop-blur hover:bg-white transition-all transform hover:scale-105"
            >
              Quick View
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openFullscreen(0);
              }}
              className="rounded-full bg-emerald-dark/90 px-3 py-1.5 text-xs font-bold text-white shadow-md backdrop-blur hover:bg-emerald-dark transition-all transform hover:scale-105 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>Full Screen</span>
            </button>
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
                <div
                  className="group/img relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-paper shadow-inner cursor-zoom-in"
                  onClick={() => {
                    const idx = allImages.indexOf(activeImage);
                    openFullscreen(idx !== -1 ? idx : 0);
                  }}
                >
                  {activeImage && (
                    <img
                      src={activeImage}
                      alt={product.title}
                      className="h-full w-full object-cover transition-all duration-300 group-hover/img:scale-105"
                    />
                  )}

                  {/* Fullscreen Button Overlay */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const idx = allImages.indexOf(activeImage);
                      openFullscreen(idx !== -1 ? idx : 0);
                    }}
                    className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/70 hover:bg-black/90 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur shadow-md transition-all z-10"
                    title="View Fullscreen"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span>Full Screen</span>
                  </button>

                  {/* Image Category Badge */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 pointer-events-none">
                    {activeImage === product.image ? (
                      <span className="rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur">
                        Studio Photography
                      </span>
                    ) : activeImage.includes("guide") ? (
                      <span className="rounded-full bg-emerald-dark/80 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur">
                        Clinical Guide
                      </span>
                    ) : (
                      <span className="rounded-full bg-gold/90 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur">
                        Clinic Batch
                      </span>
                    )}
                  </div>
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

                <p className="mt-2 text-[10px] text-smoke text-center">
                  💡 Click image for high-res full screen
                </p>
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

      {/* Fullscreen Lightbox Modal */}
      {fullscreenIndex !== null && allImages[fullscreenIndex] && (
        <div
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-black/95 backdrop-blur-md p-4 sm:p-6 text-white animate-in fade-in duration-200"
          onClick={closeFullscreen}
        >
          {/* Top Header Bar */}
          <div
            className="flex items-center justify-between z-20 pb-3 border-b border-white/10 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-sm sm:text-base text-white truncate max-w-[200px] sm:max-w-md">
                {product.title}
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs text-white/90">
                {fullscreenIndex + 1} / {allImages.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsZoomed((z) => !z)}
                className="rounded-full bg-white/10 hover:bg-white/20 p-2 text-xs text-white transition-colors flex items-center gap-1.5 px-3"
                title="Toggle Zoom"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
                <span className="hidden sm:inline">{isZoomed ? "Reset Zoom" : "Zoom 1.5x"}</span>
              </button>

              <button
                type="button"
                onClick={closeFullscreen}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors text-lg"
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Center High-Resolution Image Display with Prev/Next Navigation */}
          <div
            className="relative flex-1 flex items-center justify-center overflow-hidden my-3 cursor-zoom-in"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed((z) => !z);
            }}
          >
            {/* Previous Button */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevFullscreen();
                }}
                className="absolute left-2 sm:left-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur border border-white/20 transition-all hover:scale-110 text-2xl font-light"
                title="Previous Image (Left Arrow)"
              >
                ‹
              </button>
            )}

            {/* Main Image */}
            <img
              src={allImages[fullscreenIndex]}
              alt={`${product.title} - View ${fullscreenIndex + 1}`}
              className={`max-h-[75vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl transition-transform duration-300 ${
                isZoomed ? "scale-150 cursor-zoom-out" : "scale-100"
              }`}
            />

            {/* Next Button */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextFullscreen();
                }}
                className="absolute right-2 sm:right-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur border border-white/20 transition-all hover:scale-110 text-2xl font-light"
                title="Next Image (Right Arrow)"
              >
                ›
              </button>
            )}
          </div>

          {/* Bottom Bar: Thumbnails & Quick Actions */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 z-20 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Thumbnail Strip */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFullscreenIndex(idx);
                    setActiveImage(img);
                    setIsZoomed(false);
                  }}
                  className={`relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                    fullscreenIndex === idx
                      ? "border-emerald ring-2 ring-emerald scale-105 opacity-100"
                      : "border-white/30 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Shortcuts & CTA */}
            <div className="flex items-center gap-4 text-xs text-white/70">
              <span className="hidden md:inline">
                ⌨ Esc to close • ← → to switch • Click to zoom
              </span>
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-xs py-2 px-5 bg-emerald hover:bg-emerald-dark text-white rounded-full shadow-lg font-bold"
              >
                Buy on WhatsApp (₹{product.price})
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

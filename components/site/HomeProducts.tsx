import Link from "next/link";
import type { Product } from "@/lib/data";
import ProductCard from "./ProductCard";

interface HomeProductsProps {
  products: Product[];
  whatsapp: string;
  upiNumber?: string;
}

export default function HomeProducts({
  products,
  whatsapp,
  upiNumber,
}: HomeProductsProps) {
  const activeProducts = products.filter((p) => p.featured || p.inStock);
  if (activeProducts.length === 0) return null;

  return (
    <section id="products" className="py-16 sm:py-20 bg-paper/60 border-t border-line">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="rounded-full bg-emerald-soft px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-dark">
            Doctor Formulated Dispensary
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
            Our Products &amp; Formulations
          </h2>
          <p className="mt-2 text-sm text-smoke">
            Handcrafted pure botanical serums, therapeutic oils &amp; doctor-approved homeopathic solutions. Safe, gentle, and delivered directly to your doorstep.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activeProducts.slice(0, 3).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              whatsapp={whatsapp}
              upiNumber={upiNumber}
            />
          ))}
        </div>

        {/* View All CTA */}
        {products.length > 3 && (
          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="btn-outline inline-flex items-center gap-2 text-xs font-bold"
            >
              <span>View All {products.length} Products</span>
              <span>→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

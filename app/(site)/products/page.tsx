import type { Metadata } from "next";
import { getProducts, getSettings } from "@/lib/data";
import ProductsPageClient from "./ProductsPageClient";

export const metadata: Metadata = {
  title: "Our Products & Formulations — Dr. Arwa Bohra Clinic",
  description:
    "Explore clinical botanical serums, therapeutic hair oils, and doctor-approved homeopathic solutions formulated by Dr. Arwa Bohra. Pan-India doorstep delivery.",
};

export default function ProductsPage() {
  const products = getProducts();
  const settings = getSettings();

  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="rounded-full bg-emerald-soft px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-dark">
            Clinically Curated Formulations
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink sm:text-5xl">
            Our Products &amp; Dispensary
          </h1>
          <p className="mt-3 text-sm sm:text-base text-smoke leading-relaxed">
            Pure botanical serums, slow-infused therapeutic oils, and homeopathic remedies crafted to target stubborn hairfall, acne, and pigmentation naturally without steroids.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-emerald-dark">
            <span className="rounded-full bg-paper px-3 py-1 border border-line">
              🌿 100% Steroid &amp; Paraben Free
            </span>
            <span className="rounded-full bg-paper px-3 py-1 border border-line">
              🚚 Pan-India Tracked Courier
            </span>
            <span className="rounded-full bg-paper px-3 py-1 border border-line">
              🩺 Handcrafted by Dr. Arwa Bohra
            </span>
          </div>
        </div>

        <ProductsPageClient
          products={products}
          whatsapp={settings.whatsapp}
          upiNumber={settings.upiNumber ?? "7049205128"}
          shippingCharge={settings.shippingCharge ?? 80}
        />
      </div>
    </div>
  );
}

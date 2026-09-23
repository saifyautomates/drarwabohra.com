import { isAdminRequest } from "@/lib/auth";
import { getProducts } from "@/lib/data";
import AdminLogin from "@/components/admin/AdminLogin";
import { PageHeader } from "@/components/admin/ui";
import ProductsClient from "./ProductsClient";

export const metadata = {
  title: "Products Admin — Dr. Arwa Bohra",
};

export default function ProductsPage() {
  if (!isAdminRequest()) return <AdminLogin />;

  const products = getProducts();

  return (
    <div>
      <PageHeader
        title="Products & Dispensary"
        sub="Manage clinical serums, oils, and remedies sold online. Upload product photos directly from your phone album or computer, update pricing, and toggle in-stock status in real time."
      />
      <ProductsClient initialProducts={products} />
    </div>
  );
}

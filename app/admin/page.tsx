import { isAdminRequest } from "@/lib/auth";
import { getBookings, getSettings, getProductSales, getProducts } from "@/lib/data";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboardClient from "./AdminDashboardClient";

export default function AdminDashboard() {
  if (!isAdminRequest()) return <AdminLogin />;

  const settings = getSettings();
  const bookings = getBookings();
  const sales = getProductSales();
  const products = getProducts();

  return (
    <AdminDashboardClient
      initialBookings={bookings}
      initialSales={sales}
      products={products}
      settings={settings}
    />
  );
}

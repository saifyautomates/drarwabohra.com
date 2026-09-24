import { isAdminRequest } from "@/lib/auth";
import { getBookings, getSettings } from "@/lib/data";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboardClient from "./AdminDashboardClient";

export default function AdminDashboard() {
  if (!isAdminRequest()) return <AdminLogin />;

  const settings = getSettings();
  const bookings = getBookings();

  return (
    <AdminDashboardClient
      initialBookings={bookings}
      settings={settings}
    />
  );
}

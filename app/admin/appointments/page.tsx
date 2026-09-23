import { isAdminRequest } from "@/lib/auth";
import { getBookings } from "@/lib/data";
import AdminLogin from "@/components/admin/AdminLogin";
import { PageHeader } from "@/components/admin/ui";
import AppointmentsClient from "./AppointmentsClient";

export default function AppointmentsPage() {
  if (!isAdminRequest()) return <AdminLogin />;

  const bookings = getBookings();

  return (
    <div>
      <PageHeader
        title="Appointments"
        sub="All bookings, newest first. Confirm, reschedule or mark outcomes here."
      />
      <AppointmentsClient initialBookings={bookings} />
    </div>
  );
}

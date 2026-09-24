import { isAdminRequest } from "@/lib/auth";
import { getBookings, getPatientRecords, getProductSales, getSettings } from "@/lib/data";
import AdminLogin from "@/components/admin/AdminLogin";
import PatientsClient from "./PatientsClient";

export default function PatientsPage() {
  if (!isAdminRequest()) return <AdminLogin />;

  const patients = getPatientRecords();
  const bookings = getBookings();
  const sales = getProductSales();
  const settings = getSettings();

  return (
    <PatientsClient
      initialPatients={patients}
      bookings={bookings}
      sales={sales}
      settings={settings}
    />
  );
}

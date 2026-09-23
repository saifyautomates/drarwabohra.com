import { isAdminRequest } from "@/lib/auth";
import { getTreatments } from "@/lib/data";
import AdminLogin from "@/components/admin/AdminLogin";
import { PageHeader } from "@/components/admin/ui";
import TreatmentsClient from "./TreatmentsClient";

export default function TreatmentsPage() {
  if (!isAdminRequest()) return <AdminLogin />;

  return (
    <div>
      <PageHeader
        title="Treatments"
        sub="Services shown on the website. Changes appear on the public site immediately."
      />
      <TreatmentsClient initialTreatments={getTreatments()} />
    </div>
  );
}

import { isAdminRequest } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import AdminLogin from "@/components/admin/AdminLogin";
import { PageHeader } from "@/components/admin/ui";
import SettingsClient from "./SettingsClient";

export default function SettingsPage() {
  if (!isAdminRequest()) return <AdminLogin />;

  return (
    <div>
      <PageHeader
        title="Clinic settings"
        sub="Everything shown on the website — contact, fees, home-page copy, integrations."
      />
      <SettingsClient initialSettings={getSettings()} />
    </div>
  );
}

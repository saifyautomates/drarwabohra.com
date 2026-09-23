import { isAdminRequest } from "@/lib/auth";
import { getSchedule } from "@/lib/data";
import AdminLogin from "@/components/admin/AdminLogin";
import { PageHeader } from "@/components/admin/ui";
import ScheduleClient from "./ScheduleClient";

export default function SchedulePage() {
  if (!isAdminRequest()) return <AdminLogin />;

  return (
    <div>
      <PageHeader
        title="Weekly schedule"
        sub="Set open hours per day and consult mode. Tick 'Closed' to close a mode for a day. Sundays are closed by default."
      />
      <ScheduleClient initialSchedule={getSchedule()} />
    </div>
  );
}

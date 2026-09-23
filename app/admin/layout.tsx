import { isAdminRequest } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The admin chrome (nav, logout) only renders for authenticated admins.
  // Each page additionally gates its own content via <AdminLogin />.
  if (!isAdminRequest()) {
    return <div className="min-h-screen bg-paper">{children}</div>;
  }
  return <AdminShell>{children}</AdminShell>;
}

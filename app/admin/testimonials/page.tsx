import { isAdminRequest } from "@/lib/auth";
import { getTestimonials } from "@/lib/data";
import AdminLogin from "@/components/admin/AdminLogin";
import { PageHeader } from "@/components/admin/ui";
import TestimonialsClient from "./TestimonialsClient";

export default function TestimonialsPage() {
  if (!isAdminRequest()) return <AdminLogin />;

  return (
    <div>
      <PageHeader
        title="Testimonials"
        sub="Sample entries are placeholders — replace them with real patient reviews."
      />
      <TestimonialsClient initialTestimonials={getTestimonials()} />
    </div>
  );
}

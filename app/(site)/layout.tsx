import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import FloatingWhatsApp from "@/components/site/FloatingWhatsApp";
import MobileBookBar from "@/components/site/MobileBookBar";
import { getSettings } from "@/lib/data";

/**
 * Public site shell: emergency strip + navbar + page + footer,
 * plus floating WhatsApp and the mobile booking bar.
 * Admin and API routes live outside this group and are untouched.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = getSettings();

  return (
    <>
      <Navbar
        clinicName={settings.clinicName}
        doctorName={settings.doctorName}
      />
      <main>{children}</main>
      <Footer settings={settings} />
      <FloatingWhatsApp whatsapp={settings.whatsapp} />
      <MobileBookBar />
    </>
  );
}

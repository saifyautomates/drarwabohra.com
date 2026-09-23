import { isAdminRequest } from "@/lib/auth";
import { getVideos } from "@/lib/data";
import AdminLogin from "@/components/admin/AdminLogin";
import { PageHeader } from "@/components/admin/ui";
import VideosClient from "./VideosClient";

export default function VideosPage() {
  if (!isAdminRequest()) return <AdminLogin />;

  return (
    <div>
      <PageHeader
        title="Videos"
        sub="YouTube and Instagram reel links shown in the homepage “Videos” carousel. Nothing is seeded — only what you add appears on the site."
      />
      <VideosClient initialVideos={getVideos()} />
    </div>
  );
}

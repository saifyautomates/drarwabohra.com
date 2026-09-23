import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getVideos, saveVideos } from "@/lib/data";
import { sanitizeVideo } from "@/lib/validation";
import { deny, readBody } from "../../_guard";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const denied = deny();
  if (denied) return denied;

  const parsed = await readBody(req);
  if (!parsed.ok) return parsed.response;

  const sanitized = sanitizeVideo(parsed.body);
  if (!sanitized.ok || !sanitized.value) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }

  const list = getVideos();
  const idx = list.findIndex((v) => v.id === params.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Video not found." }, { status: 404 });
  }

  const updated = {
    ...list[idx],
    ...sanitized.value,
    id: list[idx].id,
    createdAt: list[idx].createdAt,
  };
  list[idx] = updated;
  saveVideos(list);

  revalidatePath("/");

  return NextResponse.json({ ok: true, video: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const denied = deny();
  if (denied) return denied;

  const list = getVideos();
  if (!list.some((v) => v.id === params.id)) {
    return NextResponse.json({ error: "Video not found." }, { status: 404 });
  }

  saveVideos(list.filter((v) => v.id !== params.id));

  revalidatePath("/");

  return NextResponse.json({ ok: true });
}

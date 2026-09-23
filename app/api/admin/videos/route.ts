import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getVideos, saveVideos, type Video } from "@/lib/data";
import { nextVideoId, sanitizeVideo } from "@/lib/validation";
import { deny, readBody } from "../_guard";

export async function GET() {
  const denied = deny();
  if (denied) return denied;
  return NextResponse.json({ videos: getVideos() });
}

export async function POST(req: Request) {
  const denied = deny();
  if (denied) return denied;

  const parsed = await readBody(req);
  if (!parsed.ok) return parsed.response;

  const sanitized = sanitizeVideo(parsed.body);
  if (!sanitized.ok || !sanitized.value) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }

  const list = getVideos();
  const video: Video = {
    id: nextVideoId(list),
    createdAt: new Date().toISOString(),
    ...sanitized.value,
  };
  list.push(video);
  saveVideos(list);

  revalidatePath("/");

  return NextResponse.json({ ok: true, video }, { status: 201 });
}

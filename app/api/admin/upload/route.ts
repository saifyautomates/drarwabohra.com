import { NextResponse } from "next/server";
import { deny } from "../_guard";
import fs from "node:fs";
import path from "node:path";

export async function POST(req: Request) {
  const denied = deny();
  if (denied) return denied;

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No image file provided." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const mime = file.type || (ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg");
      const filename = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

      // Try writing to public/images/products/ if filesystem is writable
      const publicDir = path.join(process.cwd(), "public", "images", "products");
      let savedUrl: string | null = null;
      try {
        fs.mkdirSync(publicDir, { recursive: true });
        fs.writeFileSync(path.join(publicDir, filename), buffer);
        savedUrl = `/images/products/${filename}`;
      } catch {
        // Fallback to data URL on read-only serverless filesystems
      }

      if (!savedUrl) {
        savedUrl = `data:${mime};base64,${buffer.toString("base64")}`;
      }

      return NextResponse.json({ ok: true, url: savedUrl });
    }

    // JSON payload with base64 dataUrl
    const body = await req.json().catch(() => null);
    if (body?.dataUrl && typeof body.dataUrl === "string") {
      return NextResponse.json({ ok: true, url: body.dataUrl });
    }

    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}

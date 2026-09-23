"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Video } from "@/lib/data";
import { parseVideoUrl } from "@/lib/data-client";
import {
  ErrorNote,
  Field,
  SavedNote,
  api,
} from "@/components/admin/ui";

const EMPTY = { title: "", url: "", active: true, order: 0 };

export default function VideosClient({
  initialVideos,
}: {
  initialVideos: Video[];
}) {
  const router = useRouter();
  const [list, setList] = useState(initialVideos);
  const [editing, setEditing] = useState<Video | null>(null);
  const [draft, setDraft] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const sorted = [...list].sort((a, b) => a.order - b.order);

  function startAdd() {
    setEditing(null);
    setDraft({ ...EMPTY, order: list.length });
    setShowForm(true);
    setError(null);
  }

  function startEdit(v: Video) {
    setEditing(v);
    setDraft({ title: v.title, url: v.url, active: v.active, order: v.order });
    setShowForm(true);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const url = editing
      ? `/api/admin/videos/${editing.id}`
      : "/api/admin/videos";
    const method = editing ? "PUT" : "POST";
    const res = await api<{ video: Video }>(url, method, {
      title: draft.title,
      url: draft.url,
      active: draft.active,
      order: Number(draft.order) || 0,
    });
    setSaving(false);

    if (!res.ok || !res.data?.video) {
      setError(res.error ?? "Save failed.");
      return;
    }

    const v = res.data.video;
    setList((prev) =>
      (editing ? prev.map((x) => (x.id === v.id ? v : x)) : [...prev, v]).sort(
        (a, b) => a.order - b.order
      )
    );
    setShowForm(false);
    setEditing(null);
    setSaved(true);
    router.refresh();
  }

  async function onDelete(v: Video) {
    if (!window.confirm(`Delete "${v.title}"? This cannot be undone.`))
      return;
    setError(null);
    const res = await api(`/api/admin/videos/${v.id}`, "DELETE");
    if (!res.ok) {
      setError(res.error ?? "Delete failed.");
      return;
    }
    setList((prev) => prev.filter((x) => x.id !== v.id));
    router.refresh();
  }

  /** Persist a single field change without opening the form. */
  async function persist(v: Video, patch: Partial<Video>) {
    setError(null);
    const res = await api<{ video: Video }>(`/api/admin/videos/${v.id}`, "PUT", {
      title: patch.title ?? v.title,
      url: patch.url ?? v.url,
      active: patch.active ?? v.active,
      order: patch.order ?? v.order,
    });
    if (!res.ok || !res.data?.video) {
      setError(res.error ?? "Update failed.");
      return;
    }
    const updated = res.data.video;
    setList((prev) =>
      prev
        .map((x) => (x.id === updated.id ? updated : x))
        .sort((a, b) => a.order - b.order)
    );
    router.refresh();
  }

  /** Swap this video's order with its neighbour, then persist both. */
  async function move(v: Video, dir: -1 | 1) {
    const idx = sorted.findIndex((x) => x.id === v.id);
    const other = sorted[idx + dir];
    if (!other) return;
    setError(null);
    const a = await api<{ video: Video }>(`/api/admin/videos/${v.id}`, "PUT", {
      title: v.title,
      url: v.url,
      active: v.active,
      order: other.order,
    });
    const b = await api<{ video: Video }>(
      `/api/admin/videos/${other.id}`,
      "PUT",
      {
        title: other.title,
        url: other.url,
        active: other.active,
        order: v.order,
      }
    );
    if (!a.ok || !b.ok || !a.data?.video || !b.data?.video) {
      setError(a.error ?? b.error ?? "Reorder failed.");
      return;
    }
    setList((prev) =>
      prev
        .map((x) =>
          x.id === v.id ? a.data!.video : x.id === other.id ? b.data!.video : x
        )
        .sort((x, y) => x.order - y.order)
    );
    router.refresh();
  }

  const draftParsed = parseVideoUrl(draft.url);

  return (
    <div>
      <div className="mb-5 flex justify-between">
        <p className="text-xs text-smoke">{list.length} videos</p>
        <button className="btn-primary" onClick={startAdd}>
          Add video
        </button>
      </div>

      <div className="mb-4">
        <ErrorNote error={error} />
      </div>
      <SavedNote saved={saved && !showForm} />

      {showForm && (
        <form onSubmit={onSubmit} className="card mb-6 space-y-4 p-5 sm:p-6">
          <h3 className="font-display text-xl text-ink">
            {editing ? "Edit video" : "New video"}
          </h3>
          <Field label="Title">
            <input
              className="input"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              required
              maxLength={120}
              placeholder="e.g. Monsoon skincare routine"
            />
          </Field>
          <Field
            label="Video URL"
            hint="YouTube link (watch, youtu.be, Shorts) or Instagram reel / post link"
          >
            <input
              className="input"
              value={draft.url}
              onChange={(e) => setDraft({ ...draft, url: e.target.value })}
              required
              maxLength={500}
              placeholder="https://www.youtube.com/watch?v=…"
              inputMode="url"
            />
          </Field>
          {draft.url.trim() !== "" && (
            <p
              className={`text-sm font-medium ${
                draftParsed ? "text-emerald-dark" : "text-red-700"
              }`}
            >
              {draftParsed
                ? `Detected: ${draftParsed.type === "youtube" ? "YouTube" : "Instagram"} video ✓`
                : "Not a recognizable YouTube or Instagram video link."}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
            <Field label="Order" hint="Lower first">
              <input
                type="number"
                className="input"
                value={draft.order}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    order: parseInt(e.target.value, 10) || 0,
                  })
                }
              />
            </Field>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) =>
                    setDraft({ ...draft, active: e.target.checked })
                  }
                  className="h-4 w-4 accent-emerald"
                />
                Show on website
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="btn-outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-60"
            >
              {saving
                ? "Saving…"
                : editing
                  ? "Save video"
                  : "Add video"}
            </button>
          </div>
        </form>
      )}

      {sorted.length === 0 && !showForm && (
        <div className="card p-8 text-center">
          <p className="text-sm text-smoke">
            No videos yet. Add YouTube or Instagram links and they will appear
            in the “Videos” section on the homepage.
          </p>
        </div>
      )}

      <ul className="space-y-3">
        {sorted.map((v, idx) => (
          <li key={v.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                  <span
                    className={`badge ${
                      v.type === "youtube"
                        ? "bg-red-50 text-red-700"
                        : "bg-gold-soft text-gold-dark"
                    }`}
                  >
                    {v.type === "youtube" ? "YouTube" : "Instagram"}
                  </span>
                  {!v.active && (
                    <span className="badge badge-closed">Hidden</span>
                  )}
                  <span className="truncate">{v.title}</span>
                </p>
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 block truncate text-xs text-emerald-dark underline-offset-2 hover:underline"
                >
                  {v.url}
                </a>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="flex flex-col gap-1">
                  <button
                    className="btn-outline !px-2.5 !py-1 !text-xs"
                    disabled={idx === 0}
                    onClick={() => move(v, -1)}
                    aria-label="Move up"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    className="btn-outline !px-2.5 !py-1 !text-xs"
                    disabled={idx === sorted.length - 1}
                    onClick={() => move(v, 1)}
                    aria-label="Move down"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
                <button
                  className="btn-outline !px-3 !py-1.5"
                  onClick={() => persist(v, { active: !v.active })}
                >
                  {v.active ? "Hide" : "Show"}
                </button>
                <button
                  className="btn-outline !px-3 !py-1.5"
                  onClick={() => startEdit(v)}
                >
                  Edit
                </button>
                <button
                  className="rounded-xl border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(v)}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Testimonial } from "@/lib/data";
import {
  ErrorNote,
  Field,
  SavedNote,
  api,
} from "@/components/admin/ui";

const EMPTY = { name: "", treatment: "", text: "", sample: false, sort: 0 };

export default function TestimonialsClient({
  initialTestimonials,
}: {
  initialTestimonials: Testimonial[];
}) {
  const router = useRouter();
  const [list, setList] = useState(initialTestimonials);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [draft, setDraft] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function startAdd() {
    setEditing(null);
    setDraft(EMPTY);
    setShowForm(true);
    setError(null);
  }

  function startEdit(t: Testimonial) {
    setEditing(t);
    setDraft({
      name: t.name,
      treatment: t.treatment,
      text: t.text,
      sample: t.sample,
      sort: t.sort,
    });
    setShowForm(true);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const url = editing
      ? `/api/admin/testimonials/${editing.id}`
      : "/api/admin/testimonials";
    const method = editing ? "PUT" : "POST";
    const res = await api<{ testimonial: Testimonial }>(url, method, {
      name: draft.name,
      treatment: draft.treatment,
      text: draft.text,
      sample: draft.sample,
      sort: Number(draft.sort) || 0,
    });
    setSaving(false);

    if (!res.ok || !res.data?.testimonial) {
      setError(res.error ?? "Save failed.");
      return;
    }

    const t = res.data.testimonial;
    setList((prev) =>
      (editing
        ? prev.map((x) => (x.id === t.id ? t : x))
        : [...prev, t]
      ).sort((a, b) => a.sort - b.sort)
    );
    setShowForm(false);
    setEditing(null);
    setSaved(true);
    router.refresh();
  }

  async function onDelete(t: Testimonial) {
    if (!window.confirm(`Delete this testimonial? This cannot be undone.`))
      return;
    setError(null);
    const res = await api(`/api/admin/testimonials/${t.id}`, "DELETE");
    if (!res.ok) {
      setError(res.error ?? "Delete failed.");
      return;
    }
    setList((prev) => prev.filter((x) => x.id !== t.id));
    router.refresh();
  }

  return (
    <div>
      <div className="mb-5 flex justify-between">
        <p className="text-xs text-smoke">{list.length} testimonials</p>
        <button className="btn-primary" onClick={startAdd}>
          Add testimonial
        </button>
      </div>

      <div className="mb-4">
        <ErrorNote error={error} />
      </div>
      <SavedNote saved={saved && !showForm} />

      {showForm && (
        <form onSubmit={onSubmit} className="card mb-6 space-y-4 p-5 sm:p-6">
          <h3 className="font-display text-xl text-ink">
            {editing ? "Edit testimonial" : "New testimonial"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_120px]">
            <Field label="Name">
              <input
                className="input"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                required
                maxLength={60}
                placeholder="Priya S."
              />
            </Field>
            <Field label="Treatment" hint="e.g. Acne & Pimples">
              <input
                className="input"
                value={draft.treatment}
                onChange={(e) =>
                  setDraft({ ...draft, treatment: e.target.value })
                }
                maxLength={80}
              />
            </Field>
            <Field label="Sort" hint="Lower first">
              <input
                type="number"
                className="input"
                value={draft.sort}
                onChange={(e) =>
                  setDraft({ ...draft, sort: parseInt(e.target.value, 10) || 0 })
                }
              />
            </Field>
          </div>
          <Field label="Testimonial text">
            <textarea
              className="input"
              rows={4}
              value={draft.text}
              onChange={(e) => setDraft({ ...draft, text: e.target.value })}
              required
              maxLength={800}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={draft.sample}
              onChange={(e) => setDraft({ ...draft, sample: e.target.checked })}
              className="h-4 w-4 accent-emerald"
            />
            Mark as sample (shows a “Sample” badge on the website)
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              className="btn-outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? "Saving…" : editing ? "Save testimonial" : "Add testimonial"}
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-3">
        {list.map((t) => (
          <li key={t.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                  {t.name}
                  {t.sample && (
                    <span className="badge badge-sample">Sample</span>
                  )}
                  {t.treatment && (
                    <span className="badge badge-closed">{t.treatment}</span>
                  )}
                </p>
                <p className="mt-2 text-sm text-smoke">“{t.text}”</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button className="btn-outline !px-3 !py-1.5" onClick={() => startEdit(t)}>
                  Edit
                </button>
                <button
                  className="rounded-xl border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(t)}
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

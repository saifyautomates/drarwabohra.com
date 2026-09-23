"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Treatment } from "@/lib/data";
import {
  ErrorNote,
  Field,
  SavedNote,
  api,
} from "@/components/admin/ui";

const EMPTY = { title: "", desc: "", sort: 0 };

export default function TreatmentsClient({
  initialTreatments,
}: {
  initialTreatments: Treatment[];
}) {
  const router = useRouter();
  const [list, setList] = useState(initialTreatments);
  const [editing, setEditing] = useState<Treatment | null>(null);
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

  function startEdit(t: Treatment) {
    setEditing(t);
    setDraft({ title: t.title, desc: t.desc, sort: t.sort });
    setShowForm(true);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const url = editing
      ? `/api/admin/treatments/${editing.id}`
      : "/api/admin/treatments";
    const method = editing ? "PUT" : "POST";
    const res = await api<{ treatment: Treatment }>(url, method, {
      title: draft.title,
      desc: draft.desc,
      sort: Number(draft.sort) || 0,
    });
    setSaving(false);

    if (!res.ok || !res.data?.treatment) {
      setError(res.error ?? "Save failed.");
      return;
    }

    const t = res.data.treatment;
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

  async function onDelete(t: Treatment) {
    if (
      !window.confirm(`Delete “${t.title}”? This cannot be undone.`)
    )
      return;
    setError(null);
    const res = await api(`/api/admin/treatments/${t.id}`, "DELETE");
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
        <p className="text-xs text-smoke">{list.length} treatments</p>
        <button className="btn-primary" onClick={startAdd}>
          Add treatment
        </button>
      </div>

      <div className="mb-4">
        <ErrorNote error={error} />
      </div>
      <SavedNote saved={saved && !showForm} />

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="card mb-6 space-y-4 p-5 sm:p-6"
        >
          <h3 className="font-display text-xl text-ink">
            {editing ? "Edit treatment" : "New treatment"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <Field label="Title">
              <input
                className="input"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                required
                maxLength={80}
                placeholder="Acne & Pimples"
              />
            </Field>
            <Field label="Sort order" hint="Lower shows first">
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
          <Field label="Description" hint="Short and honest. No cure guarantees.">
            <textarea
              className="input"
              rows={3}
              value={draft.desc}
              onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
              maxLength={500}
            />
          </Field>
          <div className="flex gap-3">
            <button
              type="button"
              className="btn-outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? "Saving…" : editing ? "Save treatment" : "Add treatment"}
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-3">
        {list.map((t) => (
          <li key={t.id} className="card flex items-start justify-between gap-4 p-5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">
                <span className="mr-2 inline-flex rounded-full bg-cream px-2 py-0.5 text-xs font-medium text-smoke">
                  {t.sort}
                </span>
                {t.title}
              </p>
              {t.desc && (
                <p className="mt-1 text-sm text-smoke line-clamp-2">{t.desc}</p>
              )}
              <p className="mt-1 text-xs text-smoke">/{t.slug}</p>
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
          </li>
        ))}
      </ul>
    </div>
  );
}

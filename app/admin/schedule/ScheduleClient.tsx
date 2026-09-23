"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ConsultMode, Schedule, WeekDay } from "@/lib/data";
import { WEEKDAY_LABEL } from "@/lib/data-client";
import {
  ErrorNote,
  Field,
  SavedNote,
  useSaveForm,
} from "@/components/admin/ui";

const WEEKDAYS: WeekDay[] = ["0", "1", "2", "3", "4", "5", "6"];
const MODES: { key: ConsultMode; label: string }[] = [
  { key: "in-clinic", label: "In-clinic" },
  { key: "video", label: "Video" },
  { key: "audio", label: "Audio" },
];

export default function ScheduleClient({
  initialSchedule,
}: {
  initialSchedule: Schedule;
}) {
  const router = useRouter();
  const [hours, setHours] = useState(initialSchedule.hours);
  const [slotDurationMin, setSlotDurationMin] = useState(
    initialSchedule.slotDurationMin
  );
  const [blockedDates, setBlockedDates] = useState<string[]>(
    initialSchedule.blockedDates
  );
  const [newBlocked, setNewBlocked] = useState("");

  const { saving, error, saved, setError, save } = useSaveForm<Schedule>(
    "/api/admin/schedule",
    "PUT"
  );

  function setWindow(
    day: WeekDay,
    mode: ConsultMode,
    field: "start" | "end",
    value: string
  ) {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mode]: { ...(prev[day][mode] ?? { start: "10:00", end: "13:00" }), [field]: value },
      },
    }));
  }

  function toggleClosed(day: WeekDay, mode: ConsultMode) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [mode]: prev[day][mode] ? null : { start: "10:00", end: "13:00" } },
    }));
  }

  function addBlocked() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newBlocked)) {
      setError("Enter a valid date.");
      return;
    }
    if (!blockedDates.includes(newBlocked)) {
      setBlockedDates((prev) => [...prev, newBlocked].sort());
    }
    setNewBlocked("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await save({
      hours,
      slotDurationMin: Math.min(120, Math.max(5, slotDurationMin || 20)),
      blockedDates,
    });
    if (result) router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Weekly grid */}
      <div className="space-y-4">
        {WEEKDAYS.map((day) => (
          <div key={day} className="card p-4 sm:p-5">
            <h3 className="mb-3 font-display text-lg text-ink">
              {WEEKDAY_LABEL[day]}
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              {MODES.map(({ key, label }) => {
                const w = hours[day][key];
                return (
                  <div key={key} className="rounded-xl border border-line p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-ink">
                        {label}
                      </span>
                      <label className="flex items-center gap-1.5 text-xs text-smoke">
                        <input
                          type="checkbox"
                          checked={w === null}
                          onChange={() => toggleClosed(day, key)}
                          className="h-4 w-4 accent-emerald"
                        />
                        Closed
                      </label>
                    </div>
                    {w ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          className="input"
                          value={w.start}
                          onChange={(e) => setWindow(day, key, "start", e.target.value)}
                        />
                        <span className="text-smoke">–</span>
                        <input
                          type="time"
                          className="input"
                          value={w.end}
                          onChange={(e) => setWindow(day, key, "end", e.target.value)}
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-smoke">Closed for {label.toLowerCase()} consults.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Slot length + blocked dates */}
      <div className="card p-4 sm:p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Slot duration (minutes)"
            hint="Each appointment takes this long. 20 is the default."
          >
            <input
              type="number"
              min={5}
              max={120}
              className="input max-w-[160px]"
              value={slotDurationMin}
              onChange={(e) => setSlotDurationMin(parseInt(e.target.value, 10) || 0)}
            />
          </Field>
          <div>
            <Field label="Blocked dates (holidays / leave)">
              <div className="flex gap-2">
                <input
                  type="date"
                  className="input"
                  value={newBlocked}
                  onChange={(e) => setNewBlocked(e.target.value)}
                />
                <button type="button" className="btn-outline shrink-0" onClick={addBlocked}>
                  Add
                </button>
              </div>
            </Field>
            {blockedDates.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {blockedDates.map((d) => (
                  <li
                    key={d}
                    className="badge badge-closed !py-1.5 !pl-3 !pr-1.5 text-xs"
                  >
                    {d}
                    <button
                      type="button"
                      aria-label={`Remove ${d}`}
                      className="ml-1.5 rounded-full px-1.5 hover:text-ink"
                      onClick={() =>
                        setBlockedDates((prev) => prev.filter((x) => x !== d))
                      }
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-smoke">No blocked dates.</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <ErrorNote error={error} />
        <SavedNote saved={saved} />
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? "Saving…" : "Save schedule"}
        </button>
      </div>
    </form>
  );
}

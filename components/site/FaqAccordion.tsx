"use client";

import { useState } from "react";
import type { FaqItem } from "./faq-data";

/**
 * Accessible accordion — each item is an independent button/region pair.
 * Used on /faq (all items) and the homepage preview (first 4).
 */
export default function FaqAccordion({
  items,
  idPrefix = "faq",
}: {
  items: FaqItem[];
  idPrefix?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-white">
      {items.map((item, i) => {
        const open = openIndex === i;
        const btnId = `${idPrefix}-btn-${i}`;
        const panelId = `${idPrefix}-panel-${i}`;
        return (
          <div key={i}>
            <h3>
              <button
                type="button"
                id={btnId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-[15px] font-semibold text-ink">
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-smoke transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M3 5.5 7 9.5l4-4" />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              hidden={!open}
              className="px-5 pb-5"
            >
              <p className="text-sm leading-relaxed text-smoke">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

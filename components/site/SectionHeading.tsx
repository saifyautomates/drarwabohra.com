/**
 * Consistent section heading: tiny gold rule + serif display title +
 * optional smoke subline.
 */
export default function SectionHeading({
  eyebrow,
  title,
  subline,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subline?: string;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <div className={`flex flex-col ${alignCls}`}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-dark">
          {eyebrow}
        </p>
      )}
      <div className="rule-gold my-3" aria-hidden="true" />
      <h2 className="font-display text-2xl text-ink sm:text-3xl break-words">{title}</h2>
      {subline && (
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-smoke break-words">
          {subline}
        </p>
      )}
    </div>
  );
}

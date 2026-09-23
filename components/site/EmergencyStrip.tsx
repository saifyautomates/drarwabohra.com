/**
 * Thin emergency strip — always visible above the navbar on every page.
 * This site only books routine consultations; emergencies go to 108/112.
 */
export default function EmergencyStrip() {
  return (
    <div className="bg-ink px-4 py-2 text-center text-[12.5px] leading-snug text-paper">
      Medical emergency? This site is not for emergencies — call{" "}
      <a href="tel:108" className="font-semibold underline underline-offset-2">
        108
      </a>{" "}
      /{" "}
      <a href="tel:112" className="font-semibold underline underline-offset-2">
        112
      </a>
      .
    </div>
  );
}

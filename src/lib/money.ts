// Money is stored as integer minor units (PRD §129), e.g. kobo for NGN.
// This converts back to major units for display.
export function formatMoney(minorUnits: number | null | undefined, currency: string | null | undefined): string | null {
  if (minorUnits === null || minorUnits === undefined) return null;
  const major = minorUnits / 100;
  return `${currency ?? "NGN"} ${major.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

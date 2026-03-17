/**
 * Centralized baby age utilities.
 * All age calculations should go through this module — never inline.
 */

/**
 * Calculate baby's age in months from birthDate.
 * Lightweight, no AI calls — runs purely locally.
 */
export function getBabyAgeInMonths(birthDate: Date): number {
  const now = new Date();
  return (
    (now.getFullYear() - birthDate.getFullYear()) * 12 +
    (now.getMonth() - birthDate.getMonth())
  );
}

/**
 * Human-readable age string (e.g. "7 months old", "1y 2m old").
 */
export function getAgeLabel(birthDate: Date): string {
  const months = getBabyAgeInMonths(birthDate);
  if (months < 1) return "Newborn";
  if (months === 1) return "1 month old";
  if (months < 12) return `${months} months old`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} year${years > 1 ? "s" : ""} old`;
  return `${years}y ${rem}m old`;
}

/**
 * Short age label for compact UI (e.g. "7 months", "1y 2m").
 */
export function getAgeShortLabel(birthDate: Date): string {
  const months = getBabyAgeInMonths(birthDate);
  if (months < 1) return "Newborn";
  if (months === 1) return "1 month";
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years}y`;
  return `${years}y ${rem}m`;
}

/**
 * Check if baby is old enough for solid foods (6+ months).
 */
export function isReadyForSolids(birthDate: Date): boolean {
  return getBabyAgeInMonths(birthDate) >= 6;
}

/**
 * Safety message for babies under 6 months.
 */
export const UNDER_6_MONTHS_MESSAGE =
  "Solid foods are usually introduced around 6 months. Consult your pediatrician before starting MPASI.";

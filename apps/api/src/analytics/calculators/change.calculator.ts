import type { ChangeMetric } from "../models/analytics.types.js";

// Рахує абсолютну і відсоткову зміну
export function calculateChange(
  current: number,
  previous: number
): ChangeMetric {
  const value = current - previous;

  const percent =
    previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : 0;

  return {
    value,
    percent,
  };
}
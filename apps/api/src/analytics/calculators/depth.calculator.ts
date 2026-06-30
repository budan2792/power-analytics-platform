import type { DepthZoneSnapshot } from "../models/analytics.types.js";
import { calculateChange } from "./change.calculator.js";

function parseDepthZones(value: unknown): DepthZoneSnapshot[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((zone) => {
      if (
        typeof zone === "object" &&
        zone !== null &&
        "percent" in zone &&
        "totalValue" in zone
      ) {
        return {
          percent: Number(zone.percent),
          totalValue: Number(zone.totalValue),
        };
      }

      return null;
    })
    .filter((zone): zone is DepthZoneSnapshot => zone !== null);
}

function getDepthValue(zones: DepthZoneSnapshot[], percent: number) {
  return zones.find((zone) => zone.percent === percent)?.totalValue ?? 0;
}

// Рахує зміни глибини стакану по зонах
export function calculateDepthChanges(current: unknown, previous: unknown) {
  const currentZones = parseDepthZones(current);
  const previousZones = parseDepthZones(previous);

  return {
    depth1ChangeUSDT: calculateChange(
      getDepthValue(currentZones, 1),
      getDepthValue(previousZones, 1)
    ).value,

    depth3ChangeUSDT: calculateChange(
      getDepthValue(currentZones, 3),
      getDepthValue(previousZones, 3)
    ).value,

    depth5ChangeUSDT: calculateChange(
      getDepthValue(currentZones, 5),
      getDepthValue(previousZones, 5)
    ).value,

    depth10ChangeUSDT: calculateChange(
      getDepthValue(currentZones, 10),
      getDepthValue(previousZones, 10)
    ).value,

    depth30ChangeUSDT: calculateChange(
      getDepthValue(currentZones, 30),
      getDepthValue(previousZones, 30)
    ).value,
  };
}
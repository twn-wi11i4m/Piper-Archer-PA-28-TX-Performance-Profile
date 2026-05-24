// Get the cruise range (with or without reserve)

/**
 * Cruise Range Calculator (No Reserve & With 45 min Reserve)
 * Converted from Python equations
 */

const eq75RangeNoReserve = (x) =>
  0.00015896064648124596 * (x / 1000) ** 2 +
  0.3325726636574625 * (x / 1000) +
  511.9383669232532;

const eq65RangeNoReserve = (x) =>
  -0.0773623699937523 * (x / 1000) ** 2 -
  1.5758322138885594 * (x / 1000) +
  560.0246376067983;

const eq55RangeNoReserve = (x) =>
  -0.11692324832476599 * (x / 1000) ** 2 -
  2.8483638825061637 * (x / 1000) +
  600.6985220617513;

const eq75Range = (x) =>
  0.003206924209483638 * (x / 1000) ** 2 -
  0.2782700847964677 * (x / 1000) +
  444.57016199594784;

const eq65Range = (x) =>
  -0.08648698428534626 * (x / 1000) ** 2 -
  1.9009849674759158 * (x / 1000) +
  486.7623808659925;

const eq55Range = (x) =>
  -0.10772135248496197 * (x / 1000) ** 2 -
  3.1556495418492996 * (x / 1000) +
  521.63075081749;

const MAXIMUM_PRESSURE_ALT_FOR_75 = 6700;
const MAXIMUM_PRESSURE_ALT = 10000;

/**
 * Returns [rangeNoReserve, rangeWithReserve]
 */
export function getCruiseRange(cruisePressureAlt, powerSetting) {
  let pa = Number(cruisePressureAlt) || 0;
  const setting = powerSetting || "65%";

  if (pa < 0) {
    console.warn("Cruise pressure altitude must be positive. Using 0.");
    pa = 0;
  }

  let rangeNoReserve = 0;
  let rangeWithReserve = 0;

  if (setting === "75%") {
    if (pa > MAXIMUM_PRESSURE_ALT_FOR_75) {
      console.warn(
        `Cruise pressure altitude ${pa} ft exceeds limit for 75%. Using ${MAXIMUM_PRESSURE_ALT_FOR_75} ft.`,
      );
      pa = MAXIMUM_PRESSURE_ALT_FOR_75;
    }

    rangeNoReserve = eq75RangeNoReserve(pa);
    rangeWithReserve = eq75Range(pa);
  } else if (setting === "65%") {
    if (pa > MAXIMUM_PRESSURE_ALT) {
      console.warn(
        `Cruise pressure altitude ${pa} ft exceeds limit. Using ${MAXIMUM_PRESSURE_ALT} ft.`,
      );
      pa = MAXIMUM_PRESSURE_ALT;
    }

    rangeNoReserve = eq65RangeNoReserve(pa);
    rangeWithReserve = eq65Range(pa);
  } else if (setting === "55%") {
    if (pa > MAXIMUM_PRESSURE_ALT) {
      console.warn(
        `Cruise pressure altitude ${pa} ft exceeds limit. Using ${MAXIMUM_PRESSURE_ALT} ft.`,
      );
      pa = MAXIMUM_PRESSURE_ALT;
    }

    rangeNoReserve = eq55RangeNoReserve(pa);
    rangeWithReserve = eq55Range(pa);
  } else {
    // Default to 65%
    if (pa > MAXIMUM_PRESSURE_ALT) pa = MAXIMUM_PRESSURE_ALT;
    rangeNoReserve = eq65RangeNoReserve(pa);
    rangeWithReserve = eq65Range(pa);
  }

  // Wheel pants removed: reduce range by 3% (default = false as per this Python code)
  const isWheelPantsRemoved = false; // Change to true if you want default reduction

  if (isWheelPantsRemoved) {
    rangeNoReserve *= 0.97;
    rangeWithReserve *= 0.97;
  }

  return [
    Math.round(Math.max(0, rangeNoReserve)), // No reserve
    Math.round(Math.max(0, rangeWithReserve)), // With 45 min reserve
  ];
}

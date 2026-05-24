// Get the cruise endurance (with or without reserve)

/**
 * Cruise Endurance Calculator (No Reserve & With 45 min Reserve)
 * Converted from Python equations
 */

const eq75EnduranceNoReserve = (x) =>
  0.0002701571324095236 * (x / 1000) ** 2 -
  0.016956198650394935 * (x / 1000) +
  4.237541183003965;

const eq65EnduranceNoReserve = (x) =>
  -0.0006841206803306451 * (x / 1000) ** 2 -
  0.02630205769837696 * (x / 1000) +
  4.92437072270664;

const eq55EnduranceNoReserve = (x) =>
  -0.0010092904534916996 * (x / 1000) ** 2 -
  0.0420325436820756 * (x / 1000) +
  5.704917817265517;

const eq75Endurance = (x) =>
  0.00011977680813073139 * (x / 1000) ** 2 -
  0.016811947799535303 * (x / 1000) +
  3.685663840857639;

const eq65Endurance = (x) =>
  -0.0005734267386824156 * (x / 1000) ** 2 -
  0.02718973758219958 * (x / 1000) +
  4.273768543044319;

const eq55Endurance = (x) =>
  -0.001257134941389173 * (x / 1000) ** 2 -
  0.03848606599839725 * (x / 1000) +
  4.947477637246531;

const MAXIMUM_PRESSURE_ALT_FOR_75 = 6700;
const MAXIMUM_PRESSURE_ALT = 10000;

/**
 * Returns [enduranceNoReserve (hours), enduranceWithReserve (hours)]
 */
export function getCruiseEndurance(cruisePressureAlt, powerSetting) {
  let pa = Number(cruisePressureAlt) || 0;
  const setting = powerSetting || "65%";

  if (pa < 0) {
    console.warn("Cruise pressure altitude must be positive. Using 0.");
    pa = 0;
  }

  let enduranceNoReserve = 0;
  let enduranceWithReserve = 0;

  if (setting === "75%") {
    if (pa > MAXIMUM_PRESSURE_ALT_FOR_75) {
      console.warn(
        `Cruise pressure altitude ${pa} ft exceeds limit for 75%. Using ${MAXIMUM_PRESSURE_ALT_FOR_75} ft.`,
      );
      pa = MAXIMUM_PRESSURE_ALT_FOR_75;
    }

    enduranceNoReserve = eq75EnduranceNoReserve(pa);
    enduranceWithReserve = eq75Endurance(pa);
  } else if (setting === "65%") {
    if (pa > MAXIMUM_PRESSURE_ALT) {
      console.warn(
        `Cruise pressure altitude ${pa} ft exceeds limit. Using ${MAXIMUM_PRESSURE_ALT} ft.`,
      );
      pa = MAXIMUM_PRESSURE_ALT;
    }

    enduranceNoReserve = eq65EnduranceNoReserve(pa);
    enduranceWithReserve = eq65Endurance(pa);
  } else if (setting === "55%") {
    if (pa > MAXIMUM_PRESSURE_ALT) {
      console.warn(
        `Cruise pressure altitude ${pa} ft exceeds limit. Using ${MAXIMUM_PRESSURE_ALT} ft.`,
      );
      pa = MAXIMUM_PRESSURE_ALT;
    }

    enduranceNoReserve = eq55EnduranceNoReserve(pa);
    enduranceWithReserve = eq55Endurance(pa);
  } else {
    // Default to 65%
    if (pa > MAXIMUM_PRESSURE_ALT) pa = MAXIMUM_PRESSURE_ALT;
    enduranceNoReserve = eq65EnduranceNoReserve(pa);
    enduranceWithReserve = eq65Endurance(pa);
  }

  return [
    Math.max(0, Number(enduranceNoReserve.toFixed(2))), // No reserve
    Math.max(0, Number(enduranceWithReserve.toFixed(2))), // With 45 min reserve
  ];
}

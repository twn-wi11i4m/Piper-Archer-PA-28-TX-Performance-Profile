// Get the cruise performance data

const eqRpm55 = (pressureAlt, oat) =>
  0.011886628477557571 * pressureAlt +
  1.145716767304226 * oat +
  2245.545442247461;

const eqRpm65 = (pressureAlt, oat) =>
  0.013743715401816969 * pressureAlt +
  1.2696724066451666 * oat +
  2384.375908184868;

const eqRpm75 = (pressureAlt, oat) =>
  0.018960977136994385 * pressureAlt +
  1.771085294598575 * oat +
  2487.839960695418;

const eqTas55 = (pressureAlt, oat) =>
  0.00029224461508134967 * pressureAlt +
  0.03135807342297872 * oat +
  105.15899307489101;

const eqTas65 = (pressureAlt, oat) =>
  0.0006212156009701686 * pressureAlt +
  0.0672241559867734 * oat +
  113.0113491646845;

const eqTas75 = (pressureAlt, oat) =>
  0.0011704617175493195 * pressureAlt +
  0.10782564410370805 * oat +
  119.14698205694847;

/**
 * Main function - matches your requested structure
 * Returns [TAS (kt), RPM]
 */
export function getCruisePerformance(
  cruisePressureAltitude,
  cruiseTemperature,
  powerSetting,
  isWheelPantsRemoved,
) {
  const pressureAlt = Number(cruisePressureAltitude) || 0;
  const oat = Number(cruiseTemperature) || 15;

  // Clamp pressure altitude
  let pa = pressureAlt;
  if (pa < 0) {
    console.warn(
      `Pressure altitude ${pa} ft is below valid range. Using 0 ft.`,
    );
    pa = 0;
  }

  let rpm = 0;
  let tas = 0;

  if (powerSetting === "55%") {
    rpm = eqRpm55(pa, oat);
    tas = eqTas55(pa, oat);
  } else if (powerSetting === "65%") {
    rpm = eqRpm65(pa, oat);
    tas = eqTas65(pa, oat);
  } else if (powerSetting === "75%") {
    rpm = eqRpm75(pa, oat);
    tas = eqTas75(pa, oat);
  } else {
    // Default to 65%
    rpm = eqRpm65(pa, oat);
    tas = eqTas65(pa, oat);
  }

  // Wheel pants removed: subtract 3 kt from TAS
  if (isWheelPantsRemoved) {
    tas -= 3;
  }

  return [
    Math.round(tas), // TAS in knots
    Math.round(rpm), // RPM
  ];
}

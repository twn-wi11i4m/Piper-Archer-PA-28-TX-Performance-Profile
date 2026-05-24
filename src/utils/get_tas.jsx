// TAS calculation
const L = 0.0065; // Temperature lapse rate (K/m);
const p_0 = 101325; // Sea-level standartd pressure (Pa;
const T_0 = 288.15; // Sea-level standard temperature (K);
const g = 9.80665; // Gravitational acceleration (m/s^2);
const R = 287.05; // Specific gas constant for dry air (J/(kg K));
const gamma = 1.4; // Ratio of specific heats for air;
const a_0 = 340.294; // Standard speed of sound at sea level;

function feetToMeter(feet) {
  return feet * 0.3048;
}

function meterToFeet(meter) {
  return meter * 3.2808399;
}

function knotsToMeterPerSecond(knots) {
  return knots * 0.514444444;
}

function meterPerSecondToKnots(meterPerSecond) {
  return meterPerSecond * 1.94384449;
}

function convertPressureAltitudeToStaticPressure(pressureAltitude) {
  const h = feetToMeter(pressureAltitude);
  const p = p_0 * (1 - (L * h) / T_0) ** (g / (R * L));
  return p;
}

function convertCasIntoImpactPressure(vC) {
  const qC =
    p_0 *
    ((1 + 0.5 * (gamma - 1) * (knotsToMeterPerSecond(vC) / a_0) ** 2) **
      (gamma / (gamma - 1)) -
      1);
  return qC;
}

function computeMachNumber(qC, p) {
  const M = Math.sqrt(
    (2 / (gamma - 1)) * ((qC / p + 1) ** ((gamma - 1) / gamma) - 1),
  );
  return M;
}

function computeLocalSpeedOfSound(oat) {
  const a = Math.sqrt(gamma * R * (oat + 273.15));
  return a;
}

export function calculateTrueAirspeed(pressureAltitude, cas, oat) {
  const p = convertPressureAltitudeToStaticPressure(pressureAltitude);
  const qC = convertCasIntoImpactPressure(cas);
  const M = computeMachNumber(qC, p);
  const localSpeedOfSound = computeLocalSpeedOfSound(oat);
  const tas = meterPerSecondToKnots(M * localSpeedOfSound);
  return tas;
}

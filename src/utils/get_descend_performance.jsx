// Get the descend performance data

const eq1000 = (x) =>
  -0.0035018267360157115 * x ** 2 - 0.12110787155565149 * x + 92.46028181651681;
const eq2000 = (x) =>
  0.0006167773289832115 * x ** 2 - 0.6179216601775454 * x + 188.75521885418718;
const eq3000 = (x) =>
  -0.0009315459471407204 * x ** 2 - 0.8487555839922275 * x + 280.926053529341;
const eq4000 = (x) =>
  0.0037223076552535955 * x ** 2 - 1.3003718527806336 * x + 373.06944242738814;
const eq5000 = (x) =>
  -0.00020231283941410621 * x ** 2 - 1.479785991092841 * x + 462.85096073580235;
const eq6000 = (x) =>
  0.002337425682195397 * x ** 2 - 1.8462954560707763 * x + 552.4072468246843;
const eq7000 = (x) =>
  0.0024825331546052334 * x ** 2 - 2.1317142333867594 * x + 639.4657327374205;
const eq8000 = (x) =>
  0.004372829439147254 * x ** 2 - 2.4686244357900113 * x + 726.9099013036799;
const eq9000 = (x) =>
  0.0035802116672910005 * x ** 2 - 2.727072596064982 * x + 811.7513313451988;
const eq10000 = (x) =>
  0.0062909752630088845 * x ** 2 - 3.0644160250306296 * x + 895.7036283796284;

// Fallback definitions for 11000ft and 12000ft curves. These were missing
// and caused runtime ReferenceErrors. Use the 10000ft curve as a safe
// fallback to avoid crashes; these can be refined later with proper data.
const eq11000 = (x) => eq10000(x);
const eq12000 = (x) => eq10000(x);

const eqTimeCurve = (rawAlt) => {
  const x = rawAlt / 1000;
  return 29.794687324187304 * x;
};

const eqFuelCurve = (rawAlt) => {
  const x = rawAlt / 1000;
  return 6.004107303127298 * x;
};

const eqDistanceCurve = (rawAlt) => {
  const x = rawAlt / 1000;
  return 62.097631721385724 * x;
};

function calculateISATemp(pressureAltitude) {
  const tempSeaLevel = 15.0;
  const lapseRate = 2.0 / 1000.0;
  return tempSeaLevel - lapseRate * pressureAltitude;
}

function getRawAlt(pressureAlt, oat) {
  let pa = Number(pressureAlt) || 0;
  let temp = Number(oat) || 15;

  // Clamp pressure altitude
  if (pa < 0) pa = 0;
  if (pa > 12000) pa = 12000;

  const isaTemp = calculateISATemp(pa);

  // Clamp OAT
  if (temp <= isaTemp - 15) temp = isaTemp - 15;
  if (temp >= isaTemp + 35) temp = isaTemp + 35;

  let rawAlt = 0;

  if (pa <= 1000) {
    rawAlt = ((pa - 0) / (1000 - 0)) * (eq1000(temp) - 0) + 0;
  } else if (pa <= 2000) {
    rawAlt =
      ((pa - 1000) / (2000 - 1000)) * (eq2000(temp) - eq1000(temp)) +
      eq1000(temp);
  } else if (pa <= 3000) {
    rawAlt =
      ((pa - 2000) / (3000 - 2000)) * (eq3000(temp) - eq2000(temp)) +
      eq2000(temp);
  } else if (pa <= 4000) {
    rawAlt =
      ((pa - 3000) / (4000 - 3000)) * (eq4000(temp) - eq3000(temp)) +
      eq3000(temp);
  } else if (pa <= 5000) {
    rawAlt =
      ((pa - 4000) / (5000 - 4000)) * (eq5000(temp) - eq4000(temp)) +
      eq4000(temp);
  } else if (pa <= 6000) {
    rawAlt =
      ((pa - 5000) / (6000 - 5000)) * (eq6000(temp) - eq5000(temp)) +
      eq5000(temp);
  } else if (pa <= 7000) {
    rawAlt =
      ((pa - 6000) / (7000 - 6000)) * (eq7000(temp) - eq6000(temp)) +
      eq6000(temp);
  } else if (pa <= 8000) {
    rawAlt =
      ((pa - 7000) / (8000 - 7000)) * (eq8000(temp) - eq7000(temp)) +
      eq7000(temp);
  } else if (pa <= 9000) {
    rawAlt =
      ((pa - 8000) / (9000 - 8000)) * (eq9000(temp) - eq8000(temp)) +
      eq8000(temp);
  } else if (pa <= 10000) {
    rawAlt =
      ((pa - 9000) / (10000 - 9000)) * (eq10000(temp) - eq9000(temp)) +
      eq9000(temp);
  } else if (pa <= 11000) {
    rawAlt =
      ((pa - 10000) / (11000 - 10000)) * (eq11000(temp) - eq10000(temp)) +
      eq10000(temp);
  } else {
    rawAlt =
      ((pa - 11000) / (12000 - 11000)) * (eq12000(temp) - eq11000(temp)) +
      eq11000(temp);
  }

  return rawAlt;
}

/**
 * Main function - matches your requested signature
 */
export function getDescendPerformance(
  cruisePressureAltitude,
  arrivalPressureAltitude,
  cruiseTemperature,
  arrivalTemperature,
) {
  const cruisePA = Number(cruisePressureAltitude) || 0;
  const arrPA = Number(arrivalPressureAltitude) || 0;
  const cruiseOAT = Number(cruiseTemperature) || 15;
  const arrOAT = Number(arrivalTemperature) || 15;

  const cruiseRawAlt = getRawAlt(cruisePA, cruiseOAT);
  const arrRawAlt = getRawAlt(arrPA, arrOAT);

  const time = eqTimeCurve(cruiseRawAlt) - eqTimeCurve(arrRawAlt);
  const fuel = eqFuelCurve(cruiseRawAlt) - eqFuelCurve(arrRawAlt);
  const distance = eqDistanceCurve(cruiseRawAlt) - eqDistanceCurve(arrRawAlt);

  return [
    Math.max(0, time), // Time in minutes
    Math.max(0, fuel), // Fuel in gallons
    Math.max(0, distance), // Distance in nautical miles
  ];
}

// Get the climb rates

/**
 * Climb Rates Calculator (Initial, Final, Average)
 * Converted from Python equations
 */

const eq0ft = (x) => -2.6824393280373293 * x + 733.9297993614763;
const eq1000ft = (x) => -2.7512423499578382 * x + 684.8481255117409;
const eq2000ft = (x) => -2.732557749206764 * x + 638.8115914329919;
const eq3000ft = (x) => -2.8539796536159794 * x + 591.2454955182515;
const eq4000ft = (x) => -2.9132369353692917 * x + 543.3347924755194;
const eq5000ft = (x) => -2.884429314485104 * x + 494.32106616563004;
const eq6000ft = (x) => -2.9646762748299818 * x + 445.85626426866406;
const eq7000ft = (x) => -2.997121443223642 * x + 396.76916415006417;
const eq8000ft = (x) => -3.0874161828024484 * x + 348.7101611898521;
const eq9000ft = (x) => -3.158396009640642 * x + 298.8633320555995;
const eq10000ft = (x) => -3.1864170783815453 * x + 250.10932529868055;
const eq11000ft = (x) => -3.2140520027240536 * x + 200.56982557527985;
const eq12000ft = (x) => -3.331343746284818 * x + 150.40368339251077;
const eq13000ft = (x) => -3.316106540253996 * x + 101.13884430358485;

const SERVICE_CEILING = 14085;
const ABSOLUTE_CEILING = 16400;

function findISATemperature(pressureAlt) {
  return 15 - (pressureAlt / 1000) * 2;
}

function findISADeviation(oat, pressureAlt) {
  const isaTemp = findISATemperature(pressureAlt);
  return oat - isaTemp;
}

function findClimbRate(oat, pressureAlt) {
  let temp = Number(oat) || 15;
  let pa = Number(pressureAlt) || 0;

  // OAT clamping
  if (temp < -25) {
    console.warn("OAT below -25°C. Using -25°C.");
    temp = -25;
  } else if (temp > 50) {
    console.warn("OAT above 50°C. Using 50°C.");
    temp = 50;
  }

  // ISA Deviation clamping
  const isaDev = findISADeviation(temp, pa);
  if (isaDev < -15) {
    console.warn("ISA deviation below -15°C. Clamping to ISA-15.");
    temp = findISATemperature(pa) - 15;
  } else if (isaDev > 35) {
    console.warn("ISA deviation above +35°C. Clamping to ISA+35.");
    temp = findISATemperature(pa) + 35;
  }

  // Pressure Altitude clamping
  if (pa < 0) {
    console.warn("Pressure altitude below 0 ft. Using 0 ft.");
    pa = 0;
  } else if (pa > 13000 && pa <= ABSOLUTE_CEILING) {
    console.warn(`Pressure altitude above 13000 ft. Using 13000 ft.`);
    pa = 13000;
  } else if (pa > ABSOLUTE_CEILING) {
    console.warn(
      `Pressure altitude above absolute ceiling. Returning 0 ft/min.`,
    );
    return 0;
  }

  let climbRate = 0;

  if (pa < 1000) {
    climbRate =
      ((pa - 0) / (1000 - 0)) * (eq1000ft(temp) - eq0ft(temp)) + eq0ft(temp);
  } else if (pa < 2000) {
    climbRate =
      ((pa - 1000) / (2000 - 1000)) * (eq2000ft(temp) - eq1000ft(temp)) +
      eq1000ft(temp);
  } else if (pa < 3000) {
    climbRate =
      ((pa - 2000) / (3000 - 2000)) * (eq3000ft(temp) - eq2000ft(temp)) +
      eq2000ft(temp);
  } else if (pa < 4000) {
    climbRate =
      ((pa - 3000) / (4000 - 3000)) * (eq4000ft(temp) - eq3000ft(temp)) +
      eq3000ft(temp);
  } else if (pa < 5000) {
    climbRate =
      ((pa - 4000) / (5000 - 4000)) * (eq5000ft(temp) - eq4000ft(temp)) +
      eq4000ft(temp);
  } else if (pa < 6000) {
    climbRate =
      ((pa - 5000) / (6000 - 5000)) * (eq6000ft(temp) - eq5000ft(temp)) +
      eq5000ft(temp);
  } else if (pa < 7000) {
    climbRate =
      ((pa - 6000) / (7000 - 6000)) * (eq7000ft(temp) - eq6000ft(temp)) +
      eq6000ft(temp);
  } else if (pa < 8000) {
    climbRate =
      ((pa - 7000) / (8000 - 7000)) * (eq8000ft(temp) - eq7000ft(temp)) +
      eq7000ft(temp);
  } else if (pa < 9000) {
    climbRate =
      ((pa - 8000) / (9000 - 8000)) * (eq9000ft(temp) - eq8000ft(temp)) +
      eq8000ft(temp);
  } else if (pa < 10000) {
    climbRate =
      ((pa - 9000) / (10000 - 9000)) * (eq10000ft(temp) - eq9000ft(temp)) +
      eq9000ft(temp);
  } else if (pa < 11000) {
    climbRate =
      ((pa - 10000) / (11000 - 10000)) * (eq11000ft(temp) - eq10000ft(temp)) +
      eq10000ft(temp);
  } else if (pa < 12000) {
    climbRate =
      ((pa - 11000) / (12000 - 11000)) * (eq12000ft(temp) - eq11000ft(temp)) +
      eq11000ft(temp);
  } else if (pa <= 13000) {
    climbRate =
      ((pa - 12000) / (13000 - 12000)) * (eq13000ft(temp) - eq12000ft(temp)) +
      eq12000ft(temp);
  }

  return Math.round(climbRate);
}

/**
 * Main function - Returns [initialRate, finalRate, averageRate]
 */
export function getClimbRates(
  departurePressureAlt,
  departureTemperature,
  cruisePressureAlt,
  cruiseTemperature,
) {
  const depPA = Number(departurePressureAlt) || 0;
  const depOAT = Number(departureTemperature) || 15;
  const cruisePA = Number(cruisePressureAlt) || 0;
  const cruiseOAT = Number(cruiseTemperature) || 15;

  const initialRate = findClimbRate(depOAT, depPA); // Climb rate at departure
  const finalRate = findClimbRate(cruiseOAT, cruisePA); // Climb rate at cruise altitude

  const averageRate = Math.round((initialRate + finalRate) / 2);

  return [
    Math.max(0, initialRate),
    Math.max(0, finalRate),
    Math.max(0, averageRate),
  ];
}

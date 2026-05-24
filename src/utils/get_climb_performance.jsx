// Get the climb performance data
const eq1000 = (x) =>
  -0.0030336552976179335 * x ** 2 + 0.7486666525083585 * x + 51.91405335722125;
const eq2000 = (x) =>
  0.00510335578385728 * x ** 2 + 0.8472002283522042 * x + 109.33108607734667;
const eq3000 = (x) =>
  0.011556802897238205 * x ** 2 + 1.175844155693544 * x + 165.68827243922988;
const eq4000 = (x) =>
  0.01258516520789626 * x ** 2 + 1.712441668542836 * x + 225.6462157189347;
const eq5000 = (x) =>
  0.009565915177492246 * x ** 2 + 2.407618391202137 * x + 287.68541215105716;
const eq6000 = (x) =>
  0.02135346456643555 * x ** 2 + 2.643057623128605 * x + 350.3996611172676;
const eq7000 = (x) =>
  0.016686513740569075 * x ** 2 + 3.391247863847919 * x + 417.149410288477;
const eq8000 = (x) =>
  0.014648525201691525 * x ** 2 + 4.016966791673071 * x + 486.08974324000184;
const eq9000 = (x) =>
  0.023410945762647226 * x ** 2 + 4.443591228291377 * x + 555.5269449358807;
const eq10000 = (x) =>
  0.021615855451874926 * x ** 2 + 4.972340849355145 * x + 630.6732578589224;
const eq11000 = (x) =>
  0.031341933133548244 * x ** 2 + 5.497569857918162 * x + 701.7968277210367;
const eq12000 = (x) =>
  0.032829497651299416 * x ** 2 + 6.095123298008156 * x + 778.8719244688085;

const eqTimeCurve = (rawAlt) => {
  const x = rawAlt / 1000;
  return (
    (-20.9268152610606 * x ** 2 + 23.601186147220716 * x) /
    (0.4631434036502857 * x ** 2 - 1.4461341264018486 * x + 1)
  );
};

const eqFuelCurve = (rawAlt) => {
  const x = rawAlt / 1000;
  return (
    (-4.58301096451044 * x ** 2 + 3.7425934203494196 * x + 1.3814750405651282) /
    (0.47573706855241654 * x ** 2 - 1.4648858502755426 * x + 1)
  );
};

const eqDistanceCurve = (rawAlt) => {
  const x = rawAlt / 1000;
  return (
    (-23.965851445357018 * x ** 2 + 31.553049525479427 * x) /
    (0.4023798202607053 * x ** 2 - 1.360393600894319 * x + 1)
  );
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
export function getClimbPerformance(
  departurePressureAltitude,
  cruisePressureAltitude,
  departureTemperature,
  cruiseTemperature,
) {
  const depPA = Number(departurePressureAltitude) || 0;
  const cruisePA = Number(cruisePressureAltitude) || 0;
  const depOAT = Number(departureTemperature) || 15;
  const cruiseOAT = Number(cruiseTemperature) || 15;

  const departRawAlt = getRawAlt(depPA, depOAT);
  const cruiseRawAlt = getRawAlt(cruisePA, cruiseOAT);

  const time = eqTimeCurve(cruiseRawAlt) - eqTimeCurve(departRawAlt);
  const fuel = eqFuelCurve(cruiseRawAlt) - eqFuelCurve(departRawAlt);
  const distance =
    eqDistanceCurve(cruiseRawAlt) - eqDistanceCurve(departRawAlt);

  return [
    Math.max(0, time), // Time in minutes
    Math.max(0, fuel), // Fuel in gallons
    Math.max(0, distance), // Distance in nautical miles
  ];
}

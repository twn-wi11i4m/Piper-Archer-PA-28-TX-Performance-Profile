// Get the pressure altitude from given elevation and altimeter
export function getPressureAlt(elevation, altimeter) {
  const elev = Number(elevation) || 0;
  const alt = Number(altimeter) || 29.92;
  return elev + (29.92 - alt) * 1000;
}

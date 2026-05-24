// Get the density altitude from given elevation and altimeter
function calculateIsaTemp(pressureAltitude) {
  const pa = Number(pressureAltitude) || 0;
  return 15 - (2 / 1000) * pa;
}

// Accepts (pressureAltitude, oat)
export function getDensityAlt(pressureAltitude, oat) {
  const pa = Number(pressureAltitude) || 0;
  const oatNum = Number(oat);
  const isa_temp = calculateIsaTemp(pa);

  // If OAT is not a finite number, return pressure altitude as density altitude
  if (!Number.isFinite(oatNum)) return pa;

  return pa + (oatNum - isa_temp) * 120;
}

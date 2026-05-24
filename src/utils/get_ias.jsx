// Get the IAS from the given CAS

export function calculateIndicatedAirspeed(cas) {
  const ias = 1.1302391063144566 * cas - 11.693636019686888;
  return ias;
}

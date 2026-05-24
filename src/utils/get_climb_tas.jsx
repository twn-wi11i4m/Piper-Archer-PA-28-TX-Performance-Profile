// Get the climb true airspeed
import { calculateTrueAirspeed } from "./get_tas";

const climbCAS = 78; // default climb CAS

export function getClimbTAS(
  departurePressureAltitude,
  cruisePressureAltitude,
  departureTemperature,
  cruiseTemperature,
) {
  const averagePressureAltitude =
    (Number(departurePressureAltitude) || 0) + (Number(cruisePressureAltitude) || 0);
  const avgPA = averagePressureAltitude / 2;
  const averageTemperature = (Number(departureTemperature) || 0) + (Number(cruiseTemperature) || 0);
  const avgTemp = averageTemperature / 2;
  const climbTAS = calculateTrueAirspeed(
    avgPA,
    climbCAS,
    avgTemp,
  );
  return climbTAS;
}

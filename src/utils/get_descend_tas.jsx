// Get the descend true airspeed
import { calculateTrueAirspeed } from "./get_tas";

const descendCAS = 118; // default descend CAS

export function getDescendTAS(
  cruisePressureAltitude,
  arrivalPressureAltitude,
  cruiseTemperature,
  arrivalTemperature,
) {
  const averagePressureAltitude =
    (Number(cruisePressureAltitude) || 0) + (Number(arrivalPressureAltitude) || 0);
  const avgPA = averagePressureAltitude / 2;
  const averageTemperature = (Number(cruiseTemperature) || 0) + (Number(arrivalTemperature) || 0);
  const avgTemp = averageTemperature / 2;
  const descendTAS = calculateTrueAirspeed(avgPA, descendCAS, avgTemp);
  return descendTAS;
}

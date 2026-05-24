import React, { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";

import { getPressureAlt } from "./utils/get_pressure_alt";
import { getDensityAlt } from "./utils/get_density_alt";

import { getClimbTAS } from "./utils/get_climb_tas";
import { getDescendTAS } from "./utils/get_descend_tas";

import { getClimbRates } from "./utils/get_climb_rates";
import { getClimbPerformance } from "./utils/get_climb_performance";
import { getDescendPerformance } from "./utils/get_descend_performance";

import { getCruisePerformance } from "./utils/get_cruise_performance";

import { calculateCalibratedAirspeed } from "./utils/get_cas";
import { calculateIndicatedAirspeed } from "./utils/get_ias";

import { getCruiseRange } from "./utils/get_cruise_range";
import { getCruiseEndurance } from "./utils/get_cruise_endurance";

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const fmt = (value, decimals = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(decimals) : "-";
};

const showExact = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  // Return full numeric string without forced rounding
  return String(n);
};

// Pressure Altitude Formula
const pressureAltFormulaText =
  "Pressure Alt (ft) = Field Elevation + 1000 x (29.92 - Altimeter)";

// Density Altitude Formula (approximate)
const densityAltFormulaText =
  "Density Alt (ft) ≈ Pressure Alt + 120 x (OAT - ISA Temp)";

// ==============================

function App() {
  const exportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  // =====

  // Performance States
  const [departureElevation, setDepartureElevation] = useState("");
  const [cruiseAltitude, setCruiseAltitude] = useState("");
  const [arrivalElevation, setArrivalElevation] = useState("");
  const [departureAltimeter, setDepartureAltimeter] = useState("");
  const [cruiseAltimeter, setCruiseAltimeter] = useState("");
  const [arrivalAltimeter, setArrivalAltimeter] = useState("");
  const [departureTemperature, setDepartureTemperature] = useState("");
  const [cruiseTemperature, setCruiseTemperature] = useState("");
  const [arrivalTemperature, setArrivalTemperature] = useState("");

  // Power Setting for Cruise
  const [powerSetting, setPowerSetting] = useState("65%");
  const [wheelPantsRemoved, setWheelPantsRemoved] = useState(true);

  const clearAll = () => {
    setDepartureElevation("");
    setCruiseAltitude("");
    setArrivalElevation("");
    setDepartureAltimeter("");
    setCruiseAltimeter("");
    setArrivalAltimeter("");
    setDepartureTemperature("");
    setCruiseTemperature("");
    setArrivalTemperature("");
  };

  // === Pressure Altitudes ===
  const departurePressureAlt = useMemo(
    () => getPressureAlt(departureElevation, departureAltimeter),
    [departureElevation, departureAltimeter],
  );

  const cruisePressureAlt = useMemo(
    () => getPressureAlt(cruiseAltitude, cruiseAltimeter),
    [cruiseAltitude, cruiseAltimeter],
  );

  const arrivalPressureAlt = useMemo(
    () => getPressureAlt(arrivalElevation, arrivalAltimeter),
    [arrivalElevation, arrivalAltimeter],
  );

  // === Density Altitudes ===
  const departureDensityAlt = useMemo(
    () => getDensityAlt(departurePressureAlt, departureTemperature),
    [departurePressureAlt, departureTemperature],
  );

  const cruiseDensityAlt = useMemo(
    () => getDensityAlt(cruisePressureAlt, cruiseTemperature),
    [cruisePressureAlt, cruiseTemperature],
  );

  const arrivalDensityAlt = useMemo(
    () => getDensityAlt(arrivalPressureAlt, arrivalTemperature),
    [arrivalPressureAlt, arrivalTemperature],
  );

  // === Climb & Descent ===
  const climbTAS = useMemo(
    () =>
      getClimbTAS(
        departurePressureAlt,
        cruisePressureAlt,
        departureTemperature,
        cruiseTemperature,
      ),
    [
      departurePressureAlt,
      cruisePressureAlt,
      departureTemperature,
      cruiseTemperature,
    ],
  );

  const descendTAS = useMemo(
    () =>
      getDescendTAS(
        cruisePressureAlt,
        arrivalPressureAlt,
        cruiseTemperature,
        arrivalTemperature,
      ),
    [
      cruisePressureAlt,
      arrivalPressureAlt,
      cruiseTemperature,
      arrivalTemperature,
    ],
  );

  const [climbTime, climbFuel, climbDistance] = useMemo(
    () =>
      getClimbPerformance(
        departurePressureAlt,
        cruisePressureAlt,
        departureTemperature,
        cruiseTemperature,
      ),
    [
      departurePressureAlt,
      departureTemperature,
      cruisePressureAlt,
      cruiseTemperature,
    ],
  );

  const [descendTime, descendFuel, descendDistance] = useMemo(
    () =>
      getDescendPerformance(
        cruisePressureAlt,
        arrivalPressureAlt,
        cruiseTemperature,
        arrivalTemperature,
      ),
    [
      cruisePressureAlt,
      cruiseTemperature,
      arrivalPressureAlt,
      arrivalTemperature,
    ],
  );

  const [climbRateInitial, climbRateFinal, climbRateAverage] = useMemo(
    () =>
      getClimbRates(
        departurePressureAlt,
        departureTemperature,
        cruisePressureAlt,
        cruiseTemperature,
      ),
    [
      departurePressureAlt,
      departureTemperature,
      cruisePressureAlt,
      cruiseTemperature,
    ],
  );

  // Fuel Burn is GPH (climbTime, descendTime are in minutes)
  const climbFuelBurn = climbTime > 0 ? (climbFuel / climbTime) * 60 : 0;
  const descendFuelBurn =
    descendTime > 0 ? (descendFuel / descendTime) * 60 : 0;
  const descendRate =
    descendTime > 0
      ? (toNumber(cruiseAltitude) - toNumber(arrivalElevation)) / descendTime
      : 0; // ft/min

  // === Cruise ===
  const [cruiseTAS, cruiseRPM] = useMemo(
    () =>
      getCruisePerformance(
        cruisePressureAlt,
        cruiseTemperature,
        powerSetting,
        wheelPantsRemoved,
      ),
    [cruisePressureAlt, cruiseTemperature, powerSetting, wheelPantsRemoved],
  );

  // Cruise fuel burn (GPH) derived from selected power setting
  const cruiseFuelBurnGPH = useMemo(() => {
    if (powerSetting === "75%") return 11;
    if (powerSetting === "65%") return 9.5;
    if (powerSetting === "55%") return 8.2;
    return 9.5; // default
  }, [powerSetting]);

  const cruiseCAS = useMemo(
    () =>
      calculateCalibratedAirspeed(
        cruisePressureAlt,
        cruiseTAS,
        toNumber(cruiseTemperature),
      ),
    [cruisePressureAlt, cruiseTAS, cruiseTemperature],
  );
  const cruiseIAS = useMemo(
    () => calculateIndicatedAirspeed(cruiseCAS),
    [cruiseCAS],
  );

  const [cruiseRange, cruiseRangeWithReserve] = useMemo(
    () => getCruiseRange(cruisePressureAlt, powerSetting),
    [cruisePressureAlt, powerSetting],
  );

  const [cruiseEndurance, cruiseEnduranceWithReserve] = useMemo(
    () => getCruiseEndurance(cruisePressureAlt, powerSetting),
    [cruisePressureAlt, powerSetting],
  );

  // === Export Photo ===
  const handleExportPhoto = async () => {
    if (!exportRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: "#f8fafc",
        scale: 2,
        useCORS: true,
        onclone: (doc) => {
          const view = doc.defaultView;
          doc.querySelectorAll("input, textarea").forEach((el) => {
            const value = el.value ?? "";
            const placeholder = el.getAttribute("placeholder") ?? "";
            const displayValue = value || placeholder;
            if (!view) {
              el.setAttribute("value", displayValue);
              return;
            }

            const style = view.getComputedStyle(el);
            const replacement = doc.createElement("div");
            replacement.textContent = displayValue;
            replacement.style.boxSizing = "border-box";
            replacement.style.width = style.width;
            replacement.style.height = style.height;
            replacement.style.border = style.border;
            replacement.style.borderRadius = style.borderRadius;
            replacement.style.padding = style.padding;
            replacement.style.fontFamily = style.fontFamily;
            replacement.style.fontSize = style.fontSize;
            replacement.style.fontWeight = style.fontWeight;
            replacement.style.lineHeight = style.lineHeight;
            replacement.style.color = style.color;
            replacement.style.backgroundColor = style.backgroundColor;
            replacement.style.display = "flex";
            replacement.style.alignItems = "center";
            replacement.style.justifyContent = "flex-start";
            replacement.style.overflow = "hidden";
            replacement.style.whiteSpace = "nowrap";

            el.replaceWith(replacement);
          });

          doc.querySelectorAll("select").forEach((el) => {
            const selectEl = el;
            if (selectEl.selectedIndex >= 0) {
              const option = selectEl.options[selectEl.selectedIndex];
              if (option) option.setAttribute("selected", "selected");
            }
          });
        },
      });
      const dataUrl = canvas.toDataURL("image/png");
      const fileName = `pa28-weight-balance-${new Date()
        .toISOString()
        .slice(0, 10)}.png`;

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        try {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], fileName, { type: "image/png" });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "Weight & Balance",
            });
            return;
          }
        } catch (error) {
          console.error("Share failed", error);
        }

        const newTab = window.open();
        if (newTab) {
          newTab.document.title = "Weight & Balance";
          const img = newTab.document.createElement("img");
          img.src = dataUrl;
          img.style.maxWidth = "100%";
          newTab.document.body.style.margin = "0";
          newTab.document.body.appendChild(img);
        }
      } else {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div ref={exportRef} className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">
            Piper Archer PA-28-TX Performance Profile Calculator
          </h1>
          <p className="text-sm text-slate-600">Developed by William NG.</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Performance Profile</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="p-3 font-semibold">Item</th>
                  <th className="p-3 font-semibold">Departure</th>
                  <th className="p-3 font-semibold">Cruise</th>
                  <th className="p-3 font-semibold">Arrival</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3">Elevation/Altitude (ft)</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={departureElevation}
                      onChange={(e) => setDepartureElevation(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    ></input>
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={cruiseAltitude}
                      onChange={(e) => setCruiseAltitude(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    ></input>
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={arrivalElevation}
                      onChange={(e) => setArrivalElevation(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    ></input>
                  </td>
                </tr>

                <tr>
                  <td className="p-3">Altimeter (inHg)</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={departureAltimeter}
                      onChange={(e) => setDepartureAltimeter(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    ></input>
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={cruiseAltimeter}
                      onChange={(e) => setCruiseAltimeter(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    ></input>
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={arrivalAltimeter}
                      onChange={(e) => setArrivalAltimeter(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    ></input>
                  </td>
                </tr>

                <tr>
                  <td className="p-3">Temperature (°C)</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={departureTemperature}
                      onChange={(e) => setDepartureTemperature(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={cruiseTemperature}
                      onChange={(e) => setCruiseTemperature(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={arrivalTemperature}
                      onChange={(e) => setArrivalTemperature(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    />
                  </td>
                </tr>

                <tr>
                  <td className="p-3">
                    <span
                      className="font-medium"
                      title={pressureAltFormulaText}
                    >
                      Pressure Alt (ft)
                    </span>
                    <div className="mt-1 text-xs text-slate-500 sm:hidden whitespace-pre-line">
                      {pressureAltFormulaText}
                    </div>
                  </td>
                  <td className="p-3">{fmt(departurePressureAlt, 0)}</td>
                  <td className="p-3">{fmt(cruisePressureAlt, 0)}</td>
                  <td className="p-3">{fmt(arrivalPressureAlt, 0)}</td>
                </tr>

                <tr>
                  <td className="p-3">
                    <span className="font-medium" title={densityAltFormulaText}>
                      Density Alt (ft)
                    </span>
                    <div className="mt-1 text-xs text-slate-500 sm:hidden whitespace-pre-line">
                      {densityAltFormulaText}
                    </div>
                  </td>
                  <td className="p-3">{fmt(departureDensityAlt, 0)}</td>
                  <td className="p-3">{fmt(cruiseDensityAlt, 0)}</td>
                  <td className="p-3">{fmt(arrivalDensityAlt, 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          {/* the following performance calculation based on above condition */}
          <h2 className="text-xl font-semibold">Segment Performance</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="p-3 font-semibold">Item</th>
                  <th className="p-3 font-semibold">Climb</th>
                  <th className="p-3 font-semibold">Descend</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3">True Airspeed</td>
                  <td className="p-3">
                    {fmt(climbTAS, 0)}{" "}
                    <span className="block text-xs font-normal text-slate-500">
                      CAS 78 kt
                    </span>
                  </td>
                  <td className="p-3">
                    {fmt(descendTAS, 0)}
                    <span className="block text-xs font-normal text-slate-500">
                      CAS 118 kt
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="p-3">Fuel burn (GPH)</td>
                  <td className="p-3">{fmt(climbFuelBurn, 2)}</td>
                  <td className="p-3">{fmt(descendFuelBurn, 2)}</td>
                </tr>

                <tr>
                  <td className="p-3">Rate (ft/min)</td>
                  <td className="p-3">
                    {fmt(climbRateInitial, 0)} → {fmt(climbRateFinal, 0)}{" "}
                    <span className="block text-xs font-normal text-slate-500">
                      Avg: {fmt(climbRateAverage, 0)}
                    </span>
                  </td>
                  <td className="p-3">{fmt(descendRate, 0)}</td>
                </tr>

                <tr>
                  <td className="p-3">
                    Time (min)
                    <span className="block text-xs font-normal text-slate-500">
                      Figure 5-17 &amp; 5-37
                    </span>
                  </td>
                  <td className="p-3">{fmt(climbTime, 1)}</td>
                  <td className="p-3">{fmt(descendTime, 1)}</td>
                </tr>

                <tr>
                  <td className="p-3">
                    Fuel (Gal)
                    <span className="block text-xs font-normal text-slate-500">
                      Figure 5-17 &amp; 5-37
                    </span>
                  </td>
                  <td className="p-3">{fmt(climbFuel, 2)}</td>
                  <td className="p-3">{fmt(descendFuel, 2)}</td>
                </tr>

                <tr>
                  <td className="p-3">
                    Distance (nm)
                    <span className="block text-xs font-normal text-slate-500">
                      Figure 5-17 &amp; 5-37
                    </span>
                  </td>
                  <td className="p-3">{fmt(climbDistance, 2)}</td>
                  <td className="p-3">{fmt(descendDistance, 2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h2 className="text-xl font-semibold">Cruise Performance</h2>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Power Setting
              </label>
              <select
                value={powerSetting}
                onChange={(e) => setPowerSetting(e.target.value)}
                className="w-full max-w-xs rounded border border-slate-300 px-4 py-2 text-lg"
              >
                <option value="75%">75% Power</option>
                <option value="65%">65% Power (Recommended)</option>
                <option value="55%">55% Power</option>
              </select>
              <label className="block text-sm font-medium mb-2">
                Wheel Pants Removed?
              </label>
              <input
                type="checkbox"
                checked={wheelPantsRemoved}
                onChange={(e) => setWheelPantsRemoved(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-blue-600"
              />
            </div>
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="p-4 font-semibold">Power Setting</th>
                  <th className="p-4 font-semibold">Fuel Burn (GPH)</th>
                  <th className="p-4 font-semibold">IAS (kt)</th>
                  <th className="p-4 font-semibold">CAS (kt)</th>
                  <th className="p-4 font-semibold">TAS (kt)</th>
                  <th className="p-4 font-semibold">RPM</th>
                  <th className="p-4 font-semibold">Range (nm)</th>
                  <th className="p-4 font-semibold">Endurance (hr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-slate-50">
                  <td className="p-4 font-semibold">{powerSetting}</td>
                  <td className="p-4 font-mono">{fmt(cruiseFuelBurnGPH, 1)}</td>
                  <td className="p-4 font-mono">{Math.round(cruiseIAS)}</td>
                  <td className="p-4 font-mono">{Math.round(cruiseCAS)}</td>
                  <td className="p-4 font-mono">{cruiseTAS}</td>
                  <td className="p-4 font-mono">{cruiseRPM}</td>
                  <td className="p-4 font-mono">
                    {cruiseRange} (no reserve)
                    <br />
                    {cruiseRangeWithReserve.toFixed(0)} (45 min reserve)
                  </td>
                  <td className="p-4 font-mono">
                    {cruiseEndurance.toFixed(1)} (no reserve)
                    <br />
                    {cruiseEnduranceWithReserve.toFixed(1)} (45 min reserve)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleExportPhoto}
            disabled={isExporting}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isExporting ? "Exporting…" : "Export Photo"}
          </button>
          <button
            onClick={clearAll}
            className="rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

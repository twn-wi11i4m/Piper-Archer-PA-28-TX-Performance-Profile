# Piper Archer PA-28-TX Performance Profile Calculator

A small web application for computing performance parameters of the Piper Archer PA-28-TX: pressure altitude, density altitude, climb/descent performance, cruise performance, range and endurance.

This project is intended as an educational and planning aid. Results are approximate — always verify with the official POH/AFM and current weather observations before making operational decisions.

## Features

- Compute pressure altitude and density altitude for departure, cruise and arrival.
- Estimate climb and descent TAS, time, fuel, distance and rates.
- Estimate cruise TAS, CAS, IAS, RPM, fuel burn, range and endurance by power setting.
- Export the results view as a PNG image.

## Development

Prerequisites

- Node.js (16+ recommended)
- npm (or yarn/pnpm)

Install dependencies

```bash
npm install
```

Run development server (Vite)

```bash
npm run dev
```

Build for production

```bash
npm run build
```

## Usage

1. Open the app in your browser (dev server or built site).
2. Enter departure, cruise and arrival values for elevation (ft), altimeter (inHg) and temperature (°C).
3. Choose a cruise power setting and whether wheel pants are removed.
4. Review the calculated performance tables for segment (climb/descent) and cruise performance.
5. Click "Export Photo" to save the current report as a PNG.

## Files of interest

- [src/App.jsx](src/App.jsx#L1-L400) — main UI and glue logic. Captures inputs, runs calculations and renders tables; supports PNG export.
- [src/main.jsx](src/main.jsx#L1-L200) — app bootstrap and mounting.
- [src/index.css](src/index.css#L1-L200) — base styles and Tailwind configuration.
- [src/utils/](src/utils/) — collection of calculation helpers used by the app.

Key utilities (located in `src/utils/`):

- [src/utils/get_pressure_alt.jsx](src/utils/get_pressure_alt.jsx#L1-L200) — compute pressure altitude.
- [src/utils/get_density_alt.jsx](src/utils/get_density_alt.jsx#L1-L200) — compute density altitude.
- [src/utils/get_climb_tas.jsx](src/utils/get_climb_tas.jsx#L1-L200) — climb TAS calculation.
- [src/utils/get_descend_tas.jsx](src/utils/get_descend_tas.jsx#L1-L200) — descent TAS calculation.
- [src/utils/get_climb_rates.jsx](src/utils/get_climb_rates.jsx#L1-L200) — climb rates (initial/final/avg).
- [src/utils/get_climb_performance.jsx](src/utils/get_climb_performance.jsx#L1-L200) — climb time/fuel/distance.
- [src/utils/get_descend_performance.jsx](src/utils/get_descend_performance.jsx#L1-L200) — descent time/fuel/distance.
- [src/utils/get_cruise_performance.jsx](src/utils/get_cruise_performance.jsx#L1-L200) — cruise TAS & RPM by power setting.
- [src/utils/get_cruise_range.jsx](src/utils/get_cruise_range.jsx#L1-L200) — cruise range estimates.
- [src/utils/get_cruise_endurance.jsx](src/utils/get_cruise_endurance.jsx#L1-L200) — cruise endurance estimates.
- [src/utils/get_cas.jsx](src/utils/get_cas.jsx#L1-L200) — calibrated airspeed conversion.
- [src/utils/get_ias.jsx](src/utils/get_ias.jsx#L1-L200) — indicated airspeed conversion.

## Notes & disclaimers

- This tool provides approximate calculations derived from formulas and lookup logic. It is NOT a substitute for the aircraft POH/AFM, official performance charts or approved flight planning tools.
- Always cross-check performance numbers with official sources and current meteorological data.

## Credits

- Developed by William NG.

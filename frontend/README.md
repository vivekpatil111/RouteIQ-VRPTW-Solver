# RouteIQ — Intelligent VRPTW Platform
### Frontend — React, TypeScript, Vite

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC)](https://tailwindcss.com/)

---

## Project Details

| Field               | Details                                                          |
|---------------------|------------------------------------------------------------------|
| **Project Name**    | RouteIQ — Intelligent VRPTW Platform                            |
| **Subject**         | Optimization Techniques                                          |
| **Student Name**    | Vivek N Patil                                                    |
| **Course**          | B.Tech Artificial Intelligence & Machine Learning                |
| **College**         | NMIMS Mukesh Patel School of Technology Management & Engineering |
| **Academic Year**   | 2025-26                                                          |
| **Guide/Professor** | Dr. Praveen Kumar Loharkar                                       |

---

## Overview

React + TypeScript + Vite frontend for the **RouteIQ — VRPTW Solver Comparison** project. Single-page app with Home, Solver (single algorithm), Compare (all algorithms), Datasets & BKS, and Experiment Results pages.

Uses **TanStack Query** for server state, **Zustand** for client state, and **Axios** for API calls. Route plots are backend-generated images served from the FastAPI backend.

For full project overview, run instructions, and API documentation, see the **[root README](../README.md)**. This document focuses on **frontend structure, routes, components, hooks, stores, environment, and reusability**.

---

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Routes & Pages](#routes--pages)
- [Components](#components)
- [Hooks](#hooks)
- [Stores](#stores)
- [API Client](#api-client)
- [Installation & Setup](#installation--setup)
- [How to Run](#how-to-run)
- [Environment Variables](#environment-variables)
- [Code Examples](#code-examples)
- [Scripts](#scripts)
- [Keywords](#keywords)
- [Conclusion](#conclusion)

---

## Features

- **Single Algorithm Run:** Dataset and algorithm selection, parameter tuner, run/stop, live log stream (SSE), result summary and route plot
- **Compare All Algorithms:** Run HGS, ILS, ACO, SA, GLS in parallel, poll until done, results table with cost/routes/runtime/gap
- **AI Parameter Tuning:** Auto-tune algorithm parameters via Google Gemini (optional)
- **Datasets & BKS:** List datasets, fetch metadata (coordinates, BKS cost/routes), download instance or BKS files
- **Experiment Results:** Browse pre-generated test result sets and experiment summaries
- **RAG Q&A:** Ask questions about algorithms using AI-powered Retrieval Augmented Generation
- **Real-time Streaming:** SSE (Server-Sent Events) for live log streaming during algorithm execution
- **Route Visualization:** Interactive route plot with color-coded truck paths on Solomon benchmark maps

---

## Technologies Used

| Area | Technology |
|------|------------|
| **UI** | React 19, TypeScript 5.9 |
| **Build & Dev** | Vite 7 (HMR, production build) |
| **Routing** | React Router 7 |
| **Server State** | TanStack Query (React Query) |
| **Client State** | Zustand (with persist for compare result snapshot) |
| **HTTP** | Axios (base URL, timeout, optional ILS client) |
| **Styling** | Tailwind CSS 4, PostCSS, class-variance-authority (cva), tailwind-merge |
| **UI Primitives** | Radix UI (accordion, dialog, tooltip, dropdown-menu) |
| **Icons** | Lucide React |
| **Animations** | GSAP |
| **Toasts** | Sonner |
| **Tables** | TanStack Table |

---

## Project Structure

```text
frontend/
├── index.html
├── vite.config.ts
├── package.json
├── .env.example
├── public/                     # Static assets
└── src/
    ├── main.tsx                 # Entry: React root, strict mode
    ├── App.tsx                  # QueryProvider, Toaster, BrowserRouter, Routes
    ├── index.css                # Global styles, Tailwind
    ├── constants/
    │   └── algorithms.ts        # ALGO_IDS, ALGO_DISPLAY_NAMES
    ├── data/
    │   └── faqContent.ts        # FAQ content for Home page
    ├── hooks/
    │   ├── useSolveStream.ts    # SSE stream + fallback polling
    │   ├── useDatasets.ts       # TanStack Query for datasets
    │   └── useStopwatch.ts      # Elapsed time for running jobs
    ├── lib/
    │   ├── api.ts               # Axios instances, all API calls
    │   ├── utils.ts             # cn (classnames helper)
    │   ├── toast.ts             # Toast helpers
    │   └── instanceLabels.ts    # Dataset display labels
    ├── pages/
    │   ├── Home.tsx             # Landing, intro, FAQ
    │   ├── Solver.tsx           # Single-algo run page
    │   ├── Compare.tsx          # Compare all algorithms page
    │   ├── Datasets.tsx         # Datasets list and metadata
    │   ├── Results.tsx          # Experiment result sets
    │   └── ApiStatusDocumentation.tsx
    ├── components/
    │   ├── layout/
    │   │   └── AppLayout.tsx    # Header, tabs, footer
    │   ├── solver/
    │   │   ├── ParameterTuner.tsx   # Algo-specific params, AI suggest
    │   │   └── LogConsole.tsx       # Log lines + typewriter effect
    │   ├── map/
    │   │   ├── RoutePlot.tsx
    │   │   └── RoutePlotWithControls.tsx
    │   ├── common/
    │   │   ├── SectionActions.tsx
    │   │   ├── Skeleton.tsx
    │   │   └── CopyButton.tsx
    │   └── ui/
    │       ├── accordion.tsx
    │       ├── dialog.tsx
    │       ├── tooltip.tsx
    │       └── dropdown-menu.tsx
    ├── providers/
    │   └── QueryProvider.tsx
    ├── stores/
    │   ├── solverStore.ts
    │   ├── solverResultStore.ts
    │   ├── compareResultStore.ts
    │   └── persistConfig.ts
    └── types/
        └── dataset.ts
```

---

## Routes & Pages

All routes render **AppLayout**; the layout reads the current path and shows the corresponding page.

| Path | Tab | Page | Description |
|------|-----|------|-------------|
| `/` | home | Home | Landing, project intro, FAQ |
| `/solver` | solver | Solver | Single algorithm run with live logs |
| `/compare` | compare | Compare | Run all algorithms, results table |
| `/datasets` | datasets | Datasets | List datasets, metadata, download |
| `/results` | results | Results | Experiment result sets and images |
| `/api-status-documentation` | — | API Status | Health checks and endpoint docs |

---

## Components

### Layout
- **AppLayout** — Header with RouteIQ branding, tab navigation (Home, Run Algorithm, Compare All, Datasets & BKS, Experiment Results), footer with NMIMS details. Uses GSAP for content fade-in animation.

### Solver
- **ParameterTuner** — Renders algorithm-specific parameter inputs from API schema. Syncs with GET/PUT `/api/parameters/{algo}`. Optional AI suggest via Gemini.
- **LogConsole** — Displays real-time log lines with optional typewriter effect on last line while streaming.

### Map
- **RoutePlot** — Renders `<img>` from backend plot URL (`GET /api/results/{job_id}/plot`).
- **RoutePlotWithControls** — Wraps plot with refresh, copy summary, download PNG, and fullscreen dialog.

### Common
- **SectionActions** — Generic row of action buttons (Run, Reset, etc.)
- **Skeleton** — Loading placeholder
- **CopyButton** — Copy text to clipboard with toast confirmation

### UI (Radix-based)
- **accordion, dialog, tooltip, dropdown-menu** — Accessible Radix UI primitives used across all pages

---

## Hooks

- **useSolveStream** — Opens EventSource to `/api/solve/{jobId}/stream` for live log lines. Falls back to polling if SSE fails. Returns `logs`, `status`, `result`, `error`, `clear()`.
- **useDatasets** — TanStack Query hook for fetching dataset list from API.
- **useStopwatch** — Tracks elapsed seconds for running job display.

---

## Stores

- **solverStore** — `selectedDataset`, `selectedAlgo` for Solver page (not persisted)
- **solverResultStore** — Cached result and plot URL for last completed solve (persisted)
- **compareResultStore** — Latest compare result snapshot with dataset, rows, BKS info (persisted)

---

## API Client

**File:** `src/lib/api.ts`

- **Axios instances:** `api` (main backend, `VITE_API_URL`), `apiIls` (optional, `VITE_ILS_API_URL`)
- **Health:** `getHealthStatus()`, `getDetailedStatus()`
- **Datasets:** `getDatasets()`, `getDataset(name)`, download helpers
- **Solve:** `postSolve(algo, dataset, runtime?, params?)`, `postCompare(...)`, `getResult(jobId)`, `getPlotUrl(jobId)`
- **Parameters:** `getParameters(algo)`, `putParameters(algo, body)`
- **AI:** `getAiSuggest(...)`, `postAiExplain(...)`, `postAiTune(...)`, RAG status/ask
- **Test Results:** `getTestResultSets()`, `getTestResultExperiments(setId)`, `getTestResultContent(...)`

---

## Installation & Setup

**Prerequisites:** Node.js v18+, npm

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env` with your backend URL.

---

## How to Run

**Development:**

```bash
cd frontend
npm run dev
```

Opens at `http://localhost:5173`

**Production build:**

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Main backend URL (e.g. `http://localhost:8000`) |
| `VITE_ILS_API_URL` | No | ILS backend URL (e.g. `http://localhost:8001`) |
| `VITE_TEST_RESULTS_ZIP_URL` | No | Override for Results page zip download |

**Example `frontend/.env`:**

```env
VITE_API_URL=http://localhost:8000
# VITE_ILS_API_URL=http://localhost:8001
```

---

## Code Examples

### Start a solve and stream logs

```ts
import { postSolve } from "@/lib/api";
import { useSolveStream } from "@/hooks/useSolveStream";

const { job_id } = await postSolve("hgs", "r101", 120);
const { logs, status, result, clear } = useSolveStream(job_id, "hgs");
// When status === "done", result contains routes, cost, runtime
```

### Fetch datasets and parameters

```ts
import { useDatasets } from "@/hooks/useDatasets";
import { getDataset, getParameters } from "@/lib/api";

const { data: datasets } = useDatasets();
const meta = await getDataset("r101");
const params = await getParameters("aco");
```

### Compare all algorithms

```ts
import { postCompare, getCompareStatus } from "@/lib/api";

const { job_ids } = await postCompare("r101", 120, compareParams);
let jobs = await getCompareStatus(job_ids);
while (Object.values(jobs).some((j) => j.status === "running")) {
  await new Promise((r) => setTimeout(r, 2000));
  jobs = await getCompareStatus(job_ids);
}
// jobs[algo].result has routes, cost, runtime
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server at `http://localhost:5173` |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run ESLint |

---

## Keywords

VRPTW, React, TypeScript, Vite, TanStack Query, Zustand, Tailwind CSS, Radix UI, FastAPI, Vehicle Routing, Metaheuristics, Solomon Benchmark, Single-Page App, SSE, Streaming Logs, Route Visualization, Optimization Techniques.

---

## Conclusion

The RouteIQ frontend provides a complete UI for running and comparing VRPTW metaheuristic algorithms. Built as part of the **Optimization Techniques** course at **NMIMS Mukesh Patel School of Technology Management & Engineering**, it demonstrates real-world application of optimization algorithms with modern web technologies.

For backend API details and full run instructions see the [root README](../README.md).

---

**Student:** Vivek N Patil
**Course:** B.Tech Artificial Intelligence & Machine Learning
**College:** NMIMS Mukesh Patel School of Technology Management & Engineering
**Subject:** Optimization Techniques
**Guide:** Dr. Praveen Kumar Loharkar
**Academic Year:** 2025-26
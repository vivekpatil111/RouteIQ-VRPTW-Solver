# RouteIQ — Intelligent VRPTW Platform
### Vehicle Routing Problem with Time Windows Solver Comparison
### Metaheuristics | React | Python | FastAPI | RAG | AI | Optimization

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB)](https://www.python.org/)

---

## Project Details

| Field              | Details                                              |
|--------------------|------------------------------------------------------|
| **Project Name**   | RouteIQ — Intelligent VRPTW Platform                 |
| **Subject**        | Optimization Techniques                              |
| **Student Name**   | Vivek N Patil                                        |
| **Course**         | B.Tech Artificial Intelligence & Machine Learning    |
| **College**        | NMIMS Mukesh Patel School of Technology Management & Engineering |
| **Academic Year**  | 2025-26                                              |
| **Guide/Professor**| Dr. Praveen Kumar Loharkar                           |

---

## Overview

**RouteIQ** is a full-stack R&D (Research & Development) platform for solving and comparing solutions to the **Vehicle Routing Problem with Time Windows (VRPTW)** — a classic NP-hard combinatorial optimization problem.

The platform runs and benchmarks five metaheuristic algorithms:
- **HGS** — Hybrid Genetic Search
- **ILS** — Iterated Local Search
- **ACO** — Ant Colony Optimization
- **SA**  — Simulated Annealing
- **GLS** — Guided Local Search

It visualizes routes, tunes parameters, and explores Solomon benchmark datasets — with an optional AI-assisted RAG Q&A, result explanation, and parameter tuning capability powered by Google Gemini.

---

## Comparison Results — rc108 Dataset

| Algorithm | Routes | Cost   | Gap (%) | Runtime (Seconds) |
|-----------|--------|--------|---------|-------------------|
| BKS       | 11     | 1114.2 | 0.0     | -                 |
| HGS       | 11     | 1114.2 | 0.0     | 300.14            |
| GLS       | 10     | 1266.9 | 13.7    | 300.05            |
| ACO       | 11     | 1321.8 | 18.63   | 877.20            |
| SA        | 12     | 1237.6 | 11.08   | 416.81            |

> **HGS achieved a 0% gap from the Best Known Solution (BKS) — exact optimal match!**

---

## Table of Contents

- [Project Details](#project-details)
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Algorithms Explained](#algorithms-explained)
- [Prerequisites & Setup](#prerequisites--setup)
- [Environment Variables](#environment-variables)
- [How to Run](#how-to-run)
- [Backend API Endpoints](#backend-api-endpoints)
- [Keywords](#keywords)
- [Conclusion](#conclusion)
- [License](#license)

---

## Features

| Feature | Description |
|---------|-------------|
| **Run Single Algorithm** | Pick dataset, algorithm (HGS/ILS/ACO/SA/GLS), runtime, optional params; stream logs and view route plot. |
| **Compare All Algorithms** | Run all supported algorithms on one dataset; see merged results and plots. |
| **Parameter Tuning** | Auto-tune algorithm parameters via AI (optional; requires `GOOGLE_GEMINI_API_KEY`). |
| **Datasets & BKS** | List Solomon instances, download instance/BKS files, view metadata. |
| **Experiment Results** | Browse pre-generated test result sets and experiment summaries. |
| **RAG Q&A** | Ask questions about algorithms using AI-powered Retrieval Augmented Generation. |
| **Route Visualization** | Interactive route plot with color-coded truck paths on Solomon benchmark maps. |

---

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript 5.9, Vite 7, React Router 7, TanStack Query, Zustand, Tailwind CSS 4, Radix UI, GSAP, Axios |
| **Backend** | Python 3.11/3.12, FastAPI, Uvicorn, pyvrp (0.6.3 / ≥0.13), OR-Tools (GLS), pandas, Pydantic, python-dotenv |
| **AI / RAG** | Google Gemini API, LangChain, ChromaDB, sentence-transformers, HuggingFace |
| **Algorithms** | HGS (pyvrp), ILS (pyvrp ≥0.13), ACO (custom), SA (custom), GLS (OR-Tools) |

---

## Project Structure

```bash
OT PROJECT/
├── README.md
├── frontend/                   # React + Vite SPA
│   └── src/
│       ├── pages/              # Home, Solver, Compare, Datasets, Results
│       ├── components/
│       │   ├── layout/         # AppLayout (header, tabs, footer)
│       │   ├── solver/         # ParameterTuner, LogConsole
│       │   ├── map/            # RoutePlot, RoutePlotWithControls
│       │   └── ui/             # Accordion, Dialog, Tooltip, Dropdown
│       ├── hooks/              # useSolveStream, useDatasets, useStopwatch
│       ├── stores/             # Zustand state management
│       └── lib/                # api.ts, utils.ts
│
└── backend/                    # FastAPI app
    ├── app/
    │   ├── main.py             # FastAPI app, CORS, routers, RAG bootstrap
    │   ├── api/routes/         # health, datasets, algorithms, results, ai
    │   └── services/           # solver_executor, rag_service, ai_provider
    ├── aco/                    # Ant Colony Optimization
    ├── gls/                    # Guided Local Search (OR-Tools)
    ├── sa/                     # Simulated Annealing
    ├── hgs/                    # Hybrid Genetic Search (pyvrp 0.6.3)
    ├── ils/                    # Iterated Local Search (pyvrp ≥0.13)
    ├── dataset/                # Solomon .txt / .sol files
    ├── algorithm_docs/         # Markdown docs for RAG
    ├── requirements.txt
    └── requirements-rag.txt    # Optional RAG dependencies
```

---

## Algorithms Explained

### 1. HGS — Hybrid Genetic Search
Combines a genetic algorithm with local search. Maintains a population of solutions, applies crossover and mutation to create offspring, then improves them with local search. Best performer — achieves 0% gap from BKS.

### 2. ILS — Iterated Local Search
Single-solution metaheuristic that repeatedly perturbs the current solution, applies local search to improve it, and accepts or rejects the result. Implemented via pyvrp ≥0.13.

### 3. ACO — Ant Colony Optimization
Mimics ant foraging behavior. Virtual ants build routes probabilistically guided by pheromone trails (good paths) and heuristic information (distance). Pheromones evaporate over time, balancing exploration and exploitation.

### 4. SA — Simulated Annealing
Mimics metal cooling. Starts at high "temperature" allowing worse moves, then gradually cools down — converging to better solutions while escaping local optima.

### 5. GLS — Guided Local Search
Augments the objective function with penalties on features that cause the search to get stuck in local optima. Implemented via Google OR-Tools with a hierarchical objective (minimize vehicles first, then distance).

---

## Prerequisites & Setup

**Requirements:**
- Python 3.11 or 3.12
- Node.js v18+
- npm

**One-time setup:**

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install pyvrp --pre
pip install fastapi uvicorn pandas pydantic python-dotenv certifi ortools
pip install -r requirements-rag.txt   # For RAG/AI features

# Frontend
cd frontend
npm install
```

---

## Environment Variables

### Backend `backend/.env`

```env
DATASET_PATH=dataset
DEFAULT_RUNTIME=120
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend `frontend/.env`

```env
VITE_API_URL=http://localhost:8000
```

**Get Gemini API Key (Free):** [https://aistudio.google.com](https://aistudio.google.com)

---

## How to Run

**Terminal 1 — Backend:**

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: `http://localhost:8000`

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Backend API Endpoints

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Liveness check |

### Datasets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/datasets` | List all datasets |
| GET | `/api/datasets/{name}` | Get dataset metadata + BKS |
| GET | `/api/datasets/{name}/download` | Download instance file |

### Solve & Results
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/solve/{algo}` | Start solve job |
| POST | `/api/solve/compare` | Compare all algorithms |
| GET | `/api/solve/{job_id}/stream` | SSE real-time log stream |
| GET | `/api/results/{job_id}` | Get job result |
| GET | `/api/results/{job_id}/plot` | Get route visualization |

### AI & RAG
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/rag/status` | RAG availability check |
| POST | `/api/ai/ask` | Ask question via RAG |
| POST | `/api/ai/explain` | AI explanation of results |
| POST | `/api/ai/tune` | Auto-tune parameters |

---

## Keywords

VRPTW, Vehicle Routing Problem, Time Windows, Metaheuristics, Hybrid Genetic Search, HGS, Iterated Local Search, ILS, Ant Colony Optimization, ACO, Simulated Annealing, SA, Guided Local Search, GLS, Solomon Benchmark, Route Optimization, Combinatorial Optimization, NP-Hard, FastAPI, React, Vite, TypeScript, RAG, Retrieval Augmented Generation, Google Gemini, Optimization Techniques, Operations Research, Logistics.

---

## Conclusion

RouteIQ is a full-stack VRPTW comparison platform and learning resource built as part of the **Optimization Techniques** course at **NMIMS Mukesh Patel School of Technology Management & Engineering**.

Key outcomes:
- Implemented and compared 5 metaheuristic optimization algorithms
- HGS achieved exact Best Known Solution (0% gap) on Solomon benchmark
- Built real-time streaming logs, route visualization, and AI-powered RAG Q&A
- Demonstrated practical application of optimization techniques in logistics

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

**Student:** Vivek N Patil
**Course:** B.Tech Artificial Intelligence & Machine Learning
**College:** NMIMS Mukesh Patel School of Technology Management & Engineering
**Subject:** Optimization Techniques
**Guide:** Dr. Praveen Kumar Loharkar
**Academic Year:** 2025-26
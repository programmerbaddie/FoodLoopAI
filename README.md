# FoodLoop AI

> **AI-Powered Smart Food Waste Reduction and Sustainable Redistribution Ecosystem for Institutional Kitchens and Food Processing Units**

[![SIH 2026](https://img.shields.io/badge/SIH-2026-blue)](https://sih.gov.in)
[![Ministry](https://img.shields.io/badge/Ministry-MoFPI-green)](https://www.mofpi.gov.in/)
[![Problem Statement](https://img.shields.io/badge/PS-SIH26234-orange)](https://sih.gov.in)
[![Team](https://img.shields.io/badge/Team-IMPACT%20INNOVATOR-blueviolet)]()

---

## 1. Project Context & Mission

FoodLoop AI is an end-to-end operational software ecosystem designed to systematically eliminate preventable food waste across institutional kitchens (university messes, corporate pantries, hospitals) and food processing units. 

The platform implements the six-stage operational lifecycle:

$$\text{PREDICT} \longrightarrow \text{PREVENT} \longrightarrow \text{VERIFY} \longrightarrow \text{MATCH} \longrightarrow \text{REDISTRIBUTE} \longrightarrow \text{LEARN}$$

- **PREDICT**: Demand forecasting from institutional menu schedules, headcount, and consumption history.
- **PREVENT**: Batch-size and pre-prep recommendations to prevent surplus generation before cooking begins.
- **VERIFY**: FSSAI-aligned food safety validation (holding temperature, time-elapsed, sensory checklist).
- **MATCH**: Proximity- and capacity-aware allocation to verified beneficiary agencies (NGOs, shelters).
- **REDISTRIBUTE**: Courier dispatch and chain-of-custody verification.
- **LEARN**: Continuous closed-loop feedback refining demand forecasting baselines.

---

## 2. System Architecture

```
FoodLoopAI/
├── frontend/                 # React 18 + Vite + Tailwind CSS application
│   ├── src/
│   │   ├── components/       # Reusable UI components (Header, PipelineStrip, NavTabs)
│   │   ├── pages/            # Page views (OverviewPage, PlaceholderStagePage)
│   │   ├── layouts/          # Layout shells
│   │   ├── services/         # API clients (health check, future backend endpoints)
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Styling & helper utilities (cn)
│   │   ├── App.tsx           # Application root & tab routing
│   │   ├── main.tsx          # React DOM entry point
│   │   └── index.css         # Tailwind base and design tokens
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                  # Python 3.10+ FastAPI backend
│   ├── app/
│   │   ├── api/              # API routers (health check, v1 routes)
│   │   ├── core/             # Configuration & environment settings
│   │   ├── models/           # Database models (PostgreSQL models in future phases)
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Business logic services
│   │   └── main.py           # FastAPI entry point with CORS
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Sample environment variables
│
├── ml/                       # Machine learning pipeline (scikit-learn models)
├── data/                     # Data registries and consumption datasets
├── docs/                     # Architectural specifications and diagrams
├── README.md                 # Project documentation & runbook
└── .gitignore
```

---

## 3. Quickstart & Local Execution

Frontend and backend run independently as decoupled microservices.

### Prerequisites

- **Python**: 3.10 or higher
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher

---

### Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```powershell
   # Windows (PowerShell)
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
   ```bash
   # macOS / Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install minimal dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```powershell
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

5. Verify endpoints:
   - **Health Probe**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
   - **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### Frontend Setup (React + Vite)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

5. Test production compilation:
   ```bash
   npm run build
   ```

---

## 4. Phase 1 Implementation Status

- [x] Workspace inspected and cleansed of legacy project artifacts
- [x] Scalable, decoupled folder structure established
- [x] Python virtual environment configured with minimal FastAPI dependencies (`requirements.txt`)
- [x] Health check endpoint implemented (`GET /health`) with live timestamp & environment telemetry
- [x] Interactive OpenAPI / Swagger documentation enabled (`/docs`)
- [x] React + Vite + TypeScript frontend initialized with Tailwind CSS design tokens
- [x] Clean, professional FoodLoop visual identity implemented (no fake statistics, no simulated AI predictions)
- [x] Full operational lifecycle navigation shell (`PREDICT` → `PREVENT` → `VERIFY` → `MATCH` → `REDISTRIBUTE` → `LEARN`)
- [x] Real-time backend probe integrated into frontend header & diagnostics view

---

## 5. Development Principles

1. **Anti-Slop**: No simulated metrics ("30% waste reduced", "95% accuracy"). All metrics must stem from real data or explicitly state their phase status.
2. **Explainability**: Machine learning pipelines will prioritize explainable statistical and regression methods before considering complex black-box architectures.
3. **Decoupled Architecture**: Frontend and backend are strictly separated with well-defined Pydantic and TypeScript data contracts.

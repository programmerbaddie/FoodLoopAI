# AGENTS.md — Antigravity Assistant Instructions for FoodLoop AI

## Project Identity & Problem Statement

- **Project**: FoodLoop AI
- **Problem Statement ID**: SIH26234
- **Title**: AI-Powered Smart Food Waste Reduction and Sustainable Redistribution Ecosystem for Institutional Kitchens and Food Processing Units
- **Ministry**: Ministry of Food Processing Industries (MoFPI)
- **Theme**: Agriculture, FoodTech & Rural Development
- **Category**: Software
- **Team**: IMPACT INNOVATOR

---

## Operational Loop Architecture

FoodLoop AI strictly adheres to the operational lifecycle:
$$\text{PREDICT} \longrightarrow \text{PREVENT} \longrightarrow \text{VERIFY} \longrightarrow \text{MATCH} \longrightarrow \text{REDISTRIBUTE} \longrightarrow \text{LEARN}$$

- **PREDICT**: Demand prediction from menus, attendance, and historical records.
- **PREVENT**: Surplus prevention through kitchen batch-size and prep recommendations.
- **VERIFY**: Food safety validation (holding temperature, elapsed time, sensory checklists).
- **MATCH**: Smart recipient matching based on distance, diet requirements, and recipient capacity.
- **REDISTRIBUTE**: Logistics dispatch and pickup handoff verification.
- **LEARN**: Continuous learning and baseline feedback loop.

---

## Workspace Structure & Services

```
FoodLoopAI/
├── frontend/                 # React + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page-level components
│   │   ├── layouts/          # Layout shells
│   │   ├── services/         # API clients (FastAPI communication)
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Utilities
│   │   ├── App.tsx           # Main app shell & tabs
│   │   └── main.tsx          # React DOM entry
│   └── package.json
├── backend/                  # Python 3.10+ FastAPI backend
│   ├── app/
│   │   ├── api/              # API routers (GET /health, /api/v1/...)
│   │   ├── core/             # Configuration & security
│   │   ├── models/           # Database models (PostgreSQL)
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── main.py           # FastAPI entry point with CORS
│   └── requirements.txt
├── ml/                       # Scikit-learn / pandas data pipelines
├── data/                     # Raw & processed data registries
├── docs/                     # Architectural specifications
├── README.md
└── .gitignore
```

---

## Design System & Style Guidelines

- **Clean white/light background**: `#F8FAFC` canvas, crisp white surfaces (`#FFFFFF`).
- **Dark blue primary text**: `#0F1E36` (high contrast, readable).
- **FoodLoop green as primary accent**: `#15803D` / `#16A34A` (growth, sustainability, safety).
- **Very limited orange**: `#EA580C` for urgency, critical alerts, and phase tags.
- **Tone**: Professional, modern, operational, technical but easy to understand.
- **Generous whitespace**: Clean margins and padding; avoid cluttered cards.
- **Zero AI Slop**:
  - No fake stats ("30% waste reduced", "95% accuracy").
  - No fake machine learning predictions that look like real results.
  - No decorative neon glows, glassmorphism, or stock-photo cards.
  - Operational reality: clearly communicate current implementation phase.

---

## Development Commands

- **Backend**:
  ```powershell
  & "backend\.venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  ```
- **Frontend**:
  ```powershell
  cd frontend
  npm run dev
  ```
- **Frontend Build**:
  ```powershell
  cd frontend
  npm run build
  ```

# FoodLoop AI — Production Deployment Guide

This guide documents the production deployment architecture, step-by-step setup instructions, environment configurations, and verification procedures for the FoodLoop AI platform.

---

## 1. Deployment Architecture

FoodLoop AI adopts a decoupled, modern cloud deployment architecture:

```
┌────────────────────────────────────────────────────────┐
│                   Vercel Edge Network                   │
│         Frontend: https://food-loop-ai.vercel.app      │
│         (React 18 + Vite + TypeScript + Tailwind)      │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST API
                            │ (CORS Allowed Origin)
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Render Cloud Platform                 │
│              Backend: FastAPI Web Service              │
│            Host: 0.0.0.0  |  Port: $PORT               │
│          Endpoints: /health, /docs, /api/v1/*          │
└────────────────────────────────────────────────────────┘
```

- **Frontend**: Hosted on [Vercel](https://vercel.com) (`https://food-loop-ai.vercel.app`), serving compiled static assets over a global CDN.
- **Backend**: Hosted on [Render](https://render.com) (or compatible container/PaaS provider) as a Python Web Service running FastAPI via Uvicorn.
- **State & Data Store**: Phase 8 operates with the verified in-memory service layer and validation pipelines. Persistent PostgreSQL database and authentication are scheduled for subsequent architectural phases.

---

## 2. Render Web Service Configuration

Follow these steps to deploy the FastAPI backend on Render:

### Step 1: Create a New Web Service
1. Sign in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Connect the GitHub repository: `programmerbaddie/FoodLoopAI`.

### Step 2: Configure Service Settings
Specify the following service parameters:

| Field | Value | Notes |
|---|---|---|
| **Name** | `foodloop-api` (or preferred name) | Determines your `*.onrender.com` URL |
| **Region** | Singapore / Frankfurt / Oregon | Choose closest to your target users |
| **Branch** | `main` | Automatic deployments on push to `main` |
| **Root Directory** | `backend` | **Crucial**: Points build and runtime to the `backend/` directory |
| **Runtime** | `Python 3` | Python 3.10+ runtime |
| **Build Command** | `pip install -r requirements.txt` | Installs FastAPI, Uvicorn, Pydantic, python-dotenv |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` | Dynamically binds to Render's allocated `$PORT` |
| **Plan** | Free or Starter | Free tier sleeps after inactivity; Starter remains hot |

### Step 3: Configure Environment Variables
In the Render service **Environment** tab, set the following variables:

| Key | Recommended Value | Purpose |
|---|---|---|
| `ENVIRONMENT` | `production` | Enables production security mode and logging context |
| `FRONTEND_ORIGIN` | `https://food-loop-ai.vercel.app` | Authorizes the Vercel production frontend origin |
| `ALLOWED_ORIGINS` | *(Optional, see CORS below)* | Comma-separated list of additional allowed origins |
| `PYTHONUNBUFFERED` | `1` | Ensures immediate stdout log delivery to Render console |

> [!NOTE]
> Do NOT set `PORT` manually in the Render dashboard. Render assigns and injects the `$PORT` environment variable automatically at container startup.

### Step 4: Health Check Configuration
In the **Advanced** settings on Render:
- **Health Check Path**: `/health`
- Render uses this endpoint to confirm container readiness during rolling zero-downtime deploys.

---

## 3. CORS & Security Policy

FoodLoop AI strictly rejects wildcard `allow_origins=["*"]` in production. Cross-Origin Resource Sharing is controlled via `backend/app/core/config.py`:

### Default Allowed Origins
- `https://food-loop-ai.vercel.app` (Production Vercel frontend)
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173` (Vite loopback)
- `http://localhost:3000` (Alternative local dev port)

### Custom Allowed Origins
Additional origins can be configured via:
- `FRONTEND_ORIGIN`: Single URL string (e.g., custom production domain `https://app.foodloop.org`).
- `ALLOWED_ORIGINS`: Comma-separated list or JSON array (e.g., `https://preview-1.foodloop.vercel.app,https://staging.foodloop.org`).

---

## 4. Vercel Frontend Configuration

Once the Render backend is provisioned and deployed, link the Vercel frontend to the live backend:

1. Open your project on the [Vercel Dashboard](https://vercel.com).
2. Navigate to **Settings** > **Environment Variables**.
3. Add or update the variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://<your-render-service-name>.onrender.com` (e.g., `https://foodloop-api.onrender.com`)
   - **Target**: Production, Preview, Development
4. Trigger a new deployment (or redeploy the latest commit) on Vercel so the frontend build bakes in the new environment variable.

### Local Development Fallback
When running locally without `.env`:
- Vite defaults `VITE_API_BASE_URL` to `http://127.0.0.1:8000`.
- The frontend gracefully falls back to local FastAPI development automatically.

---

## 5. Deployment Verification Checklist

### A. Backend Verification
After deployment finishes on Render:

1. **Root Status Check**:
   ```bash
   curl -s https://<your-render-service-name>.onrender.com/
   ```
   *Expected Response*:
   ```json
   {
     "service": "FoodLoop AI Backend",
     "version": "0.1.0",
     "status": "online",
     "documentation": "/docs",
     "health_check": "/health",
     "environment": "production",
     "loop_stages": [
       "PREDICT",
       "PREVENT",
       "VERIFY",
       "MATCH",
       "REDISTRIBUTE",
       "TRACK",
       "LEARN"
     ]
   }
   ```

2. **Health Probe**:
   ```bash
   curl -s https://<your-render-service-name>.onrender.com/health
   ```
   *Expected Response*:
   ```json
   {
     "status": "ok",
     "service": "FoodLoop AI Backend",
     "version": "0.1.0",
     "environment": "production"
   }
   ```

3. **Interactive Swagger Documentation**:
   - Visit `https://<your-render-service-name>.onrender.com/docs` in your browser.
   - Confirm all operational endpoints are listed:
     - `/api/v1/overview/*`
     - `/api/v1/demand/*`
     - `/api/v1/surplus/*`
     - `/api/v1/matching/*`
     - `/api/v1/redistribution/*`
     - `/api/v1/impact/*`
     - `/api/v1/learning/*`

4. **CORS Header Validation**:
   ```bash
   curl -I -X OPTIONS https://<your-render-service-name>.onrender.com/health \
     -H "Origin: https://food-loop-ai.vercel.app" \
     -H "Access-Control-Request-Method: GET"
   ```
   *Expected Header*:
   ```
   Access-Control-Allow-Origin: https://food-loop-ai.vercel.app
   ```

### B. Frontend Verification
1. Open `https://food-loop-ai.vercel.app` in your browser.
2. Open Browser Developer Tools (`F12` > Console & Network tabs).
3. Verify that requests to `/api/v1/overview/metrics` and other tabs resolve with `200 OK` from the Render URL without CORS errors.
4. On the Overview page, click the **Interactive API Docs** link and verify it navigates to `https://<your-render-service-name>.onrender.com/docs`.

---

## 6. Deployment Readiness Status

> [!IMPORTANT]
> **Status**: **READY FOR DEPLOYMENT**  
> The codebase, configuration templates, CORS rules, startup bindings, and environment handlers are fully prepared and tested for cloud deployment.  
> The backend has **not** been pushed to live Render infrastructure in this development step; manual/automated creation of the Render service using the instructions above completes live provisioning.

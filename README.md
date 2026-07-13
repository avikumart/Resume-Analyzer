# Smart Resume & Job Match Analyzer

AI-powered resume analysis using Cerebras, FastAPI, Next.js, and Supabase.

## Architecture

```text
Browser
  -> Next.js frontend (Vercel project: frontend)
       -> same-origin /api/* rewrite
            -> FastAPI backend (Vercel project: backend)
                 -> Cerebras API
                 -> Supabase PostgreSQL (service-role access)
```

The frontend and backend are two independent Vercel projects from this one repository. The browser calls the frontend's `/api` path, and Next.js proxies it using the server-only `BACKEND_URL`. This avoids hard-coded deployment URLs and prevents production CORS drift.

```text
Resume-Analyzer/
├── .github/workflows/
│   ├── ci.yml
│   ├── deploy-backend.yml
│   ├── deploy-frontend.yml
│   └── deploy-database.yml
├── backend/
│   ├── main.py                  # FastAPI application and routes
│   ├── env.py                   # Environment loading and CORS configuration
│   ├── models/schemas.py        # Pydantic response models
│   ├── services/
│   │   ├── llm_service.py       # Cerebras analysis
│   │   └── db_service.py        # Server-side Supabase access
│   ├── utils/parser.py          # PDF, DOCX, and TXT extraction
│   ├── requirements.txt
│   └── vercel.json
├── frontend/
│   ├── src/pages/index.tsx
│   ├── src/components/
│   ├── src/utils/api.ts
│   ├── next.config.js           # /api proxy
│   ├── package.json
│   └── vercel.json
└── supabase/
    ├── config.toml
    └── migrations/              # Canonical database schema history
```

## Local development

Prerequisites: Python 3.12, Node.js 22, a Cerebras API key, and a Supabase project.

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python main.py
```

The API is available at `http://localhost:8000`; Swagger is at `http://localhost:8000/docs`.

Frontend:

```bash
cd frontend
npm ci
cp .env.local.example .env.local
npm run dev
```

The app is available at `http://localhost:3000`. With `BACKEND_URL=http://localhost:8000`, frontend requests use the same `/api` proxy used in production.

## Environment variables

Backend Vercel project:

| Variable | Required | Purpose |
|---|---:|---|
| `CEREBRAS_API_KEY` | Yes | Server-side Cerebras credential |
| `CEREBRAS_MODEL` | No | Defaults to the production model `gpt-oss-120b` |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Service-role key; never expose to the frontend |
| `ENVIRONMENT` | Yes | Set to `production` on Vercel |
| `CORS_ORIGINS` | No | Comma-separated direct browser origins, if direct API calls are enabled |

Frontend Vercel project:

| Variable | Required | Purpose |
|---|---:|---|
| `BACKEND_URL` | Yes | Production backend URL, such as `https://resume-analyzer-api.vercel.app` |
| `NEXT_PUBLIC_API_URL` | No | Direct browser API override; normally leave unset |

Supabase keys are not needed in the browser in the current architecture. The frontend must never receive `SUPABASE_SERVICE_KEY`.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the one-time Vercel, Supabase, and GitHub setup. Production deployments are path-isolated:

- `backend/**` deploys only the backend Vercel project.
- `frontend/**` deploys only the frontend Vercel project.
- `supabase/migrations/**` applies only database migrations.
- Pull requests and pushes to `main` run backend import/compile checks and a frontend type-check/build.

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check; does not require external credentials |
| `POST` | `/api/analyze/` | Upload a PDF, DOCX, or TXT resume plus `job_description` |
| `GET` | `/api/analyze/history` | List analysis summaries |
| `GET` | `/api/analyze/{id}` | Fetch an analysis result (raw resume and JD are excluded) |

`POST /api/analyze/` accepts `multipart/form-data` fields `resume` and `job_description`.

## Database and security notes

The canonical schema is the timestamped SQL in `supabase/migrations`. Browser roles have no privileges on `analyses`; only the backend service role accesses the table. Row-level security is enabled for future Supabase Auth integration.

The current API itself has no user authentication. Before exposing analysis history to untrusted users, add authentication and scope backend reads by `user_id`. Raw resume and job-description text are deliberately omitted from the GET response, but are stored for analysis persistence.

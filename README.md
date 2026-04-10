# Resume-Analyzer
# Smart Resume & Job Match Analyzer

AI-powered resume analysis using **Cerebras LLM** (llama-4-scout), **FastAPI**, **Next.js**, and **Supabase**.

---

## Project Structure

```
smart-resume/
├── backend/
│   ├── main.py                  # FastAPI entrypoint
│   ├── config.py                # Settings via pydantic-settings
│   ├── requirements.txt
│   ├── supabase_schema.sql      # Run once in Supabase SQL editor
│   ├── routers/
│   │   └── analysis.py          # POST /api/analyze/, GET /history, GET /:id
│   ├── services/
│   │   ├── llm_service.py       # Cerebras inference + structured output
│   │   └── db_service.py        # Supabase read/write
│   ├── models/
│   │   └── schemas.py           # Pydantic request/response models
│   └── utils/
│       └── parser.py            # PDF / DOCX / TXT text extraction
└── frontend/
    ├── package.json
    ├── src/
    │   ├── pages/index.tsx      # Main page
    │   ├── components/
    │   │   ├── UploadForm.tsx   # Drag-and-drop resume uploader
    │   │   └── ResultsDashboard.tsx  # Score ring + gaps + rewrites
    │   └── utils/api.ts         # Axios API client + TypeScript types
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- [Cerebras API key](https://cloud.cerebras.ai)
- [Supabase project](https://supabase.com) (free tier works)

---

## Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and fill in CEREBRAS_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY

# Set up Supabase schema
# → Open your Supabase project → SQL Editor → paste supabase_schema.sql → Run

# Start the server
python main.py
# API available at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

---

## Frontend Setup

```bash
cd frontend

npm install

cp .env.local.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

npm run dev
# App available at http://localhost:3000
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze/` | Upload resume + JD → returns full analysis |
| `GET` | `/api/analyze/history` | List user's past analyses |
| `GET` | `/api/analyze/{id}` | Fetch a specific analysis |
| `GET` | `/health` | Health check |

### POST `/api/analyze/` — multipart/form-data

| Field | Type | Notes |
|-------|------|-------|
| `resume` | File | PDF, DOCX, or TXT |
| `job_description` | string | Full JD text |

### Response shape

```json
{
  "id": "uuid",
  "match_score": 78.5,
  "matched_skills": ["Python", "FastAPI", "RAG"],
  "missing_skills": [
    { "skill": "Kubernetes", "importance": "critical" },
    { "skill": "Go", "importance": "recommended" }
  ],
  "bullet_suggestions": [
    {
      "original": "Built REST APIs",
      "rewritten": "Architected and deployed 12 production REST APIs using FastAPI, reducing p99 latency by 40%",
      "section": "experience"
    }
  ],
  "summary": "Strong backend match at 78%. Critical gap is Kubernetes experience — consider adding a side project. Resume language is passive; the rewrites above bring measurable impact language inline with the JD."
}
```

---

## Supabase Setup Checklist

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste `supabase_schema.sql` → **Run**
3. Go to **Settings → API**:
   - Copy **Project URL** → `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **service_role key** → `SUPABASE_SERVICE_KEY` (backend only, never expose to client)
   - Copy **anon key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend)
4. Enable **Row Level Security** (already in schema — just verify it's on)

---

## Cerebras Setup

1. Sign up at [cloud.cerebras.ai](https://cloud.cerebras.ai)
2. Create an API key → paste into `CEREBRAS_API_KEY`
3. Default model: `llama-4-scout-17b-16e-instruct` (fastest, ~2000 tok/s)
   - Swap for `llama3.3-70b` in `config.py` for higher accuracy

---

## Next Steps / Roadmap

- [ ] Wire Supabase Auth (JWT → `get_current_user_id` dependency)
- [ ] Add streaming support for real-time LLM output via SSE
- [ ] Semantic similarity scoring with `sentence-transformers` (complement LLM score)
- [ ] Export tailored resume as DOCX download
- [ ] History page with past analyses
- [ ] Role-specific rewrite modes (SWE, PM, Data Science, etc.)
- [ ] Deploy: Railway (backend) + Vercel (frontend)

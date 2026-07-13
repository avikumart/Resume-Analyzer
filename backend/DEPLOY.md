# Backend deployment

The backend is deployed as its own Vercel project with repository Root Directory `backend`. `api/index.py` exports the FastAPI application from `main.py`, and `vercel.json` routes all requests to that Vercel Function and configures its maximum duration.

Use the repository-level [deployment guide](../DEPLOYMENT.md) for Vercel project creation, required environment variables, Supabase migrations, GitHub secrets, and first-deployment order.

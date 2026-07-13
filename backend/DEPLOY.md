# Backend deployment

The backend is deployed as its own Vercel project with repository Root Directory `backend`. `main.py` is a supported FastAPI entrypoint, and `vercel.json` configures its maximum function duration.

Use the repository-level [deployment guide](../DEPLOYMENT.md) for Vercel project creation, required environment variables, Supabase migrations, GitHub secrets, and first-deployment order.

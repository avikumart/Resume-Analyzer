# Production deployment

This repository uses three independent production pipelines: Supabase migrations, the FastAPI Vercel project, and the Next.js Vercel project.

## 1. Create and initialize Supabase

1. Create a Supabase project and save its project reference, database password, project URL, and service-role key.
2. Create a Supabase personal access token for GitHub Actions.
3. Apply the initial schema either by running the database workflow after configuring its secrets or locally:

   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

Do not paste later schema changes directly into the production SQL editor. Create timestamped files under `supabase/migrations` and let `supabase db push` maintain migration history.

## 2. Create two Vercel projects

Import this GitHub repository twice:

| Project | Root Directory | Framework |
|---|---|---|
| `resume-analyzer-api` | `backend` | FastAPI/Python |
| `resume-analyzer-web` | `frontend` | Next.js |

For the backend, add the variables listed in the README and set `ENVIRONMENT=production`. For the frontend, set `BACKEND_URL` to the backend's production URL. Apply variables to Production; add Preview values only if you later add a preview deployment workflow.

Record the team/account ID and both Vercel project IDs from Project Settings. The two IDs must be different.

The repository provides GitHub Actions CD, so disable or disconnect Vercel's automatic Git deployments after the projects are created. Leaving both enabled produces duplicate deployments for every push. Manual Vercel redeploys remain available.

## 3. Configure GitHub environments and secrets

Create these GitHub environments:

- `production-backend`
- `production-frontend`
- `production-database`

Add repository or matching environment secrets:

| Secret | Used by |
|---|---|
| `VERCEL_TOKEN` | Backend and frontend deployment |
| `VERCEL_ORG_ID` | Backend and frontend deployment |
| `VERCEL_BACKEND_PROJECT_ID` | Backend deployment only |
| `VERCEL_FRONTEND_PROJECT_ID` | Frontend deployment only |
| `SUPABASE_ACCESS_TOKEN` | Database migration deployment |
| `SUPABASE_DB_PASSWORD` | Database migration deployment |
| `SUPABASE_PROJECT_ID` | Database migration deployment |

Use environment protection rules if production deploys need approval. Never store Cerebras, Supabase, or Vercel credentials in Git-tracked `.env` files.

## 4. First deployment order

1. Run **Deploy database migrations** using `workflow_dispatch`.
2. Run **Deploy backend** and verify `https://YOUR_BACKEND/health`.
3. Set the frontend Vercel project's `BACKEND_URL` to that verified backend URL.
4. Run **Deploy frontend**.
5. Upload a small TXT resume from the production frontend and verify an `analyses` row is created.

After bootstrap, pushes to `main` deploy only the changed unit. Workflow concurrency groups serialize deployments to each production target, and distinct Vercel project ID secrets prevent frontend/backend cross-deployment.

## Troubleshooting

- Frontend build says `BACKEND_URL must be set`: add it to the frontend Vercel Production environment, not GitHub.
- API returns a missing-variable error: verify the backend Vercel variables and redeploy the backend.
- Browser receives a 404 at `/api/analyze/`: confirm `BACKEND_URL` has no path suffix and points to the backend project.
- Database workflow cannot link: verify all three Supabase GitHub secrets, especially the project database password.
- Two Vercel deployments appear for one commit: Vercel Git auto-deploy is still connected in addition to GitHub Actions.

# Deploy Resume Analyzer Backend on Render

## Quick Start (5 Minutes)

### Prerequisites
- GitHub account with Resume-Analyzer repository
- Render account (free at https://render.com)
- Vercel frontend deployed

### Step 1: Configure Environment
Update `.env.example` with your Vercel frontend URL:
```
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGINS=https://your-app.vercel.app
```

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

### Step 3: Deploy on Render
1. Go to https://render.com dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: resume-analyzer-api
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 4: Add Environment Variables
In Render dashboard, add:
```
FRONTEND_URL=https://your-vercel-app.vercel.app
CORS_ORIGINS=https://your-vercel-app.vercel.app
ENVIRONMENT=production
```

### Step 5: Deploy
Click "Create Web Service" and wait 2-5 minutes. You'll get a URL like:
```
https://resume-analyzer-api.onrender.com
```

### Step 6: Update Vercel Frontend
In Vercel project settings, add environment variable:
```
REACT_APP_API_URL=https://resume-analyzer-api.onrender.com
```
Or for Vite:
```
VITE_API_URL=https://resume-analyzer-api.onrender.com
```

## Testing

### Test Health Endpoint
```bash
curl https://resume-analyzer-api.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "resume-analyzer-api",
  "timestamp": "render-instance-id"
}
```

### Test from Frontend
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://resume-analyzer-api.onrender.com';

fetch(`${API_URL}/health`)
  .then(res => res.json())
  .then(data => console.log('✅ Backend connected:', data))
  .catch(err => console.error('❌ Connection failed:', err));
```

## Key Files for Deployment

| File | Purpose |
|------|---------|
| `main.py` | FastAPI application with Render-optimized config |
| `requirements.txt` | Python dependencies |
| `.env.example` | Environment variable template |
| `render.yaml` | Render service configuration |

## Environment Variables

| Variable | Value | Notes |
|----------|-------|-------|
| FRONTEND_URL | Your Vercel URL | Used for CORS |
| CORS_ORIGINS | Same as FRONTEND_URL | Alternative CORS config |
| ENVIRONMENT | production | For logging/monitoring |
| PORT | 8000 | Set by Render automatically |
| HOST | 0.0.0.0 | Required for Render |

## API Communication Flow

```
Vercel Frontend
     ↓
CORS Middleware (validates origin)
     ↓
Render FastAPI Backend
     ↓
/api/analyze/ → Resume Analysis
/api/analyze/history → Get History
/api/analyze/{id} → Get Specific Analysis
```

## Troubleshooting

### ❌ CORS Error
**Solution**: Ensure `FRONTEND_URL` in Render environment variables matches your Vercel domain exactly.

### ❌ 502 Bad Gateway
**Solution**: Check Render logs:
- Go to Service → Logs
- Verify `requirements.txt` syntax
- Check Python version compatibility

### ❌ Service Spinning Down
**Solution**: Free plan spins down after 15 min inactivity. Upgrade to Starter ($7/month) for production.

### ❌ Connection Refused from Frontend
**Solution**: 
1. Verify API URL in frontend `.env`
2. Check Render service is running
3. Test `/health` endpoint manually

## Performance Tips

- **Minimize dependencies** in `requirements.txt`
- **Use async functions** for better concurrency
- **Enable caching headers** for responses
- **Monitor logs** for errors

## Useful Commands

```bash
# View live logs
curl https://your-render-app.onrender.com/health

# Test API endpoint
curl -X POST https://your-render-app.onrender.com/api/analyze/ \
  -F "resume=@resume.pdf" \
  -F "job_description=Data Engineer"
```

## Plan Comparison

| Aspect | Free | Starter |
|--------|------|---------|
| Cost | $0 | $7/month |
| CPU | Shared | 0.5 vCPU |
| RAM | 0.5 GB | 1 GB |
| Availability | Spins down | 24/7 |
| Use Case | Dev/Testing | Production |

## Next Steps

✅ Deploy backend on Render
✅ Test `/health` endpoint
✅ Update frontend API URL
✅ Test end-to-end communication
✅ Monitor logs for errors
✅ Consider upgrading plan for production

---
**Last Updated**: May 8, 2026
**FastAPI Version**: 0.104.1
**Python Version**: 3.11
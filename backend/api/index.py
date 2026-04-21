try:
	from backend.main import app
except ModuleNotFoundError:
	from main import app

# Vercel ASGI entrypoint
handler = app
"""Vercel ASGI entrypoint.

The application remains in ``main.py`` for local Uvicorn development. Vercel's
function configuration requires the deployed entrypoint to live under ``api``.
"""

from main import app

__all__ = ["app"]

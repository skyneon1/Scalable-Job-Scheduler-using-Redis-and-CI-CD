from app.main import app

# Vercel requires a handler variable
# This adapts FastAPI for Vercel's serverless environment
handler = app

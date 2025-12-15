# Directory Structure

```
/
├── .github/
│   └── workflows/
│       └── ci_cd.yml
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI Entry Point
│   │   ├── worker.py        # Worker Entry Point
│   │   ├── api/
│   │   │   └── routes.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py  # Mongo Connection
│   │   │   └── redis.py     # Redis Connection
│   │   ├── models/
│   │   │   └── job.py
│   │   └── services/
│   │       ├── job_service.py
│   │       ├── queue_service.py # Redis Queue Logic (Enqueue, Dequeue)
│   │       └── rate_limiter.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

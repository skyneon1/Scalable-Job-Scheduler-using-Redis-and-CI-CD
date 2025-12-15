# Redis Distributed Job Scheduler 🚀

A production-ready, fault-tolerant job scheduler built with **FastAPI**, **Redis**, **MongoDB**, and **React**.

## 🏗 Architecture

This system uses a decoupled architecture where the API handles ingestion and the Workers handle execution using Redis as the broker.

### Components
- **API Gateway (FastAPI)**: Accepts jobs, handles rate limiting, and provides WebSocket updates.
- **Worker Cluster**: Scalable python workers that consume from Redis queues.
- **Redis**: Acts as the message broker (Lists), priority queue (Sorted Sets), and Pub/Sub channel.
- **MongoDB**: Persistent storage for job metadata and history.
- **Frontend (React)**: Real-time dashboard for monitoring.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose

### Run Locally
```bash
docker-compose up --build
```

Access the dashboard at `http://localhost:3000`.
Access the API docs at `http://localhost:8000/docs`.

## 🛠 Redis Implementation Details

### 1. Priority Queues
We use multiple Redis Lists (`queue:immediate:high`, `normal`, `low`) and consume them in strict order:
```python
# Worker Logic
redis.brpop(["queue:high", "queue:normal", "queue:low"])
```

### 2. Delayed Jobs
Delayed jobs are stored in a **Sorted Set** (`queue:delayed`) with the execution timestamp as the score.
A poller moves them to the immediate queues when `score <= now`.

### 3. Distributed Locking
To prevent multiple workers from processing the same job (in case of network partitions or crashes), we use `SET NX EX`:
```python
if redis.set("lock:job:123", "worker-1", nx=True, ex=300):
    process_job()
```

### 4. Rate Limiting
Atomic counters with expiry are used:
```python
redis.incr(user_key)
redis.expire(user_key, 60)
```

## 📈 Scaling Strategy
- **Workers**: Stateless and containerized. Scale by adding more containers (or pods in K8s).
- **Redis**: Use Redis Sentinel or Cluster for high availability.
- **MongoDB**: Use Replica Sets.

## ⚠️ Failure Handling
- **Retries**: Workers catch exceptions and reschedule jobs with exponential backoff.
- **Dead Letter Queue**: After Max Retries, jobs are moved to `queue:dead_letter` for manual inspection.
- **Graceful Shutdown**: Workers finish the current task before stopping.

## 📁 Repository Structure
See [STRUCTURE.md](./STRUCTURE.md) for detailed file layout.

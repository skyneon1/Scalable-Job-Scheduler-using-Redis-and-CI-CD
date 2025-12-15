import React, { useState } from 'react';

const Documentation: React.FC = () => {
    const [activeSection, setActiveSection] = useState('overview');

    const sections = [
        { id: 'overview', title: 'Start Here', emoji: '🚀' },
        { id: 'features', title: 'Key Features', emoji: '⭐' },
        { id: 'architecture', title: 'Architecture', emoji: '🏗️' },
        { id: 'docker', title: 'Docker Strategy', emoji: '🐳' },
        { id: 'structure', title: 'Code Structure', emoji: '📂' },
        { id: 'cicd', title: 'CI/CD Pipelines', emoji: '⚙️' },
        { id: 'api', title: 'API Reference', emoji: '🔌' },
        { id: 'deployment', title: 'Deployment', emoji: '🚢' },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'overview': return (
                <div className="doc-section fade-in">
                    <h1>Introduction</h1>
                    <p className="lead">
                        The <strong>Redis Distributed Job Scheduler</strong> is a scalable, enterprise-grade solution for handling asynchronous background processing.
                        It leverages the power of Redis for high-performance queuing and MongoDB for resilient persistence.
                    </p>
                    <div className="info-box">
                        <h3>Why use this?</h3>
                        <p>Handling long-running tasks in a standard HTTP request cycle leads to timeouts and poor UX. This system offloads work to background workers, allowing your API to remain responsive.</p>
                    </div>
                </div>
            );
            case 'features': return (
                <div className="doc-section fade-in">
                    <h1>Key Features</h1>
                    <div className="feature-grid">
                        <div className="feature-card">
                            <h3>⚡ High Performance</h3>
                            <p>Powered by Redis Lists and atomic operations (<code style={{ fontSize: '0.8rem' }}>LPUSH</code>, <code style={{ fontSize: '0.8rem' }}>BRPOP</code>).</p>
                        </div>
                        <div className="feature-card">
                            <h3>🔄 Retry Logic</h3>
                            <p>Smart workers automatically retry failed jobs with exponential backoff strategies.</p>
                        </div>
                        <div className="feature-card">
                            <h3>⏰ Delayed Jobs</h3>
                            <p>Schedule jobs to run in the future using Redis Sorted Sets (<code style={{ fontSize: '0.8rem' }}>ZADD</code>).</p>
                        </div>
                        <div className="feature-card">
                            <h3>🚨 Priority Queues</h3>
                            <p>Critical tasks? Boost them to High Priority to skip the line instantly.</p>
                        </div>
                        <div className="feature-card">
                            <h3>👀 Real-time Events</h3>
                            <p>WebSockets push live updates to the dashboard as jobs change state.</p>
                        </div>
                        <div className="feature-card">
                            <h3>🛑 Cancellation</h3>
                            <p>Cancel any queued or delayed job on-the-fly before it executes.</p>
                        </div>
                    </div>
                </div>
            );
            case 'architecture': return (
                <div className="doc-section fade-in">
                    <h1>System Architecture</h1>
                    <div className="diagram-container">
                        <div className="dia-row-flex">
                            <div className="dia-node user">👤 User</div>
                            <div className="dia-arrow">⬇️</div>
                            <div className="dia-node frontend">🖥️ Frontend</div>
                            <div className="dia-arrow">⬇️</div>
                            <div className="dia-node backend">⚡ Backend API</div>
                        </div>
                        <div className="dia-branch">
                            <div className="dia-arrow-split">↙️</div>
                            <div className="dia-arrow-split">↘️</div>
                        </div>
                        <div className="dia-row-flex" style={{ gap: '4rem' }}>
                            <div className="dia-node redis">🔴 Redis</div>
                            <div className="dia-node mongo">🍃 MongoDB</div>
                        </div>
                        <div className="dia-arrow-up">⬆️ (Worker Polls)</div>
                        <div className="dia-node worker">👷 Worker</div>
                    </div>
                    <p>
                        <strong>Flow:</strong> API takes request → Saves to Mongo → Pushes ID to Redis → Worker Pops ID → Locking → Execution → Update Mongo → Pub/Sub Event → WebSocket → UI.
                    </p>
                </div>
            );
            case 'docker': return (
                <div className="doc-section fade-in">
                    <h1>🐳 Docker & Containerization</h1>
                    <p>The entire system is containerized using Docker Compose, creating an isolated network for specific services.</p>

                    <h3>Container Network</h3>
                    <div className="diagram-container" style={{ background: '#152b45' }}>
                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                            <div className="dia-node" style={{ border: '2px solid #2496ed', color: '#2496ed' }}>
                                📦 Backend (FastAPI)<br />
                                <span style={{ fontSize: '0.7rem', color: '#8b949e' }}>Port: 8000</span>
                            </div>
                            <div className="dia-node" style={{ border: '2px solid #5ed0fa', color: '#5ed0fa' }}>
                                📦 Frontend (Nginx/Vite)<br />
                                <span style={{ fontSize: '0.7rem', color: '#8b949e' }}>Port: 3000</span>
                            </div>
                        </div>
                        <div style={{ borderTop: '2px dashed #444', width: '100%', margin: '1rem 0', position: 'relative' }}>
                            <span style={{ position: 'absolute', top: '-12px', left: '45%', background: '#152b45', padding: '0 10px', color: '#aaa', fontSize: '0.8rem' }}>Internal Network</span>
                        </div>
                        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                            <div className="dia-node redis">🔴 Redis<br /><span style={{ fontSize: '0.7rem' }}>Port: 6379</span></div>
                            <div className="dia-node mongo">🍃 Mongo<br /><span style={{ fontSize: '0.7rem' }}>Port: 27017</span></div>
                            <div className="dia-node worker">👷 Worker<br /><span style={{ fontSize: '0.7rem' }}>Replica 1..N</span></div>
                        </div>
                    </div>

                    <h3>Under the Hood</h3>
                    <ul style={{ lineHeight: '1.8' }}>
                        <li><strong>Frontend:</strong> Built with Node 18 Alpine. Serves React static files.</li>
                        <li><strong>Backend:</strong> Python 3.11 Slim. Runs Uvicorn server. Exposes an API on port 8000.</li>
                        <li><strong>Worker:</strong> A separate replica of the backend image, but runs the <code>worker.py</code> entrypoint instead of the web server. This allows code reuse!</li>
                        <li><strong>Storage:</strong> Redis and MongoDB run as standard official images.</li>
                    </ul>
                </div>
            );
            case 'structure': return (
                <div className="doc-section fade-in">
                    <h1>📂 Project Structure</h1>
                    <p>Clean separation of concerns between Frontend, Backend, and Infrastructure.</p>
                    <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '8px', color: '#e2e8f0', fontFamily: 'monospace', whiteSpace: 'pre', overflowX: 'auto' }}>
                        {`.
├── .github/
│   └── workflows/ci_cd.yml   # ⚙️ GitHub Actions
├── backend/
│   ├── app/
│   │   ├── api/routes.py     # 🛣️ API Endpoints
│   │   ├── core/             # 🔌 DB & Redis Config
│   │   ├── models/           # 📝 Pydantic Models
│   │   ├── services/         # 🧠 Business Logic (Queue, etc)
│   │   ├── main.py           # 🚀 App Entry Point
│   │   └── worker.py         # 👷 Worker Entry Point
│   ├── Dockerfile            # 🐳 Python Image Config
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # 🧩 Reuseable UI (JobList, etc)
│   │   ├── pages/            # 📄 Page Views (Docs, etc)
│   │   └── App.tsx           # ⚛️ Main React Component
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml        # 🐙 Orchestration`}
                    </div>
                </div>
            );
            case 'cicd': return (
                <div className="doc-section fade-in">
                    <h1>⚙️ CI/CD Pipeline</h1>
                    <p>Automated GitHub Actions workflows ensure quality and stability.</p>

                    <div className="feature-grid">
                        <div className="feature-card">
                            <h3>1. Lint & Test</h3>
                            <p>On every push to <code>main</code>, we install Python dependencies and run <code>flake8</code> to enforce PEP8 standards.</p>
                        </div>
                        <div className="feature-card">
                            <h3>2. Docker Build</h3>
                            <p>If tests pass, we build the Docker images for both Backend and Frontend to verify they are deployable.</p>
                        </div>
                    </div>

                    <pre>{`name: CI/CD Pipeline
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pip install flake8
      - run: flake8 backend/app
  
  build:
    needs: test
    run: docker build .`}</pre>
                </div>
            );
            case 'api': return (
                <div className="doc-section fade-in">
                    <h1>API Reference</h1>
                    <div className="endpoint">
                        <span className="method post">POST</span> <code className="url">/api/jobs</code>
                        <p>Submit a new job to the queue.</p>
                        <pre>{`{
  "type": "email_task",
  "priority": 2,
  "payload": { "subject": "Hello", "body": "..." }
}`}</pre>
                    </div>

                    <div className="endpoint">
                        <span className="method post">POST</span> <code className="url">/api/jobs/JOB_ID/boost</code>
                        <p>Boosts a queued/delayed job to High Priority instantly.</p>
                    </div>

                    <div className="endpoint">
                        <span className="method delete">DELETE</span> <code className="url">/api/jobs/JOB_ID</code>
                        <p>Cancels a queued or delayed job.</p>
                    </div>
                </div>
            );
            case 'deployment': return (
                <div className="doc-section fade-in">
                    <h1>Deployment Guide</h1>

                    <h2>☁️ Vercel Only Strategy</h2>
                    <p>You requested to run <strong>everything on Vercel</strong>. We can do this by adapting the architecture to be "Serverless".</p>

                    <div className="info-box">
                        <h3>⚠️ Important Changes</h3>
                        <ul>
                            <li><strong>Database:</strong> You MUST use external managed databases (e.g., MongoDB Atlas + Upstash Redis). Vercel does not host data.</li>
                            <li><strong>Worker:</strong> Instead of a running process, we use <strong>Vercel Cron</strong> to trigger job processing every minute.</li>
                        </ul>
                    </div>

                    <div className="diagram-container">
                        <div className="dia-row-flex" style={{ gap: '2rem' }}>
                            <div className="dia-node" style={{ border: '2px solid white', background: '#000' }}>
                                ▲ Vercel Project
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>Frontend + API Functions</div>
                            </div>
                            <div className="dia-arrow">⬇️ Trigger</div>
                            <div className="dia-node" style={{ border: '2px solid #5ed0fa', color: 'white' }}>
                                ⏱️ Cron Job
                                <div style={{ fontSize: '0.8rem', color: '#ddd' }}>Calls /api/cron/process</div>
                            </div>
                        </div>
                    </div>

                    <h3>Step 1: Configuration</h3>
                    <p>We have added a <code>vercel.json</code> to the root. This tells Vercel how to build both the Python backend and React frontend.</p>

                    <h3>Step 2: External Databases</h3>
                    <p>Since Vercel is stateless, get your connection strings:</p>
                    <ul>
                        <li><a href="https://upstash.com/" target="_blank" style={{ color: 'var(--accent)' }}>Upstash Redis</a> (Serverless Redis)</li>
                        <li><a href="https://www.mongodb.com/atlas/database" target="_blank" style={{ color: 'var(--accent)' }}>MongoDB Atlas</a> (Managed Mongo)</li>
                    </ul>

                    <h3>Step 3: Deploy</h3>
                    <pre className="shell">
                        {`# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy from Root
vercel

# 3. Add Environment Variables in Vercel Dashboard
REDIS_HOST=your-upstash-url
REDIS_PORT=6379
REDIS_PASSWORD=...
MONGO_URI=mongodb+srv://...`}
                    </pre>

                    <h3>Step 4: Setup Cron</h3>
                    <p>In your <code>vercel.json</code>, you can add a cron job config to hit <code>GET /api/cron/process</code> every minute to process the queue.</p>
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="docs-layout">
            <style>{`
                .docs-layout { display: flex; gap: 2rem; max-width: 1200px; margin: 0 auto; padding: 2rem; }
                .sidebar { width: 250px; flex-shrink: 0; }
                .sidebar-menu { display: flex; flex-direction: column; gap: 0.5rem; position: sticky; top: 100px; }
                .menu-item {
                    padding: 0.8rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    color: var(--text-secondary);
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    font-weight: 500;
                }
                .menu-item:hover { background: var(--bg-secondary); color: var(--text-primary); }
                .menu-item.active { background: var(--accent); color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
                
                .content-area { flex: 1; min-height: 500px; }
                
                .doc-section h1 { font-size: 2.5rem; margin-bottom: 1.5rem; color: var(--accent); border-bottom: 2px solid var(--border); padding-bottom: 1rem; }
                .doc-section h2 { font-size: 1.8rem; margin: 2rem 0 1rem; color: var(--text-primary); }
                .doc-section h3 { font-size: 1.4rem; margin: 1.5rem 0 0.8rem; color: var(--accent); }
                .doc-section p { font-size: 1.1rem; line-height: 1.7; color: var(--text-primary); margin-bottom: 1.5rem; }
                .doc-section li { margin-bottom: 0.5rem; color: var(--text-primary); font-size: 1.05rem; }
                .info-box { background: rgba(59, 130, 246, 0.1); border-left: 4px solid var(--accent); padding: 1.5rem; border-radius: 4px; margin-bottom: 2rem; }
                
                .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
                .feature-card { background: var(--card-bg); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border); transition: transform 0.2s; }
                .feature-card:hover { transform: translateY(-5px); border-color: var(--accent); }
                .feature-card h3 { color: var(--accent); margin-top: 0; }
                
                .diagram-container { background: var(--bg-secondary); padding: 2rem; border-radius: 12px; display: flex; flex-direction: column; align-items: center; margin: 2rem 0; }
                .dia-node { padding: 1rem 2rem; border-radius: 8px; font-weight: bold; background: var(--card-bg); border: 2px solid var(--border); }
                .dia-node.user { border-color: #60a5fa; }
                .dia-node.frontend { border-color: #a78bfa; }
                .dia-node.backend { border-color: #34d399; }
                .dia-node.redis { border-color: #f87171; }
                .dia-node.worker { border-color: #fbbf24; }
                .dia-row-flex { display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; }
                
                .endpoint { background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid var(--border); }
                .method { padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: bold; font-size: 0.8rem; margin-right: 1rem; color: white; }
                .method.post { background: var(--success); }
                .method.delete { background: var(--danger); }
                .url { font-family: monospace; font-size: 1.1rem; }
                pre { background: #0f172a; color: #f8fafc; padding: 1rem; border-radius: 8px; overflow-x: auto; margin-top: 1rem; }
                
                .doc-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                .doc-table th, .doc-table td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--border); }
                .doc-table th { color: var(--accent); }
                
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in { animation: fadeIn 0.3s ease-out; }
            `}</style>

            <aside className="sidebar">
                <div className="sidebar-menu">
                    {sections.map(section => (
                        <div
                            key={section.id}
                            className={`menu-item ${activeSection === section.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(section.id)}
                        >
                            <span>{section.emoji}</span> {section.title}
                        </div>
                    ))}
                </div>
            </aside>

            <main className="content-area">
                {renderContent()}
            </main>
        </div>
    );
};

export default Documentation;

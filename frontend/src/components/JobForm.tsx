import React, { useState } from 'react';

const JobForm: React.FC = () => {
    // Form States
    const [jobType, setJobType] = useState('email_notification');
    const [userId, setUserId] = useState(`user_${Math.floor(Math.random() * 1000)}`);
    const [subject, setSubject] = useState('Weekly Analytics Report');
    const [message, setMessage] = useState('Please find attached the weekly summary of your account activity.');
    const [priority, setPriority] = useState(2);
    const [isDelayed, setIsDelayed] = useState(false);
    const [delaySeconds, setDelaySeconds] = useState(0);

    const [status, setStatus] = useState<{ type: 'success' | 'error' | '', msg: string }>({ type: '', msg: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: '', msg: '' });
        console.log("Submitting job...");

        try {
            // Construct Payload from standard fields
            const payload = {
                subject,
                message,
                timestamp: new Date().toISOString()
            };

            const body: any = {
                type: jobType,
                payload: payload,
                priority: Number(priority),
                user_id: userId,
                // Add timestamp to ensure uniqueness if needed or logical tracking
                created_at: new Date().toISOString()
            };

            if (isDelayed && delaySeconds > 0) {
                const date = new Date();
                date.setSeconds(date.getSeconds() + Number(delaySeconds));
                body.scheduled_at = date.toISOString();
            }

            console.log("Sending body:", body);

            const res = await fetch("http://localhost:8000/api/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || res.statusText);
            }

            setStatus({ type: 'success', msg: 'Job Submitted Successfully! 🚀 Check the "Real-time Events" panel.' });
        } catch (err: any) {
            console.error("Submission Error:", err);
            setStatus({ type: 'error', msg: "Error submitting job: " + (err.message || err) });
        }
    };

    return (
        <div className="card">
            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                📝 Submit New Job
            </h2>

            {status.msg && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    backgroundColor: status.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: status.type === 'success' ? '#10b981' : '#ef4444',
                    border: `1px solid ${status.type === 'success' ? '#10b981' : '#ef4444'}`
                }}>
                    {status.msg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid" style={{ gap: '1rem' }}>

                <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                    <div>
                        <label className="stat-label">Job Type</label>
                        <input
                            value={jobType}
                            onChange={e => setJobType(e.target.value)}
                            placeholder="e.g. email_notification"
                        />
                    </div>
                    <div>
                        <label className="stat-label">User ID</label>
                        <input
                            value={userId}
                            onChange={e => setUserId(e.target.value)}
                            placeholder="e.g. user_123"
                        />
                    </div>
                </div>

                <div>
                    <label className="stat-label">Subject</label>
                    <input
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="Task subject or title"
                    />
                </div>

                <div>
                    <label className="stat-label">Message / Body</label>
                    <input
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Task details..."
                    />
                </div>

                <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                    <div>
                        <label className="stat-label">Priority</label>
                        <select value={priority} onChange={e => setPriority(Number(e.target.value))}>
                            <option value={1}>Low (Background)</option>
                            <option value={2}>Normal (Standard)</option>
                            <option value={3}>High (Urgent)</option>
                        </select>
                    </div>

                    <div>
                        <label className="stat-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Execution Time</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                style={{ width: 'auto', margin: 0 }}
                                checked={isDelayed}
                                onChange={e => setIsDelayed(e.target.checked)}
                            />
                            <span>Delayed?</span>
                        </div>
                    </div>
                </div>

                {isDelayed && (
                    <div>
                        <label className="stat-label">Delay (Seconds)</label>
                        <input
                            type="number"
                            placeholder="e.g. 60"
                            value={delaySeconds}
                            onChange={e => setDelaySeconds(Number(e.target.value))}
                        />
                    </div>
                )}

                <button type="submit" style={{ marginTop: '1rem' }}>🚀 Enqueue Job</button>
            </form>
        </div>
    );
};

export default JobForm;

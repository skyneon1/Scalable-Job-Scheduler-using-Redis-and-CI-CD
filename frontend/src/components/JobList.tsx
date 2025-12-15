import React, { useEffect, useState } from 'react';
import type { Job } from '../types';

interface Props {
    events: any[]; // We pass realtime events to trigger refreshes or local updates
}

const JobList: React.FC<Props> = ({ events }) => {
    const [jobs, setJobs] = useState<Job[]>([]);

    const fetchJobs = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/jobs?limit=20");
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [events]); // Refresh list whenever an event comes in from WS

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'var(--success)';
            case 'failed': return 'var(--danger)';
            case 'active': return 'var(--accent)';
            case 'delayed': return 'var(--warning)';
            default: return 'var(--text-secondary)';
        }
    };

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>📋 Recent Jobs</h3>
                <button onClick={fetchJobs} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Refresh</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                            <th style={{ padding: '0.8rem' }}>Status</th>
                            <th style={{ padding: '0.8rem' }}>Type</th>
                            <th style={{ padding: '0.8rem' }}>User</th>
                            <th style={{ padding: '0.8rem' }}>Priority</th>
                            <th style={{ padding: '0.8rem' }}>Created</th>
                            <th style={{ padding: '0.8rem' }}>Payload</th>
                            <th style={{ padding: '0.8rem' }}>Result/Error</th>
                            <th style={{ padding: '0.8rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map(job => (
                            <tr key={job._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '0.8rem' }}>
                                    <span style={{
                                        color: getStatusColor(job.status),
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        fontSize: '0.8rem',
                                        border: `1px solid ${getStatusColor(job.status)}`,
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '12px'
                                    }}>
                                        {job.status}
                                    </span>
                                    {job.retry_count > 0 && <span style={{ fontSize: '0.7em', marginLeft: '5px' }}> (x{job.retry_count})</span>}
                                </td>
                                <td style={{ padding: '0.8rem' }}>{job.type}</td>
                                <td style={{ padding: '0.8rem' }}>{job.user_id}</td>
                                <td style={{ padding: '0.8rem' }}>
                                    {job.priority === 3 ? '🔴 High' : job.priority === 1 ? '🟢 Low' : '🔵 Normal'}
                                </td>
                                <td style={{ padding: '0.8rem', fontSize: '0.85rem' }}>
                                    {new Date(job.created_at).toLocaleTimeString()}
                                </td>
                                <td style={{ padding: '0.8rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {job.payload.subject || JSON.stringify(job.payload)}
                                </td>
                                <td style={{ padding: '0.8rem', maxWidth: '200px', color: job.error ? 'var(--danger)' : 'var(--text-secondary)' }}>
                                    {job.error ? job.error : (job.result ? JSON.stringify(job.result) : '-')}
                                </td>
                                <td style={{ padding: '0.8rem' }}>
                                    {job.status === 'failed' && (
                                        <button
                                            onClick={async () => {
                                                await fetch(`http://localhost:8000/api/jobs/${job._id}/retry`, { method: 'POST' });
                                            }}
                                            style={{ backgroundColor: 'var(--accent)', padding: '0.3rem 0.6rem', fontSize: '0.7rem', marginRight: '0.5rem' }}
                                        >
                                            Retry
                                        </button>
                                    )}
                                    {(job.status === 'queued' || job.status === 'delayed') && (
                                        <>
                                            <button
                                                onClick={async () => {
                                                    await fetch(`http://localhost:8000/api/jobs/${job._id}/boost`, { method: 'POST' });
                                                }}
                                                style={{ backgroundColor: 'var(--warning)', color: 'black', padding: '0.3rem 0.6rem', fontSize: '0.7rem', marginRight: '0.5rem', fontWeight: 'bold' }}
                                                title="Jump to front of queue"
                                            >
                                                ⚡ Boost
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Cancel this job?'))
                                                        await fetch(`http://localhost:8000/api/jobs/${job._id}`, { method: 'DELETE' });
                                                }}
                                                style={{ backgroundColor: 'var(--danger)', padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {jobs.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'gray' }}>No jobs found. Start adding some!</div>}
            </div>
        </div>
    );
};

export default JobList;

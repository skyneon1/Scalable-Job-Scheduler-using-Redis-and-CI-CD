import React from 'react';
import type { JobStats } from '../types';

interface Props {
    stats: JobStats | null;
}

const Stats: React.FC<Props> = ({ stats }) => {
    if (!stats) return <div>Loading Stats...</div>;

    return (
        <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
            <div className="card">
                <div className="stat-label">High Priority</div>
                <div className="stat-value">{stats["queue:immediate:high"] || 0}</div>
            </div>
            <div className="card">
                <div className="stat-label">Normal Priority</div>
                <div className="stat-value">{stats["queue:immediate:normal"] || 0}</div>
            </div>
            <div className="card">
                <div className="stat-label">Low Priority</div>
                <div className="stat-value">{stats["queue:immediate:low"] || 0}</div>
            </div>
            <div className="card">
                <div className="stat-label">Dead Later</div>
                <div className="stat-value" style={{ color: 'var(--danger)' }}>{stats["queue:dead_letter"] || 0}</div>
            </div>
            <div className="card">
                <div className="stat-label">Delayed</div>
                <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats["delayed"] || 0}</div>
            </div>
        </div>
    );
};

export default Stats;

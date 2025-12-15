export interface Job {
    _id: string;
    status: 'queued' | 'active' | 'completed' | 'failed' | 'delayed';
    type: string;
    payload: any;
    result?: any;
    error?: string;
    priority: 1 | 2 | 3;
    created_at: string;
    scheduled_at?: string;
    retry_count: number;
    user_id: string;
}

export interface JobStats {
    "queue:immediate:high": number;
    "queue:immediate:normal": number;
    "queue:immediate:low": number;
    "queue:dead_letter": number;
    "delayed": number;
}

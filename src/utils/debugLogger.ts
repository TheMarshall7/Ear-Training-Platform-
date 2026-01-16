/**
 * Runtime Debug Logger helper
 * Set DEBUG_ENABLED to true when you have a debug server running on port 7242
 */
const DEBUG_ENABLED = false;

const ENDPOINTS = [
    'http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',
    'http://10.0.0.99:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5'
];

export const rlog = (location: string, message: string, data: any = {}, hypothesisId?: string, runId: string = 'run1') => {
    // Early return if debug is disabled to prevent connection errors
    if (!DEBUG_ENABLED) return;

    const payload = {
        location,
        message,
        data,
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId,
        hypothesisId
    };

    ENDPOINTS.forEach(url => {
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(() => { });
    });
};

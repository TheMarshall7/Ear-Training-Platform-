import React, { useState, useEffect } from 'react';

/**
 * DebugConsole - A floating overlay to see logs on mobile devices.
 */
export const DebugConsole: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [visible, setVisible] = useState(false);
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const flag = params.get('debugConsole') === '1' || localStorage.getItem('debug_console') === '1';
        setEnabled(flag);
        if (!flag) {
            return;
        }

        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        const addLog = (type: string, ...args: any[]) => {
            const message = `[${type}] ${args.map(a => 
                typeof a === 'object' ? JSON.stringify(a) : String(a)
            ).join(' ')}`;
            setLogs(prev => [message, ...prev].slice(0, 50));
        };

        console.log = (...args) => {
            originalLog(...args);
            addLog('LOG', ...args);
        };
        console.warn = (...args) => {
            originalWarn(...args);
            addLog('WARN', ...args);
        };
        console.error = (...args) => {
            originalError(...args);
            addLog('ERR', ...args);
        };

        return () => {
            console.log = originalLog;
            console.warn = originalWarn;
            console.error = originalError;
        };
    }, []);

    if (!enabled) {
        return null;
    }

    if (!visible) {
        return (
            <button 
                onClick={() => setVisible(true)}
                className="fixed bottom-4 right-4 z-[9999] bg-black/50 text-white text-[10px] p-2 rounded-full"
            >
                DB
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-black/90 text-white p-4 overflow-y-auto font-mono text-xs">
            <div className="flex justify-between items-center mb-4 border-b border-white/20 pb-2">
                <span className="font-bold">Debug Console</span>
                <div className="flex gap-2">
                    <button onClick={() => setLogs([])} className="bg-red-500 px-2 py-1 rounded">Clear</button>
                    <button onClick={() => setVisible(false)} className="bg-blue-500 px-2 py-1 rounded">Close</button>
                </div>
            </div>
            <div className="space-y-1">
                {logs.map((log, i) => (
                    <div key={i} className="border-b border-white/10 pb-1 break-all">
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
};

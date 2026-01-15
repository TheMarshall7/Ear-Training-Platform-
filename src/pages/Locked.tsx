import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Locked: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Locked - Areo';
    }, []);

    return (
        <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-8 text-white">
            <h1 className="text-3xl font-bold mb-4">Content Locked</h1>
            <p className="text-stone-400 mb-8 max-w-md text-center">
                This content is part of the premium ear training suite.
            </p>
            <button onClick={() => navigate('/')} className="btn-primary">
                Back to Home
            </button>
        </div>
    );
};

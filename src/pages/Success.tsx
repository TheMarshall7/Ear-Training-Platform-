import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Success: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Success - NextStage Studios';
    }, []);

    return (
        <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <span className="text-4xl">🎉</span>
            </div>
            <h1 className="text-3xl font-bold text-green-800 mb-4">All Access Unlocked!</h1>
            <p className="text-green-600 mb-8 max-w-md">
                You've successfully unlocked unlimited training sessions. Go forth and master your hearing!
            </p>
            <button onClick={() => navigate('/train')} className="btn-primary bg-green-600 hover:bg-green-700 text-white">
                Start Training
            </button>
        </div>
    );
};

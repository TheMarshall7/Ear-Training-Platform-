import React, { useEffect, useState } from 'react';

interface StreakCelebrationProps {
    streak: number;
    onComplete?: () => void;
}

const STREAK_MILESTONES = [5, 10, 20, 50, 100];

export const StreakCelebration: React.FC<StreakCelebrationProps> = ({ streak, onComplete }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (STREAK_MILESTONES.includes(streak)) {
            setIsVisible(true);
            
            let msg = '';
            if (streak === 5) msg = '🔥 5 Streak!';
            else if (streak === 10) msg = '🔥🔥 10 Streak!';
            else if (streak === 20) msg = '🔥🔥🔥 20 Streak!';
            else if (streak === 50) msg = '🔥🔥🔥🔥 50 Streak!';
            else if (streak === 100) msg = '🔥🔥🔥🔥🔥 100 Streak!';
            
            setMessage(msg);

            const timer = setTimeout(() => {
                setIsVisible(false);
                onComplete?.();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [streak, onComplete]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-12 py-8 rounded-2xl shadow-2xl transform animate-bounce scale-110">
                <div className="text-6xl font-bold text-center mb-2">
                    {message}
                </div>
                <div className="text-2xl text-center opacity-90">
                    Amazing work!
                </div>
            </div>
        </div>
    );
};

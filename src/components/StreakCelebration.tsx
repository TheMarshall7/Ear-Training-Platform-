/**
 * Streak Celebration Component
 * 
 * Displays a celebration overlay when user reaches streak milestones.
 * Shows premium icons and allows tap-to-dismiss on mobile.
 */

import React, { useEffect, useState, useRef } from 'react';
import { Flame } from 'lucide-react';

interface StreakCelebrationProps {
    streak: number;
    onComplete?: () => void;
}

const STREAK_MILESTONES = [5, 10, 20, 50, 100];

export const StreakCelebration: React.FC<StreakCelebrationProps> = ({ streak, onComplete }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState('');
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleDismiss = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setIsVisible(false);
        onComplete?.();
    };

    useEffect(() => {
        if (STREAK_MILESTONES.includes(streak)) {
            setIsVisible(true);
            
            let msg = '';
            if (streak === 5) msg = '5 Streak!';
            else if (streak === 10) msg = '10 Streak!';
            else if (streak === 20) msg = '20 Streak!';
            else if (streak === 50) msg = '50 Streak!';
            else if (streak === 100) msg = '100 Streak!';
            
            setMessage(msg);

            // Longer display time: 4000ms (4 seconds) for better visibility on mobile
            timerRef.current = setTimeout(() => {
                setIsVisible(false);
                onComplete?.();
            }, 4000);

            return () => {
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }
            };
        }
    }, [streak, onComplete]);

    if (!isVisible) return null;

    // Get number of flame icons based on streak
    const flameCount = streak >= 100 ? 5 : streak >= 50 ? 4 : streak >= 20 ? 3 : streak >= 10 ? 2 : 1;

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center z-30 pointer-events-auto"
            onClick={handleDismiss}
        >
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-6 lg:px-12 lg:py-8 rounded-2xl shadow-2xl transform animate-bounce scale-110 cursor-pointer">
                <div className="flex items-center justify-center gap-2 mb-3">
                    {Array.from({ length: flameCount }).map((_, i) => (
                        <Flame key={i} className="w-8 h-8 lg:w-10 lg:h-10 fill-current" />
                    ))}
                </div>
                <div className="text-4xl lg:text-6xl font-bold text-center mb-2">
                    {message}
                </div>
                <div className="text-lg lg:text-2xl text-center opacity-90">
                    Amazing work!
                </div>
                <div className="text-xs lg:text-sm text-center opacity-75 mt-2">
                    Tap to dismiss
                </div>
            </div>
        </div>
    );
};

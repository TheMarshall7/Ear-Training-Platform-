import React, { useEffect, useState } from 'react';
import type { Achievement } from '../logic/achievements';

interface AchievementToastProps {
    achievement: Achievement | null;
    onClose: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (achievement) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for fade out
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [achievement, onClose]);

    if (!achievement || !isVisible) return null;

    return (
        <div className="fixed top-4 right-4 z-40 animate-slide-in-right pointer-events-auto">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-xl shadow-2xl max-w-sm">
                <div className="flex items-center gap-3">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                        <div className="font-bold text-lg">Achievement Unlocked!</div>
                        <div className="text-sm opacity-90">{achievement.name}</div>
                        <div className="text-xs opacity-75 mt-1">{achievement.description}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

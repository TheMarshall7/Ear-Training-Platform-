import React from 'react';
import { getXPForLevel } from '../context/GameContext';

interface ProgressMeterProps {
    current: number;
    total: number;
    streak: number;
    level?: number;
    xp?: number;
}

export const ProgressMeter: React.FC<ProgressMeterProps> = ({ 
    current, 
    total, 
    streak,
    level = 1,
    xp = 0
}) => {
    const runPercentage = Math.min(100, (current / total) * 100);
    
    // Calculate XP progress for current level
    const currentLevelXP = getXPForLevel(level);
    const nextLevelXP = getXPForLevel(level + 1);
    const xpInLevel = xp - currentLevelXP;
    const xpNeededForNext = nextLevelXP - currentLevelXP;
    const xpPercentage = xpNeededForNext > 0 ? Math.min(100, (xpInLevel / xpNeededForNext) * 100) : 100;
    
    // Calculate combo multiplier
    const getComboMultiplier = (streak: number): number => {
        if (streak >= 20) return 4;
        if (streak >= 10) return 3;
        if (streak >= 5) return 2;
        return 1;
    };
    
    const multiplier = getComboMultiplier(streak);

    return (
        <div className="w-full max-w-4xl mx-auto mb-8 lg:mb-12 px-4">
            {/* Level and XP Bar */}
            <div className="glass-card mb-6">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                        <span className="text-sm lg:text-base font-bold text-neutral-700 uppercase tracking-wider">
                            Level {level}
                        </span>
                        {multiplier > 1 && (
                            <span className="text-xs lg:text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full font-bold shadow-lg shadow-orange-500/30">
                                {multiplier}x COMBO
                            </span>
                        )}
                    </div>
                    <span className="text-xs lg:text-sm text-neutral-500 font-medium">
                        {xpInLevel} / {xpNeededForNext} XP
                    </span>
                </div>
                <div className="h-3 lg:h-4 w-full bg-white/50 rounded-full overflow-hidden border border-white/20">
                    <div
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 ease-out shadow-lg shadow-orange-500/30"
                        style={{ width: `${xpPercentage}%` }}
                    />
                </div>
            </div>
            
            {/* Run Progress */}
            <div className="glass-card">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs lg:text-sm font-semibold text-neutral-400 uppercase tracking-widest">
                        Run: {current} / {total}
                    </span>
                    <div className="flex items-center gap-2">
                        {streak > 1 && (
                            <span className={`text-orange-500 font-bold text-sm lg:text-base ${streak >= 5 ? 'animate-bounce' : ''}`}>
                                {streak} 🔥
                            </span>
                        )}
                    </div>
                </div>
                <div className="h-3 lg:h-4 w-full bg-white/50 rounded-full overflow-hidden border border-white/20">
                    <div
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 ease-out shadow-lg shadow-orange-500/30"
                        style={{ width: `${runPercentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

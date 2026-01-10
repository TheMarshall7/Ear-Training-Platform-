import React from 'react';
import type { Difficulty } from '../types/game';

interface ModeHeaderProps {
    title: string;
    difficulty: Difficulty;
    streak: number;
    runProgress: number;
    tip?: string;
}

export const ModeHeader: React.FC<ModeHeaderProps> = ({
    title,
    difficulty,
    streak,
    runProgress,
    tip
}) => {
    return (
        <div className="w-full max-w-4xl px-4 mb-6">
            <div className="flex flex-col items-center gap-4">
                <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900">{title}</h2>
                <div className="flex items-center gap-3">
                    <div className="text-xs lg:text-sm font-bold text-neutral-500 uppercase tracking-widest bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-sm">
                        {difficulty}
                    </div>
                    <div className="text-xs lg:text-sm text-neutral-500 font-medium">
                        Streak: {streak} | Round: {runProgress + 1}/10
                    </div>
                </div>
                {tip && (
                    <p className="text-xs lg:text-sm text-neutral-400 italic text-center max-w-2xl">
                        {tip}
                    </p>
                )}
            </div>
        </div>
    );
};

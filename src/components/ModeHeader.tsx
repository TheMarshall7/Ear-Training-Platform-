import React from 'react';
import type { Difficulty, GameMode } from '../types/game';

interface ModeHeaderProps {
    title: string;
    difficulty: Difficulty;
    streak: number;
    runProgress: number;
    tip?: string;
    currentMode?: GameMode;
    isDiatonicMode?: boolean;
    onToggleDiatonicMode?: () => void;
}

export const ModeHeader: React.FC<ModeHeaderProps> = ({
    title,
    difficulty,
    streak,
    runProgress,
    tip,
    currentMode,
    isDiatonicMode,
    onToggleDiatonicMode
}) => {
    const showDiatonicToggle = (currentMode === 'chord' || currentMode === 'progression') && onToggleDiatonicMode;
    
    return (
        <div className="w-full max-w-4xl px-4 mb-6">
            <div className="flex flex-col items-center gap-4">
                <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900">{title}</h2>
                <div className="flex items-center gap-3 flex-wrap justify-center">
                    <div className="text-xs lg:text-sm font-bold text-neutral-500 uppercase tracking-widest bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-sm">
                        {difficulty}
                    </div>
                    <div className="text-xs lg:text-sm text-neutral-500 font-medium">
                        Streak: {streak} | Round: {runProgress + 1}/10
                    </div>
                    {showDiatonicToggle && (
                        <button
                            onClick={onToggleDiatonicMode}
                            className={`text-xs lg:text-sm font-medium px-4 py-2 rounded-full border transition-all duration-200 ${
                                isDiatonicMode
                                    ? 'bg-orange-500 text-white border-orange-600 shadow-md'
                                    : 'bg-white/80 text-neutral-600 border-white/40 hover:bg-white hover:border-orange-300'
                            }`}
                            title={isDiatonicMode 
                                ? 'Diatonic mode ON: Same key until wrong answer' 
                                : 'Diatonic mode OFF: Key changes each question'
                            }
                        >
                            🎹 Diatonic {isDiatonicMode ? 'ON' : 'OFF'}
                        </button>
                    )}
                </div>
                {tip && (
                    <p className="text-xs lg:text-sm text-neutral-400 italic text-center max-w-2xl">
                        {tip}
                    </p>
                )}
                {showDiatonicToggle && isDiatonicMode && (
                    <p className="text-xs text-orange-600 italic text-center">
                        Same key mode: Chords stay in the same key to help learn diatonic relationships
                    </p>
                )}
            </div>
        </div>
    );
};

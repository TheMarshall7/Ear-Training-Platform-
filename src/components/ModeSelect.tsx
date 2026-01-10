import React from 'react';
import type { GameMode, Difficulty } from '../types/game';

interface ModeSelectProps {
    currentMode: GameMode;
    currentDifficulty: Difficulty;
    onSelectMode: (mode: GameMode) => void;
    onSelectDifficulty: (diff: Difficulty) => void;
    onStart: () => void;
}

export const ModeSelect: React.FC<ModeSelectProps> = ({
    currentMode,
    currentDifficulty,
    onSelectMode,
    onSelectDifficulty,
    onStart
}) => {
    return (
        <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
            <div className="glass-card">
                <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-6">Training Mode</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {(['interval', 'chord', 'progression', 'scale', 'perfectPitch', 'numberSystem', 'melody'] as GameMode[]).map(mode => {
                        const displayNames: Record<GameMode, string> = {
                            interval: 'Intervals',
                            chord: 'Chords',
                            progression: 'Progressions',
                            scale: 'Scales',
                            perfectPitch: 'Perfect Pitch',
                            numberSystem: 'Number System',
                            melody: 'Melody'
                        };
                        
                        return (
                            <button
                                key={mode}
                                onClick={() => onSelectMode(mode)}
                                className={`py-4 px-4 rounded-xl font-medium transition-all duration-300 text-xs sm:text-sm relative overflow-hidden ${currentMode === mode
                                    ? 'bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-lg scale-105'
                                    : 'bg-white/50 text-neutral-600 hover:bg-white/80 hover:scale-105 border border-white/20'
                                    }`}
                            >
                                {currentMode === mode && (
                                    <div className="absolute inset-0 bg-white/10 translate-y-0 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                )}
                                <span className="relative">
                                    {displayNames[mode]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="glass-card">
                <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-6">Difficulty</h3>
                <div className="flex gap-3">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
                        <button
                            key={diff}
                            onClick={() => onSelectDifficulty(diff)}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${currentDifficulty === diff
                                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105'
                                : 'bg-white/50 text-neutral-600 hover:bg-white/80 hover:scale-105 border border-white/20'
                                }`}
                        >
                            {currentDifficulty === diff && (
                                <div className="absolute inset-0 bg-white/20 translate-y-0 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                            )}
                            <span className="relative">
                                {diff.charAt(0).toUpperCase() + diff.slice(1)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <button 
                onClick={onStart} 
                className="btn-primary group w-full text-base lg:text-lg mt-2 relative z-10"
            >
                <span className="flex items-center justify-center gap-2 relative">
                    Start Training
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                        <path fill="currentColor" fillRule="evenodd" d="M9 6.75a.75.75 0 0 1 0-1.5h9a.75.75 0 0 1 .75.75v9a.75.75 0 0 1-1.5 0V7.81L6.53 18.53a.75.75 0 0 1-1.06-1.06L16.19 6.75z" clipRule="evenodd"></path>
                    </svg>
                </span>
            </button>
        </div>
    );
};

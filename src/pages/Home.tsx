import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../logic/GameContext';
import { ModeSelect } from '../components/ModeSelect';
import { loadInstrument } from '../audio/sampleLoader';
import { DailyChallenges } from '../components/DailyChallenge';
import { getDailyChallenges } from '../logic/dailyChallenges';
import { BrandLogo } from '../components/BrandLogo';
import { Footer } from '../components/Footer';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const { state, dispatch } = useGame();
    const [dailyChallenges, setDailyChallenges] = useState(getDailyChallenges());

    useEffect(() => {
        // Preload audio
        loadInstrument('piano');
    }, []);

    // Refresh daily challenges when component mounts or state changes
    useEffect(() => {
        setDailyChallenges(getDailyChallenges());
    }, [state.xp, state.level]);

    const handleStart = () => {
        dispatch({ type: 'RESET_RUN' });
        navigate('/train');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 relative overflow-hidden flex flex-col">
            {/* Background gradient sphere */}
            <div className="absolute -translate-x-1/2 -translate-y-1/2 animate-pulse-glow bg-gradient-to-br from-orange-400/30 via-red-500/20 to-rose-600/20 opacity-80 mix-blend-multiply w-[600px] h-[600px] rounded-full top-1/4 left-1/4 blur-3xl pointer-events-none"></div>
            <div className="absolute -translate-x-1/2 -translate-y-1/2 animate-pulse-glow bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-pink-600/20 opacity-60 mix-blend-multiply w-[500px] h-[500px] rounded-full bottom-1/4 right-1/4 blur-3xl pointer-events-none"></div>

            {/* Top Left Branding */}
            <div className="absolute top-6 left-4 lg:top-8 lg:left-8 z-50">
                <BrandLogo />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-4 lg:p-8">
                <div className="w-full max-w-5xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-12 lg:mb-16 animate-fade-in-up">
                        <div className="inline-flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-white/20 shadow-lg mb-8">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lg:w-12 lg:h-12">
                                <path d="M9 18V5l12-2v13"></path>
                                <circle cx="6" cy="18" r="3"></circle>
                                <circle cx="18" cy="16" r="3"></circle>
                            </svg>
                        </div>
                        <h1 className="text-5xl lg:text-7xl xl:text-8xl tracking-tighter leading-[0.95] mb-6 text-neutral-900">
                            <span className="font-light block">Master Your</span>
                            <span className="font-serif italic font-medium block ml-2">Ear</span>
                        </h1>
                        <p className="text-lg lg:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed font-normal">
                            The gamified path to perfect pitch. Identify intervals, chords, and progressions with instant feedback and AI-powered training.
                        </p>
                    </div>

                    {/* Daily Challenges */}
                    <div className="mb-8">
                        <DailyChallenges challenges={dailyChallenges} />
                    </div>

                    {/* Mode Selection Card */}
                    <div className="mb-8">
                        <ModeSelect
                            currentMode={state.currentMode}
                            currentDifficulty={state.difficulty}
                            onSelectMode={(mode) => dispatch({ type: 'SET_MODE', payload: mode })}
                            onSelectDifficulty={(diff) => dispatch({ type: 'SET_DIFFICULTY', payload: diff })}
                            onStart={handleStart}
                        />
                    </div>

                    {/* Stats and Resources Links */}
                    <div className="flex justify-center gap-4 flex-wrap">
                        <button
                            onClick={() => navigate('/resources')}
                            className="group flex items-center gap-3 text-neutral-500 hover:text-neutral-700 font-medium text-sm transition-all duration-300 hover:gap-4"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200/50 shadow-sm group-hover:shadow-md transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18V5l12-2v13"></path>
                                    <circle cx="6" cy="18" r="3"></circle>
                                    <circle cx="18" cy="16" r="3"></circle>
                                </svg>
                            </div>
                            <span>Resources</span>
                        </button>
                        <button
                            onClick={() => navigate('/stats')}
                            className="group flex items-center gap-3 text-neutral-500 hover:text-neutral-700 font-medium text-sm transition-all duration-300 hover:gap-4"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200/50 shadow-sm group-hover:shadow-md transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 3v18h18"></path>
                                    <path d="M18 7v10"></path>
                                    <path d="M13 10v7"></path>
                                    <path d="M8 12v5"></path>
                                </svg>
                            </div>
                            <span>View Statistics</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

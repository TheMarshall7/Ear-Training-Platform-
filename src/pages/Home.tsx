import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { ModeSelect } from '../components/ModeSelect';
import { loadInstrument } from '../audio/sampleLoader';
import { DailyChallenges } from '../components/DailyChallenge';
import { getDailyChallenges } from '../logic/dailyChallenges';
import { BrandLogo } from '../components/BrandLogo';
import { Footer } from '../components/Footer';
import { InstrumentSelector } from '../components/InstrumentSelector';
import { InstrumentOnboarding } from '../components/InstrumentOnboarding';
import { AudioEnableBanner } from '../components/AudioEnableBanner';
import { IOSSilentModeWarning } from '../components/IOSSilentModeWarning';
import logoImage from '../assets/logo.png';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const { state, dispatch } = useGame();
    const [dailyChallenges, setDailyChallenges] = useState(getDailyChallenges());

    useEffect(() => {
        // Preload current instrument
        loadInstrument(state.currentInstrument);
    }, [state.currentInstrument]);

    useEffect(() => {
        document.title = 'NextStage Studios - Master Your Musical Ear | Interactive Ear Training';
    }, []);

    const handleInstrumentChange = async (instrumentId: string) => {
        dispatch({ type: 'SET_INSTRUMENT', payload: instrumentId });
        // Preload the new instrument
        await loadInstrument(instrumentId);
    };

    // Refresh daily challenges when component mounts or state changes
    useEffect(() => {
        setDailyChallenges(getDailyChallenges());
    }, [state.xp, state.level]);

    const handleStart = () => {
        // Auto-switch from bass to guitar if entering chord-based modes
        // Bass is disabled for: chord, progression, keyFinder, numberSystem (all use chords)
        const chordBasedModes = ['chord', 'progression', 'keyFinder', 'numberSystem'];
        if (chordBasedModes.includes(state.currentMode) && state.currentInstrument === 'bass') {
            dispatch({ type: 'SET_INSTRUMENT', payload: 'guitar' });
        }
        dispatch({ type: 'RESET_RUN' });
        navigate('/train');
    };

    // Determine which instruments should be disabled based on current mode
    // Bass is disabled for chord-based modes: chord, progression, keyFinder, numberSystem
    const chordBasedModes = ['chord', 'progression', 'keyFinder', 'numberSystem'];
    const disabledInstruments = chordBasedModes.includes(state.currentMode) ? ['bass'] : [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 relative overflow-hidden flex flex-col">
            {/* Instrument Selection Onboarding Modal */}
            <InstrumentOnboarding onSelectInstrument={handleInstrumentChange} />

            {/* Background gradient sphere */}
            <div className="absolute -translate-x-1/2 -translate-y-1/2 animate-pulse-glow bg-gradient-to-br from-orange-400/30 via-red-500/20 to-rose-600/20 opacity-80 mix-blend-multiply w-[600px] h-[600px] rounded-full top-1/4 left-1/4 blur-3xl pointer-events-none"></div>
            <div className="absolute translate-x-1/2 translate-y-1/2 animate-pulse-glow bg-gradient-to-br from-orange-400/30 via-red-500/20 to-rose-600/20 opacity-80 mix-blend-multiply w-[600px] h-[600px] rounded-full bottom-1/4 right-1/4 blur-3xl pointer-events-none"></div>

            {/* Top Left Branding */}
            <div className="absolute top-6 left-4 lg:top-8 lg:left-8 z-50">
                <BrandLogo />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-4 lg:p-8 pt-24 lg:pt-8">
                <div className="w-full max-w-5xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-12 lg:mb-16 animate-fade-in-up">
                        <div className="inline-flex items-center justify-center mb-8 group">
                            <img
                                src={logoImage}
                                alt="Logo"
                                className="w-20 h-20 lg:w-24 lg:h-24 object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg drop-shadow-md"
                            />
                        </div>
                        <h1 className="text-5xl lg:text-7xl xl:text-8xl tracking-tighter leading-[0.95] mb-6 text-neutral-900">
                            <span className="font-light block">Master Your</span>
                            <span className="font-serif italic font-medium block ml-2">Ear</span>
                        </h1>
                        <p className="text-lg lg:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed font-normal">
                            The gamified path to perfect pitch. Identify intervals, chords, and progressions with instant feedback and AI-powered training.
                        </p>
                    </div>

                    {/* iOS Silent Mode Warning - Shows immediately for iOS users */}
                    <div className="mb-4">
                        <IOSSilentModeWarning />
                    </div>

                    {/* Audio Enable Banner */}
                    <div className="mb-6">
                        <AudioEnableBanner />
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
                            isPremium={state.isPremium}
                            onSelectMode={(mode) => dispatch({ type: 'SET_MODE', payload: mode })}
                            onSelectDifficulty={(diff) => dispatch({ type: 'SET_DIFFICULTY', payload: diff })}
                            onStart={handleStart}
                        />
                    </div>

                    {/* Instrument Selector */}
                    <div className="mb-8">
                        <InstrumentSelector
                            currentInstrument={state.currentInstrument}
                            onSelectInstrument={handleInstrumentChange}
                            disabledInstruments={disabledInstruments}
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
                                    <circle cx="12" cy="8" r="6"></circle>
                                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                                </svg>
                            </div>
                            <span>Achievements</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

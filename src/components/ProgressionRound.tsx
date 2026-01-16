import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { audioEngine } from '../audio/audioEngine';
import { loadInstrument, getInstrumentSampleId } from '../audio/sampleLoader';
import { getRandomBassVoicing, getRandomGuitarVoicing } from '../logic/voicing/guitarVoicing';
import { DegreeGrid } from './DegreeGrid';
import { InputChain } from './InputChain';
import { Player } from './Player';
import { ProgressMeter } from './ProgressMeter';
import { Feedback } from './Feedback';
import { ParticleEffect } from './ParticleEffect';
import { StreakCelebration } from './StreakCelebration';
import { CelebrationOverlay } from './CelebrationOverlay';
import { AchievementToast } from './AchievementToast';
import { recordAnswer, updateBestStreak, loadStats, saveStats } from '../logic/statsTracker';
import { checkAchievements, loadAchievements, type Achievement } from '../logic/achievements';
import { updateChallengeProgress, getDailyChallenges } from '../logic/dailyChallenges';
import { Footer } from './Footer';
import {
    generateProgressionQuestion,
    validateProgressionStep,
    calculatePoints,
    createProgressionRoundState,
    type ProgressionRoundState
} from '../logic/trainers/progressionTrainer';
import type { Difficulty } from '../types/game';

// Calculate combo multiplier based on streak
const getComboMultiplier = (streak: number): number => {
    if (streak >= 20) return 4;
    if (streak >= 10) return 3;
    if (streak >= 5) return 2;
    return 1;
};

interface ProgressionRoundProps {
    difficulty: Difficulty;
    streak: number;
    runProgress: number;
    level?: number;
    xp?: number;
    onCorrect: (points: number) => void;
    onWrong: () => void;
    onNext: () => void;
}

type RoundStatus = 'idle' | 'playing' | 'awaitingInput' | 'resolved';

export const ProgressionRound: React.FC<ProgressionRoundProps> = ({
    difficulty,
    streak,
    runProgress,
    level = 1,
    xp = 0,
    onCorrect,
    onWrong,
    onNext
}) => {
    const navigate = useNavigate();
    const { state } = useGame();
    const [roundState, setRoundState] = useState<ProgressionRoundState>(createProgressionRoundState());
    const [roundStatus, setRoundStatus] = useState<RoundStatus>('idle');
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [showParticles, setShowParticles] = useState(false);
    const [celebration, setCelebration] = useState<{ type: 'level-up' | 'perfect-run'; message: string; subtitle?: string } | null>(null);
    const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
    const [dailyChallenges, setDailyChallenges] = useState(getDailyChallenges());
    const roundStateRef = useRef(roundState);
    const roundStatusRef = useRef(roundStatus);
    const isPlayingRef = useRef(isPlaying);
    const hasAutoPlayedRef = useRef<string | null>(null);
    const hasInitializedRef = useRef(false);
    const lastDifficultyRef = useRef<string>('');

    // Memoize the onShowParticles callback to prevent infinite loops
    const particlesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const handleShowParticles = useCallback(() => {
        // Clear any existing timeout
        if (particlesTimeoutRef.current) {
            clearTimeout(particlesTimeoutRef.current);
        }

        setShowParticles(true);
        particlesTimeoutRef.current = setTimeout(() => {
            setShowParticles(false);
            particlesTimeoutRef.current = null;
        }, 2000); // Show particles for 2 seconds
    }, []);

    // Keep refs in sync
    useEffect(() => {
        roundStateRef.current = roundState;
    }, [roundState]);

    useEffect(() => {
        roundStatusRef.current = roundStatus;
    }, [roundStatus]);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    // Load audio sample on mount
    useEffect(() => {
        loadInstrument(state.currentInstrument);
    }, [state.currentInstrument]);

    // Initialize question
    useEffect(() => {
        // Only load question if difficulty actually changed or first init
        if (!hasInitializedRef.current || lastDifficultyRef.current !== difficulty) {
            hasInitializedRef.current = true;
            lastDifficultyRef.current = difficulty;

            setIsInitializing(true);
            setError(null);
            try {
                const question = generateProgressionQuestion(difficulty, roundState.sessionState, { streak });
                if (!question || !question.targetDegrees || question.targetDegrees.length === 0) {
                    console.error('Failed to generate valid progression question');
                    setError('Failed to generate progression. Please try again.');
                    setIsInitializing(false);
                    return;
                }

                // Validate chord specs
                const hasValidChords = question.chordSpecs.every(spec => spec.midiNotes && spec.midiNotes.length > 0);
                if (!hasValidChords) {
                    console.error('Invalid chord specs in question');
                    setError('Invalid chord data. Please try again.');
                    setIsInitializing(false);
                    return;
                }

                setRoundState(prev => ({ ...prev, question, userDegrees: [], resolvedOutcome: null, wrongAtStep: null, pointsEarned: 0 }));
                setRoundStatus('idle');
                setIsPlaying(false);
                setIsInitializing(false);
            } catch (error) {
                console.error('Error initializing progression question:', error);
                setError(error instanceof Error ? error.message : 'An error occurred while loading the progression.');
                setIsInitializing(false);
            }
        } else { }
    }, [difficulty]);

    const playProgressionRef = useRef<(() => Promise<void>) | null>(null);

    const playProgression = useCallback(async () => {
        // CRITICAL: Unlock audio SYNCHRONOUSLY FIRST
        audioEngine.ensureUnlockedSync();

        const currentState = roundStateRef.current;
        const currentStatus = roundStatusRef.current;
        const currentlyPlaying = isPlayingRef.current;

        console.log('playProgression called', {
            hasQuestion: !!currentState.question,
            isPlaying: currentlyPlaying,
            roundStatus: currentStatus
        });

        if (!currentState.question || currentlyPlaying || currentStatus === 'playing') {
            console.log('Early return from playProgression', {
                hasQuestion: !!currentState.question,
                isPlaying: currentlyPlaying,
                status: currentStatus
            });
            return;
        }

        setRoundStatus('playing');
        setIsPlaying(true);

        try {
            console.log('Initializing audio...');
            // Ensure audio context is initialized and sample is loaded
            await audioEngine.init();
            console.log('Audio context initialized');

            // Wait a bit to ensure context is ready
            await new Promise(resolve => setTimeout(resolve, 100));

            await loadInstrument(state.currentInstrument);
            console.log('Piano sample loaded');

            // Wait a bit more to ensure sample is fully loaded
            await new Promise(resolve => setTimeout(resolve, 100));

            const chordSpecs = currentState.question.chordSpecs;
            const midiChords = chordSpecs.map(spec => {
                if (state.currentInstrument === 'guitar') {
                    return getRandomGuitarVoicing(spec.midiNotes, spec.midiNotes[0]);
                }
                if (state.currentInstrument === 'bass') {
                    return getRandomBassVoicing(spec.midiNotes, spec.midiNotes[0], 'resource'); // Use resource context for higher register
                }
                return spec.midiNotes;
            });

            // Debug logging
            console.log('Playing progression:', {
                degrees: currentState.question.targetDegrees,
                chordCount: midiChords.length,
                chords: midiChords,
                chordSpecs: chordSpecs
            });

            // Verify we have chords to play
            if (midiChords.length === 0) {
                console.error('No chords to play!');
                setIsPlaying(false);
                setRoundStatus('awaitingInput');
                return;
            }

            // Verify each chord has notes
            midiChords.forEach((chord, idx) => {
                if (!chord || chord.length === 0) {
                    console.error(`Chord at index ${idx} is empty!`);
                } else {
                    console.log(`Chord ${idx}:`, chord);
                }
            });

            console.log('Calling playChordSequence with', midiChords.length, 'chords');
            const sampleId = getInstrumentSampleId(state.currentInstrument);
            audioEngine.playChordSequence(midiChords, 900, sampleId, 60);
            console.log('playChordSequence called');

            // Enable input as soon as the LAST chord starts playing
            // This allows users to answer immediately without waiting for reverb tail
            // Each chord starts at: index * 900ms
            const lastChordStartTime = (midiChords.length - 1) * 900;
            const inputEnableDelay = lastChordStartTime + 100; // Small buffer after last chord starts

            console.log(`Enabling input after ${inputEnableDelay}ms (last chord starts at ${lastChordStartTime}ms)`);
            setTimeout(() => {
                console.log('Input enabled - last chord is playing');
                setRoundStatus('awaitingInput');
            }, inputEnableDelay);

            // Keep playing state active a bit longer so replay button doesn't flash
            // But this doesn't block user input anymore
            const playingStateDuration = lastChordStartTime + 1500;
            setTimeout(() => {
                console.log('Playback animation finished');
                setIsPlaying(false);
            }, playingStateDuration);
        } catch (error) {
            console.error('Error playing progression:', error);
            setIsPlaying(false);
            setRoundStatus('awaitingInput');
        }
    }, []);

    // Store the callback in a ref so it's always available
    playProgressionRef.current = playProgression;

    // Auto-play progression when new question is loaded (with better error handling)
    useEffect(() => {
        // Don't auto-play if still initializing, no question, or already played
        if (isInitializing || !roundState.question || roundState.question.targetDegrees.length === 0) {
            return;
        }

        // Ensure we have valid chord specs before auto-playing
        const hasValidChords = roundState.question.chordSpecs &&
            roundState.question.chordSpecs.length > 0 &&
            roundState.question.chordSpecs.every(spec => spec.midiNotes && spec.midiNotes.length > 0);

        if (!hasValidChords) {
            return; // Don't auto-play if chords aren't ready
        }

        const questionKey = roundState.question.targetDegrees.join('-');
        const shouldAutoPlay = roundStatus === 'idle' &&
            !isPlaying &&
            roundState.userDegrees.length === 0 &&
            hasAutoPlayedRef.current !== questionKey;

        if (shouldAutoPlay) {
            hasAutoPlayedRef.current = questionKey;
            let isCancelled = false;

            // Longer delay to ensure audio is ready and UI is stable
            const timer = setTimeout(async () => {
                if (isCancelled) return;

                try {
                    // Double-check question is still valid
                    const currentState = roundStateRef.current;
                    if (!currentState.question || currentState.question.chordSpecs.length === 0) {
                        hasAutoPlayedRef.current = null;
                        return;
                    }

                    // Check if we're still in idle state and not playing
                    if (roundStatusRef.current !== 'idle' || isPlayingRef.current) {
                        hasAutoPlayedRef.current = null;
                        return;
                    }

                    console.log('Auto-playing progression for new question:', currentState.question.targetDegrees);
                    // Ensure audio is initialized before playing
                    await audioEngine.init();
                    // Only load instrument if not already loaded (check happens inside)
                    await loadInstrument(state.currentInstrument);
                    // Small additional delay to ensure sample is loaded
                    setTimeout(() => {
                        if (isCancelled) return;

                        const state = roundStateRef.current;
                        const status = roundStatusRef.current;
                        const playing = isPlayingRef.current;

                        // Final validation before playing
                        if (playProgressionRef.current &&
                            state.question &&
                            state.question.chordSpecs.length > 0 &&
                            status === 'idle' &&
                            !playing) {
                            playProgressionRef.current();
                        } else {
                            hasAutoPlayedRef.current = null; // Reset if question invalid
                        }
                    }, 300);
                } catch (error) {
                    console.error('Error in auto-play:', error);
                    // Don't auto-play if there's an error, let user click the button
                    hasAutoPlayedRef.current = null; // Reset so they can try again
                }
            }, 1000); // Increased delay to ensure everything is ready
            return () => {
                isCancelled = true;
                clearTimeout(timer);
            };
        }
    }, [roundState.question?.targetDegrees?.join('-'), roundStatus, isPlaying, roundState.userDegrees.length, isInitializing]);

    const handleDegreeSelect = (degree: number) => {
        const currentState = roundStateRef.current;
        const currentStatus = roundStatusRef.current;

        console.log('handleDegreeSelect called', { degree, status: currentStatus, hasQuestion: !!currentState.question });

        if (currentStatus !== 'awaitingInput' || !currentState.question) {
            console.log('Early return from handleDegreeSelect', { status: currentStatus, hasQuestion: !!currentState.question });
            return;
        }

        const newUserDegrees = [...currentState.userDegrees, degree];
        setRoundState(prev => ({ ...prev, userDegrees: newUserDegrees }));

        const validation = validateProgressionStep(
            currentState.question.targetDegrees,
            newUserDegrees
        );

        if (!validation.isValid) {
            // Wrong answer
            setRoundState(prev => ({
                ...prev,
                resolvedOutcome: 'fail',
                wrongAtStep: validation.wrongAtStep,
                pointsEarned: 0
            }));
            setRoundStatus('resolved');

            // Update stats
            let stats = loadStats();
            stats = recordAnswer(stats, false, 'progression');
            saveStats(stats);

            onWrong();
        } else if (validation.isComplete) {
            // Correct and complete
            const points = calculatePoints(difficulty, true, newUserDegrees.length);
            setRoundState(prev => ({
                ...prev,
                resolvedOutcome: 'success',
                pointsEarned: points
            }));
            setRoundStatus('resolved');

            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 100);

            // Update stats
            let stats = loadStats();
            const newStreak = streak + 1;
            const newRunProgress = runProgress + 1;
            const isPerfectRun = newRunProgress === 10;

            stats = recordAnswer(stats, true, 'progression', isPerfectRun);
            stats = updateBestStreak(stats, newStreak);
            saveStats(stats);

            // Check achievements
            const achievements = loadAchievements();
            const newlyUnlocked = checkAchievements(achievements, {
                bestStreak: stats.bestStreak,
                totalQuestions: stats.totalQuestions,
                totalCorrect: stats.totalCorrect,
                perfectRuns: stats.perfectRuns,
                modeStats: stats.modeStats,
                dailyStreak: stats.dailyStreak,
                level: level,
                currentSessionQuestions: runProgress
            });

            if (newlyUnlocked.length > 0) {
                setNewAchievement(newlyUnlocked[0]);

                // Automatically navigate to platinum gift page if Mystery Platinum Gift is unlocked
                const platinumGift = newlyUnlocked.find(ach => ach.id === 'mystery_platinum_gift');
                if (platinumGift) {
                    // Delay navigation slightly to show the toast first
                    setTimeout(() => {
                        navigate('/platinum-gift');
                    }, 2000);
                }
            }

            // Update daily challenges
            let updatedChallenges = dailyChallenges;
            const challengeUpdate1 = updateChallengeProgress(updatedChallenges, 'questions', 1);
            updatedChallenges = challengeUpdate1.challenges;

            // Check streak challenges
            updatedChallenges = updatedChallenges.map(challenge => {
                if (challenge.completed || challenge.type !== 'streak') return challenge;
                if (newStreak >= challenge.target) {
                    return { ...challenge, progress: challenge.target, completed: true };
                }
                return challenge;
            });

            // Save streak challenge updates
            if (updatedChallenges.some(c => c.type === 'streak' && !c.completed)) {
                localStorage.setItem('ear_trainer_daily_challenges', JSON.stringify(updatedChallenges));
            }

            if (isPerfectRun) {
                const challengeUpdate3 = updateChallengeProgress(updatedChallenges, 'perfect', 1);
                updatedChallenges = challengeUpdate3.challenges;
            }

            setDailyChallenges(updatedChallenges);

            // Check for perfect run celebration
            if (isPerfectRun) {
                setCelebration({
                    type: 'perfect-run',
                    message: 'Perfect Run!',
                    subtitle: '10/10 Correct!'
                });
            }

            // Apply combo multiplier to points
            const multiplier = getComboMultiplier(streak);
            const finalPoints = points * multiplier;

            onCorrect(finalPoints);
        }
        // Otherwise, continue input
    };

    const handleClear = () => {
        if (roundStatus === 'resolved') return;
        setRoundState(prev => ({ ...prev, userDegrees: [] }));
    };

    const handleNext = () => {
        if (roundStatus !== 'resolved') return;
        // Reset for next round
        const newQuestion = generateProgressionQuestion(difficulty, roundState.sessionState, { streak });
        setRoundState(prev => ({
            ...prev,
            question: newQuestion,
            userDegrees: [],
            resolvedOutcome: null,
            wrongAtStep: null,
            pointsEarned: 0
        }));
        setRoundStatus('idle');
        setIsPlaying(false);
        onNext();
    };

    const handleReplay = () => {
        if (roundStatus === 'playing') return;
        playProgression();
    };

    // Show loading state
    if (isInitializing) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg text-neutral-600 mb-2">Loading progression...</div>
                    <div className="text-sm text-neutral-400">Generating chord progression</div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error || !roundState.question) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="text-lg text-red-600 mb-2">Error loading progression</div>
                    <div className="text-sm text-neutral-500 mb-4">{error || 'Failed to load progression'}</div>
                    <button
                        onClick={() => {
                            setError(null);
                            setIsInitializing(true);
                            try {
                                const newQuestion = generateProgressionQuestion(difficulty, roundState.sessionState, { streak });
                                if (newQuestion && newQuestion.targetDegrees && newQuestion.targetDegrees.length > 0) {
                                    const hasValidChords = newQuestion.chordSpecs.every(spec => spec.midiNotes && spec.midiNotes.length > 0);
                                    if (hasValidChords) {
                                        setRoundState(prev => ({ ...prev, question: newQuestion, userDegrees: [], resolvedOutcome: null, wrongAtStep: null, pointsEarned: 0 }));
                                        setRoundStatus('idle');
                                        setIsPlaying(false);
                                        setIsInitializing(false);
                                    } else {
                                        setError('Invalid chord data');
                                        setIsInitializing(false);
                                    }
                                } else {
                                    setError('Failed to generate valid progression');
                                    setIsInitializing(false);
                                }
                            } catch (err) {
                                console.error('Error retrying progression:', err);
                                setError(err instanceof Error ? err.message : 'An error occurred');
                                setIsInitializing(false);
                            }
                        }}
                        className="btn-primary mt-4"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Validate question has valid data
    if (!roundState.question.targetDegrees || roundState.question.targetDegrees.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="text-lg text-red-600 mb-2">Invalid progression data</div>
                    <button
                        onClick={() => {
                            setError(null);
                            setIsInitializing(true);
                            try {
                                const newQuestion = generateProgressionQuestion(difficulty, roundState.sessionState, { streak });
                                if (newQuestion && newQuestion.targetDegrees && newQuestion.targetDegrees.length > 0) {
                                    const hasValidChords = newQuestion.chordSpecs.every(spec => spec.midiNotes && spec.midiNotes.length > 0);
                                    if (hasValidChords) {
                                        setRoundState(prev => ({ ...prev, question: newQuestion }));
                                        setIsInitializing(false);
                                    } else {
                                        setError('Invalid chord data');
                                        setIsInitializing(false);
                                    }
                                } else {
                                    setError('Failed to generate valid progression');
                                    setIsInitializing(false);
                                }
                            } catch (err) {
                                console.error('Error retrying progression:', err);
                                setError(err instanceof Error ? err.message : 'An error occurred');
                                setIsInitializing(false);
                            }
                        }}
                        className="btn-primary mt-4"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const showFeedback = roundStatus === 'resolved';
    const canInteract = roundStatus === 'awaitingInput' && !isPlaying;

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 relative">
            {/* Background gradient */}
            <div className="fixed inset-0 -z-0">
                <div className="absolute -translate-x-1/2 -translate-y-1/2 animate-pulse-glow bg-gradient-to-br from-orange-400/20 via-red-500/15 to-rose-600/15 opacity-60 mix-blend-multiply w-[500px] h-[500px] rounded-full top-1/4 left-1/4 blur-3xl"></div>
                <div className="absolute translate-x-1/2 translate-y-1/2 animate-pulse-glow bg-gradient-to-br from-orange-400/20 via-red-500/15 to-rose-600/15 opacity-60 mix-blend-multiply w-[500px] h-[500px] rounded-full bottom-1/4 right-1/4 blur-3xl"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center pt-6 lg:pt-8 pb-32">
                <div className="w-full max-w-4xl px-4 flex justify-between items-center mb-8 relative z-50">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate('/');
                        }}
                        className="group flex items-center gap-2 text-neutral-400 hover:text-neutral-600 font-medium text-sm relative z-50 cursor-pointer transition-all duration-300 hover:gap-3"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform duration-300">
                            <path d="m12 19-7-7 7-7"></path>
                            <path d="M19 12H5"></path>
                        </svg>
                        <span>Home</span>
                    </button>
                    <div className="text-xs lg:text-sm font-bold text-neutral-500 uppercase tracking-widest bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-sm">
                        {difficulty} progression
                    </div>
                    <div className="w-16"></div>
                </div>

                <div className="w-full max-w-4xl px-4 mb-6">
                    <h2 className="text-center text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight">
                        Chord Progressions
                    </h2>
                </div>

                <ProgressMeter
                    current={runProgress + 1}
                    total={10}
                    streak={streak}
                    level={level}
                    xp={xp}
                />

                <StreakCelebration streak={streak} />

                <ParticleEffect trigger={showParticles} />

                {celebration && (
                    <CelebrationOverlay
                        type={celebration.type}
                        message={celebration.message}
                        subtitle={celebration.subtitle}
                        onComplete={() => setCelebration(null)}
                    />
                )}

                <AchievementToast
                    achievement={newAchievement}
                    onClose={() => setNewAchievement(null)}
                />

                <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center">
                    <div className="card w-full max-w-xl mx-auto mb-8 bg-white/50 backdrop-blur-sm">
                        <Player
                            onPlay={roundStatus === 'idle' ? playProgression : handleReplay}
                            isPlaying={isPlaying}
                            label={roundStatus === 'idle' ? 'Play' : 'Replay'}
                            autoPlay={false}
                        />
                    </div>

                    <InputChain
                        degrees={roundState.userDegrees}
                        onClear={handleClear}
                        disabled={!canInteract}
                    />

                    <DegreeGrid
                        onSelect={handleDegreeSelect}
                        disabled={!canInteract}
                        selectedDegrees={roundState.userDegrees}
                        correctDegrees={roundStatus === 'resolved' ? roundState.question.targetDegrees : null}
                        wrongAtStep={roundState.wrongAtStep}
                    />

                    {showFeedback && (
                        <div className="mt-6 text-center">
                            <Feedback
                                correct={roundState.resolvedOutcome === 'success'}
                                points={roundState.pointsEarned}
                                multiplier={getComboMultiplier(streak)}
                                onShowParticles={handleShowParticles}
                            />
                            {roundState.resolvedOutcome === 'fail' && (
                                <div className="text-stone-600 text-sm mt-2">
                                    Correct: {roundState.question.targetDegrees.join(' → ')}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {showFeedback && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-6 flex flex-col items-center animate-slide-up pb-8">
                        <button
                            onClick={handleNext}
                            className="btn-primary w-full max-w-md text-lg"
                        >
                            Next Progression
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};


/**
 * Train Page Component
 * 
 * Main training interface that handles all game modes.
 * Manages question generation, audio playback, user input, scoring, and feedback.
 * Routes to specific mode components based on currentMode from game context.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { getLevelFromXP } from '../context/GameContext';
import { generateIntervalQuestion, type IntervalQuestion } from '../logic/trainers/intervalTrainer';
import { generateChordQuestion, type ChordQuestion } from '../logic/trainers/chordTrainer';
import { audioEngine } from '../audio/audioEngine';
import { loadInstrument, getInstrumentSampleId } from '../audio/sampleLoader';
import { Player } from '../components/Player';
import { AnswerGrid } from '../components/AnswerGrid';
import { Feedback } from '../components/Feedback';
import { ProgressMeter } from '../components/ProgressMeter';
import { Paywall } from '../components/Paywall';
import { ProgressionRound } from '../components/ProgressionRound';
import { ScalesMode } from '../components/modes/ScalesMode';
import { KeyFinderMode } from '../components/modes/KeyFinderMode';
import { NumberSystemMode } from '../components/modes/NumberSystemMode';
import { MelodyMode } from '../components/modes/MelodyMode';
import { TempoMode } from '../components/modes/TempoMode';
import { ParticleEffect } from '../components/ParticleEffect';
import { StreakCelebration } from '../components/StreakCelebration';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { AchievementToast } from '../components/AchievementToast';
import { recordAnswer, updateBestStreak, loadStats, saveStats } from '../logic/statsTracker';
import { checkAchievements, loadAchievements, type Achievement } from '../logic/achievements';
import { updateChallengeProgress, getDailyChallenges } from '../logic/dailyChallenges';
import { BrandLogo } from '../components/BrandLogo';
import { Footer } from '../components/Footer';
import { AudioStatusBanner } from '../components/resources/AudioStatusBanner';

// Calculate combo multiplier based on streak
const getComboMultiplier = (streak: number): number => {
    if (streak >= 20) return 4;
    if (streak >= 10) return 3;
    if (streak >= 5) return 2;
    return 1;
};

export const Train: React.FC = () => {
    const navigate = useNavigate();
    const { state, dispatch } = useGame();

    const [question, setQuestion] = useState<IntervalQuestion | ChordQuestion | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [correctId, setCorrectId] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);
    const [showParticles, setShowParticles] = useState(false);
    const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
    const [celebration, setCelebration] = useState<{ type: 'level-up' | 'perfect-run'; message: string; subtitle?: string } | null>(null);
    const [dailyChallenges, setDailyChallenges] = useState(getDailyChallenges());
    const [audioUnlocked, setAudioUnlocked] = useState(false);
    
    // Detect mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Init - only for interval and chord modes (other modes have their own components)
    useEffect(() => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Train.tsx:initEffect',message:'Init effect triggered',data:{isLocked:state.isLocked,currentMode:state.currentMode,difficulty:state.difficulty,hasInitialized:hasInitializedRef.current,lastMode:lastModeRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        // Only run for interval and chord modes - other modes use their own components
        if (state.currentMode !== 'interval' && state.currentMode !== 'chord') {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Train.tsx:initEffect:skippedOtherMode',message:'Skipped init for non-interval/chord mode',data:{currentMode:state.currentMode},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            return;
        }
        
        const modeKey = `${state.currentMode}-${state.difficulty}`;
        
        // Only load question if mode/difficulty actually changed or first init
        if (!hasInitializedRef.current || lastModeRef.current !== modeKey) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Train.tsx:initEffect:willLoad',message:'Mode changed, will load question',data:{isLocked:state.isLocked,modeKey,wasInitialized:hasInitializedRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            
            hasInitializedRef.current = true;
            lastModeRef.current = modeKey;
            
            if (state.isLocked) {
                // Show locked state immediately
            } else {
                loadNextQuestion();
            }
        } else {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Train.tsx:initEffect:skipped',message:'Skipped duplicate init effect',data:{modeKey,lastMode:lastModeRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
        }
    }, [state.currentMode, state.difficulty]);

    // Preload instrument when component mounts or mode/instrument changes
    useEffect(() => {
        loadInstrument(state.currentInstrument).catch(() => {
            // Silent fail - will load on first play
        });
    }, [state.currentMode, state.currentInstrument]);

    // Check audio context state on mount and visibility change (for mobile)
    useEffect(() => {
        const checkAudioState = async () => {
            try {
                await audioEngine.init();
                setAudioUnlocked(true);
                // Preload instrument
                await loadInstrument(state.currentInstrument);
            } catch (error) {
                console.error('Audio initialization failed:', error);
                setAudioUnlocked(false);
            }
        };
        checkAudioState();
    }, []);

    // Reinitialize audio when page becomes visible (fixes mobile Safari timeout)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible') {
                try {
                    // Reinitialize audio context when page becomes visible
                    await audioEngine.init(true); // Force recreate on visibility change
                    // Reload instrument to ensure samples are available
                    await loadInstrument(state.currentInstrument);
                    setAudioUnlocked(true);
                } catch (error) {
                    console.log('Audio reinitialization on visibility change:', error);
                    setAudioUnlocked(false);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const loadNextQuestion = () => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Train.tsx:loadNextQuestion:entry',message:'loadNextQuestion called',data:{currentMode:state.currentMode,difficulty:state.difficulty,runProgress:state.runProgress},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        setSelectedId(null);
        setCorrectId(null);
        setChecking(false);

        // Check limits
        if (state.runProgress > 0 && state.runProgress % 10 === 0) {
            dispatch({ type: 'INCREMENT_SESSION' });
        }

        if (state.currentMode === 'interval') {
            const newQuestion = generateIntervalQuestion(state.difficulty);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Train.tsx:loadNextQuestion:intervalGenerated',message:'Interval question generated',data:{intervalId:newQuestion.intervalId},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            setQuestion(newQuestion);
        } else {
            const newQuestion = generateChordQuestion(state.difficulty);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Train.tsx:loadNextQuestion:chordGenerated',message:'Chord question generated',data:{chordId:newQuestion.chordId,notesCount:newQuestion.notes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            setQuestion(newQuestion);
        }
    };

    const playQuestion = useCallback(async () => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Train.tsx:playQuestion:entry',message:'playQuestion called',data:{hasQuestion:!!question,isPlaying,questionType:'intervalId' in (question||{}) ? 'interval' : 'chord'},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        if (!question || isPlaying) return;
        setIsPlaying(true);

        try {
            // Initialize audio context and load sample (force recreate on user interaction)
            await audioEngine.init(true);
            await loadInstrument(state.currentInstrument);
            await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure sample is ready

            // Get the current instrument's sample ID
            const sampleId = getInstrumentSampleId(state.currentInstrument);

            if ('intervalId' in question) {
                // Play interval
                const q = question as IntervalQuestion;
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Train.tsx:playQuestion:playingInterval',message:'Playing interval',data:{intervalId:q.intervalId,rootMidi:q.rootMidi,targetMidi:q.targetMidi},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                audioEngine.playNote(sampleId, q.rootMidi, 60, 0);
                audioEngine.playNote(sampleId, q.targetMidi, 60, 0.8);
            } else {
                // Play chord
                const q = question as ChordQuestion;
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Train.tsx:playQuestion:playingChord',message:'Playing chord',data:{chordId:q.chordId,notesCount:q.notes.length,notes:q.notes},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
                // #endregion
                // Reduce gain per note to prevent clipping when multiple notes play together
                const gainPerNote = Math.min(1.0, 1.0 / q.notes.length);
                q.notes.forEach((note, i) => {
                    // Arpeggiate slightly or verify strum
                    audioEngine.playNote(sampleId, note, 60, 0 + (i * 0.05), gainPerNote);
                });
            }
        } catch (e) {
            console.error('Error playing question:', e);
            setIsPlaying(false);
            return;
        }

        setTimeout(() => setIsPlaying(false), 1500);
    }, [question, isPlaying]);

    // Auto-play once when question loads
    const hasAutoPlayedRef = useRef(false);
    const hasInitializedRef = useRef(false);
    const lastModeRef = useRef<string>('');
    
    useEffect(() => {
        // Reset flag when question changes
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Train.tsx:autoPlayReset',message:'Resetting hasAutoPlayedRef',data:{previousValue:hasAutoPlayedRef.current,questionType:question?('intervalId' in question?'interval':'chord'):'null'},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        hasAutoPlayedRef.current = false;
    }, [question]);

    useEffect(() => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Train.tsx:autoPlayEffect',message:'Auto-play effect triggered',data:{hasQuestion:!!question,hasAutoPlayed:hasAutoPlayedRef.current,hasSelectedId:!!selectedId,willAutoPlay:!!(question && !hasAutoPlayedRef.current && !selectedId)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        if (question && !hasAutoPlayedRef.current && !selectedId) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Train.tsx:autoPlayTriggered',message:'Auto-play will trigger in 500ms',data:{questionType:'intervalId' in question?'interval':'chord'},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            hasAutoPlayedRef.current = true;
            const timer = setTimeout(() => playQuestion(), 500);
            return () => clearTimeout(timer);
        }
    }, [question, selectedId, playQuestion]);

    const handleAnswer = (id: string) => {
        if (checking || !question) return;

        setSelectedId(id);
        setChecking(true);

        const isCorrect =
            ('intervalId' in question && id === question.intervalId) ||
            ('chordId' in question && id === question.chordId);

        if (isCorrect) {
            setCorrectId(id);
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 100);
            
            const newStreak = state.streak + 1;
            const newRunProgress = state.runProgress + 1;
            
            // Check for perfect run
            const isPerfectRun = newRunProgress === 10 && isCorrect;
            
            // Update stats
            let stats = loadStats();
            stats = recordAnswer(stats, true, state.currentMode, isPerfectRun);
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
                level: state.level,
                currentSessionQuestions: state.runProgress
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
            
            // Update questions challenge
            const challengeUpdate1 = updateChallengeProgress(updatedChallenges, 'questions', 1);
            updatedChallenges = challengeUpdate1.challenges;
            
            // Check streak challenges - if streak meets threshold, mark as complete
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
            
            // Check for level up
            const currentXP = state.xp;
            const xpGained = Math.floor(30 * (1 + state.streak * 0.1));
            const newXP = currentXP + xpGained;
            const newLevel = getLevelFromXP(newXP);
            
            if (newLevel > state.level) {
                setCelebration({
                    type: 'level-up',
                    message: `Level ${newLevel}!`,
                    subtitle: 'Keep it up!'
                });
            }
            
            // Check for perfect run celebration
            if (isPerfectRun) {
                setCelebration({
                    type: 'perfect-run',
                    message: 'Perfect Run!',
                    subtitle: '10/10 Correct!'
                });
            }
            
            // Apply combo multiplier to points
            const basePoints = 30;
            const multiplier = getComboMultiplier(state.streak);
            const finalPoints = basePoints * multiplier;
            
            dispatch({ type: 'CORRECT_ANSWER', payload: finalPoints });
        } else {
            setCorrectId('intervalId' in question ? (question as IntervalQuestion).intervalId : (question as ChordQuestion).chordId);
            
            // Update stats
            let stats = loadStats();
            stats = recordAnswer(stats, false, state.currentMode);
            saveStats(stats);
            
            dispatch({ type: 'WRONG_ANSWER' });
        }
    };

    const handleNext = () => {
        if (state.isLocked) return; // Keep paywall up if locked state triggered during question
        loadNextQuestion();
    };

    // Render mode-specific components
    if (state.currentMode === 'progression') {
        return (
            <>
                <ProgressionRound
                    difficulty={state.difficulty}
                    streak={state.streak}
                    runProgress={state.runProgress}
                    level={state.level}
                    xp={state.xp}
                    onCorrect={(points) => dispatch({ type: 'CORRECT_ANSWER', payload: points })}
                    onWrong={() => dispatch({ type: 'WRONG_ANSWER' })}
                    onNext={() => {
                        if (state.runProgress > 0 && state.runProgress % 10 === 0) {
                            dispatch({ type: 'INCREMENT_SESSION' });
                        }
                    }}
                />
                <Paywall
                    visible={state.isLocked}
                    onUnlock={() => {
                        dispatch({ type: 'UNLOCK_FEATURE' });
                    }}
                />
            </>
        );
    }

    if (state.currentMode === 'scale') {
        return (
            <>
                <ScalesMode
                    difficulty={state.difficulty}
                    streak={state.streak}
                    runProgress={state.runProgress}
                    onCorrect={(points) => dispatch({ type: 'CORRECT_ANSWER', payload: points })}
                    onWrong={() => dispatch({ type: 'WRONG_ANSWER' })}
                    onNext={() => {
                        if (state.runProgress > 0 && state.runProgress % 10 === 0) {
                            dispatch({ type: 'INCREMENT_SESSION' });
                        }
                    }}
                />
                <Paywall
                    visible={state.isLocked}
                    onUnlock={() => {
                        dispatch({ type: 'UNLOCK_FEATURE' });
                    }}
                />
            </>
        );
    }

    // Legacy: perfectPitch mode now routes to keyFinder
    if (state.currentMode === 'perfectPitch' || state.currentMode === 'keyFinder') {
        return (
            <>
                <KeyFinderMode
                    difficulty={state.difficulty}
                    streak={state.streak}
                    runProgress={state.runProgress}
                    onCorrect={(points) => dispatch({ type: 'CORRECT_ANSWER', payload: points })}
                    onWrong={() => dispatch({ type: 'WRONG_ANSWER' })}
                    onNext={() => {
                        if (state.runProgress > 0 && state.runProgress % 10 === 0) {
                            dispatch({ type: 'INCREMENT_SESSION' });
                        }
                    }}
                />
                <Paywall
                    visible={state.isLocked}
                    onUnlock={() => {
                        dispatch({ type: 'UNLOCK_FEATURE' });
                    }}
                />
            </>
        );
    }

    if (state.currentMode === 'numberSystem') {
        return (
            <>
                <NumberSystemMode
                    difficulty={state.difficulty}
                    streak={state.streak}
                    runProgress={state.runProgress}
                    onCorrect={(points) => dispatch({ type: 'CORRECT_ANSWER', payload: points })}
                    onWrong={() => dispatch({ type: 'WRONG_ANSWER' })}
                    onNext={() => {
                        if (state.runProgress > 0 && state.runProgress % 10 === 0) {
                            dispatch({ type: 'INCREMENT_SESSION' });
                        }
                    }}
                />
                <Paywall
                    visible={state.isLocked}
                    onUnlock={() => {
                        dispatch({ type: 'UNLOCK_FEATURE' });
                    }}
                />
            </>
        );
    }

    if (state.currentMode === 'melody') {
        return (
            <>
                <MelodyMode
                    difficulty={state.difficulty}
                    streak={state.streak}
                    runProgress={state.runProgress}
                    onCorrect={(points) => dispatch({ type: 'CORRECT_ANSWER', payload: points })}
                    onWrong={() => dispatch({ type: 'WRONG_ANSWER' })}
                    onNext={() => {
                        if (state.runProgress > 0 && state.runProgress % 10 === 0) {
                            dispatch({ type: 'INCREMENT_SESSION' });
                        }
                    }}
                />
                <Paywall
                    visible={state.isLocked}
                    onUnlock={() => {
                        dispatch({ type: 'UNLOCK_FEATURE' });
                    }}
                />
            </>
        );
    }

    if (state.currentMode === 'tempo') {
        return (
            <>
                <TempoMode
                    difficulty={state.difficulty}
                    streak={state.streak}
                    runProgress={state.runProgress}
                    onCorrect={(points) => dispatch({ type: 'CORRECT_ANSWER', payload: points })}
                    onWrong={() => dispatch({ type: 'WRONG_ANSWER' })}
                    onNext={() => {
                        if (state.runProgress > 0 && state.runProgress % 10 === 0) {
                            dispatch({ type: 'INCREMENT_SESSION' });
                        }
                    }}
                />
                <Paywall
                    visible={state.isLocked}
                    onUnlock={() => {
                        dispatch({ type: 'UNLOCK_FEATURE' });
                    }}
                />
            </>
        );
    }

    if (!question) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 relative flex flex-col">
            {/* Background gradient */}
            <div className="fixed inset-0 -z-0">
                <div className="absolute -translate-x-1/2 -translate-y-1/2 animate-pulse-glow bg-gradient-to-br from-orange-400/20 via-red-500/15 to-rose-600/15 opacity-60 mix-blend-multiply w-[500px] h-[500px] rounded-full top-1/4 left-1/4 blur-3xl"></div>
                <div className="absolute translate-x-1/2 translate-y-1/2 animate-pulse-glow bg-gradient-to-br from-orange-400/20 via-red-500/15 to-rose-600/15 opacity-60 mix-blend-multiply w-[500px] h-[500px] rounded-full bottom-1/4 right-1/4 blur-3xl"></div>
            </div>

            {/* Top Left Branding */}
            <div className="absolute top-6 left-4 lg:top-8 lg:left-8 z-50">
                <BrandLogo showText={false} />
            </div>

            <div className="relative z-10 flex flex-col items-center pt-6 lg:pt-8 pb-32 flex-1">
                {/* Header / Nav */}
                <div className="w-full max-w-4xl px-4 flex justify-between items-center mb-8 relative z-50 pl-20 lg:pl-24">
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
                        {state.difficulty} {state.currentMode}
                    </div>
                    <div className="w-16"></div>
                </div>

            {/* Audio Status Banner - Mobile Only */}
            {isMobile && (
                <div className="w-full max-w-4xl px-4 mb-4">
                    <AudioStatusBanner
                        isUnlocked={audioUnlocked}
                        onUnlock={() => setAudioUnlocked(true)}
                    />
                </div>
            )}

            <ProgressMeter 
                current={state.runProgress + 1} 
                total={10} 
                streak={state.streak}
                level={state.level}
                xp={state.xp}
            />

            <StreakCelebration streak={state.streak} />

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
                    <h2 className="text-center text-xl font-semibold text-stone-700 mb-2">
                        Listen and Identify
                    </h2>
                    <Player
                        onPlay={playQuestion}
                        isPlaying={isPlaying}
                        autoPlay={false} // Handled by effect
                    />
                </div>

                <AnswerGrid
                    options={question.options}
                    onSelect={handleAnswer}
                    disabled={checking || isPlaying}
                    selectedId={selectedId}
                    correctId={correctId}
                />
            </div>

            {checking && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-6 flex flex-col items-center animate-slide-up pb-8">
                    <Feedback 
                        correct={correctId === selectedId} 
                        points={30}
                        multiplier={getComboMultiplier(state.streak)}
                        onShowParticles={() => setShowParticles(true)}
                    />
                    <button
                        onClick={handleNext}
                        className={`mt-4 btn-primary w-full max-w-md text-lg ${state.isLocked ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        Next Question
                    </button>
                </div>
            )}

            <Paywall
                visible={state.isLocked}
                onUnlock={() => {
                    dispatch({ type: 'UNLOCK_FEATURE' });
                    // Ideally navigate to success or just close
                }}
            />
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

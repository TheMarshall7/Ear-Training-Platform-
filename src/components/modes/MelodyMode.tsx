import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../logic/GameContext';
import { generateMelodyQuestion, type MelodyQuestion } from '../../logic/melodyTrainer';
import { audioEngine } from '../../audio/audioEngine';
import { loadInstrument } from '../../audio/sampleLoader';
import { ModeHeader } from '../ModeHeader';
import { RoundControls } from '../RoundControls';
import { DegreeGrid } from '../DegreeGrid';
import { InputChain } from '../InputChain';
import { Feedback } from '../Feedback';
import { ProgressMeter } from '../ProgressMeter';
import { ParticleEffect } from '../ParticleEffect';
import { BrandLogo } from '../BrandLogo';
import { Footer } from '../Footer';
import { recordAnswer, updateBestStreak, loadStats, saveStats } from '../../logic/statsTracker';
import { updateChallengeProgress, getDailyChallenges } from '../../logic/dailyChallenges';
import type { Difficulty } from '../../logic/GameContext';

interface MelodyModeProps {
    difficulty: Difficulty;
    streak: number;
    runProgress: number;
    onCorrect: (points: number) => void;
    onWrong: () => void;
    onNext: () => void;
}

export const MelodyMode: React.FC<MelodyModeProps> = ({
    difficulty,
    streak,
    runProgress,
    onCorrect,
    onWrong,
    onNext
}) => {
    const navigate = useNavigate();
    const { state } = useGame();
    const [question, setQuestion] = useState<MelodyQuestion | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [userDegrees, setUserDegrees] = useState<number[]>([]);
    const [checking, setChecking] = useState(false);
    const [wrongAtStep, setWrongAtStep] = useState<number | null>(null);
    const [showParticles, setShowParticles] = useState(false);
    const [dailyChallenges, setDailyChallenges] = useState(getDailyChallenges());
    const [melodyPercentage, setMelodyPercentage] = useState<number | null>(null);
    const hasAutoPlayedRef = useRef(false);

    useEffect(() => {
        // Only load instrument once, not on every difficulty change
        // It will be loaded when needed in play functions
        const newQuestion = generateMelodyQuestion(difficulty);
        setQuestion(newQuestion);
        setUserDegrees([]);
        setWrongAtStep(null);
        hasAutoPlayedRef.current = false; // Reset for new question
    }, [difficulty]);

    const playRootChord = useCallback(async () => {
        if (!question || isPlaying) return;
        
        // Validate question is fully ready before playing
        if (!question.notes || question.notes.length === 0) {
            return;
        }
        
        try {
            await audioEngine.init();
            await loadInstrument('piano');
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Final validation check before playing
            if (!question || !question.notes || question.notes.length === 0) {
                return;
            }
            
            // Ensure sample is loaded before playing
            const sampleId = 'piano_C4';
            // Check if sample exists by trying to access it (will be checked in playNote)
            
            // Play root chord (degree 1 = C Major) to tonicize the key
            // Play all notes simultaneously with slight arpeggiation
            const rootChord = [60, 64, 67]; // C Major: C4, E4, G4
            const gainPerNote = 1.0 / rootChord.length;
            rootChord.forEach((midiNote, index) => {
                audioEngine.playNote(sampleId, midiNote, 60, index * 0.05, gainPerNote);
            });
            
            // Wait for chord to finish (about 2 seconds)
            return new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error('Error playing root chord:', error);
        }
    }, [question, isPlaying]);

    const playMelody = useCallback(async () => {
        if (!question || isPlaying) return;
        
        // Validate question has valid notes before playing
        if (!question.notes || question.notes.length === 0) {
            return;
        }
        
        setIsPlaying(true);

        try {
            await audioEngine.init();
            await loadInstrument('piano');
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Double-check question is still valid
            if (!question || !question.notes || question.notes.length === 0) {
                setIsPlaying(false);
                return;
            }
            
            // Play root chord first, then melody
            await playRootChord();
            
            // Small pause between chord and melody
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Final check before playing melody
            if (!question || !question.notes || question.notes.length === 0) {
                setIsPlaying(false);
                return;
            }
            
            audioEngine.playMelody(question.notes, question.tempoMs);
            
            // Wait for melody to finish
            const duration = question.notes.length * question.tempoMs + 1000;
            setTimeout(() => {
                setIsPlaying(false);
            }, duration);
        } catch (error) {
            console.error('Error playing melody:', error);
            setIsPlaying(false);
        }
    }, [question, isPlaying, playRootChord]);

    // Auto-play once when question loads
    useEffect(() => {
        // Only auto-play if question is fully ready and we haven't played yet
        if (!question || !question.notes || question.notes.length === 0) {
            return;
        }
        
        if (!hasAutoPlayedRef.current && userDegrees.length === 0 && !isPlaying && !checking) {
            hasAutoPlayedRef.current = true;
            const timer = setTimeout(async () => {
                // Double-check question is still valid before playing
                if (!question || !question.notes || question.notes.length === 0) {
                    hasAutoPlayedRef.current = false;
                    return;
                }
                
                // Ensure audio is ready before playing
                try {
                    await audioEngine.init();
                    await loadInstrument('piano');
                    // Additional delay to ensure everything is stable
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    // Final validation before playing
                    if (question && question.notes && question.notes.length > 0 && !isPlaying) {
                        playMelody();
                    } else {
                        hasAutoPlayedRef.current = false; // Reset if question invalid
                    }
                } catch (error) {
                    console.error('Error in auto-play:', error);
                    hasAutoPlayedRef.current = false; // Reset on error
                }
            }, 1000); // Increased delay to ensure everything is ready
            return () => clearTimeout(timer);
        }
    }, [question, userDegrees.length, isPlaying, checking, playMelody]);

    const handleDegreeSelect = (degree: number) => {
        if (checking || !question || isPlaying) return;
        if (userDegrees.length >= question.degrees.length) return;

        const newDegrees = [...userDegrees, degree];
        setUserDegrees(newDegrees);

        // Auto-submit when length matches
        if (newDegrees.length === question.degrees.length) {
            validateAnswer(newDegrees);
        }
    };

    const validateAnswer = (degrees: number[]) => {
        if (!question) return;

        setChecking(true);

        // Check step by step and calculate percentage
        let correctCount = 0;
        let wrongIndex = -1;
        for (let i = 0; i < degrees.length; i++) {
            if (degrees[i] === question.degrees[i]) {
                correctCount++;
            } else if (wrongIndex === -1) {
                wrongIndex = i; // Track first wrong position
            }
        }

        const totalNotes = question.degrees.length;
        const percentage = Math.round((correctCount / totalNotes) * 100);
        const isFullyCorrect = wrongIndex === -1;

        if (isFullyCorrect) {
            // All correct
            setWrongAtStep(null);
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 2000);
            
            const newStreak = streak + 1;
            const newRunProgress = runProgress + 1;
            const isPerfectRun = newRunProgress === 10;
            
            // Update stats
            let stats = loadStats();
            stats = recordAnswer(stats, true, 'melody', isPerfectRun);
            stats = updateBestStreak(stats, newStreak);
            saveStats(stats);
            
            // Update daily challenges
            let updatedChallenges = dailyChallenges;
            const challengeUpdate = updateChallengeProgress(updatedChallenges, 'questions', 1);
            updatedChallenges = challengeUpdate.challenges;
            setDailyChallenges(updatedChallenges);
            
            const basePoints = 30;
            const multiplier = streak >= 20 ? 4 : streak >= 10 ? 3 : streak >= 5 ? 2 : 1;
            const finalPoints = basePoints * multiplier;
            
            onCorrect(finalPoints);
        } else {
            // Wrong at step - show percentage
            setWrongAtStep(wrongIndex);
            
            // Update stats
            let stats = loadStats();
            stats = recordAnswer(stats, false, 'melody');
            saveStats(stats);
            
            onWrong();
        }
        
        // Store percentage for display
        setMelodyPercentage(percentage);
    };

    const handleClear = () => {
        if (checking || isPlaying) return;
        setUserDegrees([]);
        setWrongAtStep(null);
    };

    const handleNext = () => {
        setUserDegrees([]);
        setChecking(false);
        setWrongAtStep(null);
        setMelodyPercentage(null);
        hasAutoPlayedRef.current = false; // Reset for new question
        const newQuestion = generateMelodyQuestion(difficulty);
        setQuestion(newQuestion);
        onNext();
    };

    const handleSubmit = () => {
        if (userDegrees.length === question?.degrees.length) {
            validateAnswer(userDegrees);
        }
    };

    if (!question) return <div className="p-8 text-center">Loading...</div>;

    const canSubmit = userDegrees.length === question.degrees.length && !checking && !isPlaying;

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 relative flex flex-col">
            <div className="fixed inset-0 -z-0">
                <div className="absolute -translate-x-1/2 -translate-y-1/2 animate-pulse-glow bg-gradient-to-br from-orange-400/20 via-red-500/15 to-rose-600/15 opacity-60 mix-blend-multiply w-[500px] h-[500px] rounded-full top-1/4 left-1/4 blur-3xl"></div>
            </div>

            <div className="absolute top-6 left-4 lg:top-8 lg:left-8 z-50">
                <BrandLogo showText={false} />
            </div>

            <div className="relative z-10 flex flex-col items-center pt-6 lg:pt-8 pb-32 flex-1">
                <div className="w-full max-w-4xl px-4 flex justify-between items-center mb-4 relative z-50 pl-20 lg:pl-24">
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
                    <div className="w-16"></div>
                </div>

                <ProgressMeter 
                    current={runProgress + 1} 
                    total={10} 
                    streak={streak}
                    level={state.level}
                    xp={state.xp}
                />

                <ParticleEffect trigger={showParticles} />

                <ModeHeader
                    title="Guess the Melody"
                    difficulty={difficulty}
                    streak={streak}
                    runProgress={runProgress}
                    tip="Best results: short daily practice."
                />

                <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center">
                    <div className="card w-full max-w-xl mx-auto mb-8 bg-white/50 backdrop-blur-sm">
                        <RoundControls
                            onPlay={playMelody}
                            onReplay={playMelody}
                            isPlaying={isPlaying}
                            label="Play"
                        />
                    </div>

                    <InputChain
                        degrees={userDegrees}
                        onClear={handleClear}
                        disabled={checking || isPlaying}
                    />

                    <DegreeGrid
                        onSelect={handleDegreeSelect}
                        disabled={checking || isPlaying || userDegrees.length >= question.degrees.length}
                        selectedDegrees={userDegrees}
                        correctDegrees={checking ? question.degrees : null}
                        wrongAtStep={wrongAtStep}
                    />

                    {canSubmit && (
                        <button
                            onClick={handleSubmit}
                            className="mt-4 btn-primary w-full max-w-md"
                        >
                            Submit
                        </button>
                    )}
                </div>

                {checking && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-6 flex flex-col items-center animate-slide-up pb-8 max-h-[80vh] overflow-y-auto">
                        <div className="w-full max-w-md space-y-4">
                            <Feedback 
                                correct={wrongAtStep === null} 
                                points={30}
                                multiplier={streak >= 20 ? 4 : streak >= 10 ? 3 : streak >= 5 ? 2 : 1}
                                onShowParticles={() => setShowParticles(true)}
                            />
                            {wrongAtStep !== null && melodyPercentage !== null && (
                                <div className="text-center space-y-2">
                                    <div className="text-lg font-semibold text-neutral-700">
                                        Melody {melodyPercentage}% correct
                                    </div>
                                    <div className="text-sm text-neutral-500">
                                        Wrong at note {wrongAtStep + 1}
                                    </div>
                                    <div className="text-sm text-neutral-500">
                                        Correct sequence: {question.degrees.join(' → ')}
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={handleNext}
                                className="w-full btn-primary text-lg mt-6"
                            >
                                Next Question
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

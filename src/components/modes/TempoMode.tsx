import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { generateTempoQuestion, checkTempoAnswer, type TempoQuestion } from '../../logic/trainers/tempoTrainer';
import { audioEngine } from '../../audio/audioEngine';
import { loadInstrument } from '../../audio/sampleLoader';
import { ModeHeader } from '../ModeHeader';
import { RoundControls } from '../RoundControls';
import { ProgressMeter } from '../ProgressMeter';
import { ParticleEffect } from '../ParticleEffect';
import { BrandLogo } from '../BrandLogo';
import { Footer } from '../Footer';
import { recordAnswer, updateBestStreak, loadStats, saveStats } from '../../logic/statsTracker';
import { updateChallengeProgress, getDailyChallenges } from '../../logic/dailyChallenges';
import type { Difficulty } from '../../types/game';

interface TempoModeProps {
    difficulty: Difficulty;
    streak: number;
    runProgress: number;
    onCorrect: (points: number) => void;
    onWrong: () => void;
    onNext: () => void;
}

export const TempoMode: React.FC<TempoModeProps> = ({
    difficulty,
    streak,
    runProgress,
    onCorrect,
    onWrong,
    onNext
}) => {
    const navigate = useNavigate();
    const { state } = useGame();
    const [question, setQuestion] = useState<TempoQuestion | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [userBPM, setUserBPM] = useState<number>(120);
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<{ correct: boolean; accuracy: string; difference: number } | null>(null);
    const [showParticles, setShowParticles] = useState(false);
    const [dailyChallenges, setDailyChallenges] = useState(getDailyChallenges());
    const hasAutoPlayedRef = useRef(false);

    useEffect(() => {
        const newQuestion = generateTempoQuestion(difficulty);
        setQuestion(newQuestion);
        setUserBPM(Math.floor((newQuestion.minBPM + newQuestion.maxBPM) / 2));
        hasAutoPlayedRef.current = false;
    }, [difficulty]);

    const playMetronome = useCallback(async () => {
        if (!question || isPlaying) return;
        setIsPlaying(true);

        try {
            if (!question.beatInterval) {
                setIsPlaying(false);
                return;
            }
            
            // Force recreate audio context on user interaction
            await audioEngine.init(true);
            await loadInstrument('piano');
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Double-check question is still valid
            if (!question) {
                setIsPlaying(false);
                return;
            }
            
            // Play metronome clicks
            // Use a higher note for click (e.g., C6 = MIDI 84)
            const clickNote = 84;
            
            for (let i = 0; i < question.beatsToPlay; i++) {
                const delay = (i * question.beatInterval) / 1000; // Convert to seconds
                audioEngine.playNote('piano_C4', clickNote, 60, delay, 0.8);
            }
            
            // Calculate total duration
            const totalDuration = question.beatsToPlay * question.beatInterval + 200;
            
            setTimeout(() => {
                setIsPlaying(false);
            }, totalDuration);
        } catch (error) {
            console.error('Error playing metronome:', error);
            setIsPlaying(false);
        }
    }, [question, isPlaying]);

    // Auto-play once when question loads
    useEffect(() => {
        if (!question) {
            return;
        }
        
        if (!hasAutoPlayedRef.current && !checking && !isPlaying) {
            hasAutoPlayedRef.current = true;
            const timer = setTimeout(async () => {
                if (!question) {
                    hasAutoPlayedRef.current = false;
                    return;
                }
                
                try {
                    await audioEngine.init();
                    await loadInstrument('piano');
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    if (question && !isPlaying) {
                        playMetronome();
                    } else {
                        hasAutoPlayedRef.current = false;
                    }
                } catch (error) {
                    console.error('Error in auto-play:', error);
                    hasAutoPlayedRef.current = false;
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [question, isPlaying, checking, playMetronome]);

    const handleSubmit = () => {
        if (checking || !question || isPlaying) return;

        setChecking(true);

        const answerResult = checkTempoAnswer(question.targetBPM, userBPM);
        
        setResult({
            correct: answerResult.isCorrect,
            accuracy: answerResult.accuracy,
            difference: answerResult.difference
        });

        if (answerResult.isCorrect) {
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 2000);
            
            const newStreak = streak + 1;
            const newRunProgress = runProgress + 1;
            const isPerfectRun = newRunProgress === 10;
            
            // Update stats
            let stats = loadStats();
            stats = recordAnswer(stats, true, 'tempo', isPerfectRun);
            stats = updateBestStreak(stats, newStreak);
            saveStats(stats);
            
            // Update daily challenges
            let updatedChallenges = dailyChallenges;
            const challengeUpdate = updateChallengeProgress(updatedChallenges, 'questions', 1);
            updatedChallenges = challengeUpdate.challenges;
            setDailyChallenges(updatedChallenges);
            
            const multiplier = streak >= 20 ? 4 : streak >= 10 ? 3 : streak >= 5 ? 2 : 1;
            const finalPoints = answerResult.points * multiplier;
            
            onCorrect(finalPoints);
        } else {
            // Update stats
            let stats = loadStats();
            stats = recordAnswer(stats, false, 'tempo');
            saveStats(stats);
            
            onWrong();
        }
    };

    const handleNext = () => {
        setChecking(false);
        setResult(null);
        hasAutoPlayedRef.current = false;
        const newQuestion = generateTempoQuestion(difficulty);
        setQuestion(newQuestion);
        setUserBPM(Math.floor((newQuestion.minBPM + newQuestion.maxBPM) / 2));
        onNext();
    };

    if (!question) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 relative flex flex-col">
            <div className="fixed inset-0 -z-0">
                <div className="absolute -translate-x-1/2 -translate-y-1/2 animate-pulse-glow bg-gradient-to-br from-orange-400/20 via-red-500/15 to-rose-600/15 opacity-60 mix-blend-multiply w-[500px] h-[500px] rounded-full top-1/4 left-1/4 blur-3xl"></div>
                <div className="absolute translate-x-1/2 translate-y-1/2 animate-pulse-glow bg-gradient-to-br from-orange-400/20 via-red-500/15 to-rose-600/15 opacity-60 mix-blend-multiply w-[500px] h-[500px] rounded-full bottom-1/4 right-1/4 blur-3xl"></div>
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
                    title="Tempo Trainer"
                    difficulty={difficulty}
                    streak={streak}
                    runProgress={runProgress}
                    tip="Listen to the metronome and guess the BPM."
                />

                <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center">
                    <div className="card w-full max-w-xl mx-auto mb-8 bg-white/50 backdrop-blur-sm">
                        <RoundControls
                            onPlay={playMetronome}
                            onReplay={playMetronome}
                            isPlaying={isPlaying}
                            label="Play Metronome"
                        />
                    </div>

                    {/* BPM Input Controls */}
                    <div className="w-full max-w-xl mx-auto bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                        <h3 className="text-center text-lg font-semibold text-neutral-700 mb-6">
                            What is the tempo?
                        </h3>
                        
                        {/* Current BPM Display */}
                        <div className="text-center mb-6">
                            <div className="text-6xl font-bold text-neutral-900 mb-2">
                                {userBPM}
                            </div>
                            <div className="text-sm text-neutral-500 uppercase tracking-wide">
                                BPM
                            </div>
                        </div>

                        {/* Slider */}
                        <div className="mb-6">
                            <input
                                type="range"
                                min={question.minBPM}
                                max={question.maxBPM}
                                step={difficulty === 'easy' ? 10 : difficulty === 'medium' ? 5 : 1}
                                value={userBPM}
                                onChange={(e) => setUserBPM(parseInt(e.target.value))}
                                disabled={checking || isPlaying}
                                className="w-full h-3 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                                style={{
                                    background: `linear-gradient(to right, #f97316 0%, #f97316 ${((userBPM - question.minBPM) / (question.maxBPM - question.minBPM)) * 100}%, #e5e5e5 ${((userBPM - question.minBPM) / (question.maxBPM - question.minBPM)) * 100}%, #e5e5e5 100%)`
                                }}
                            />
                            <div className="flex justify-between text-xs text-neutral-400 mt-2">
                                <span>{question.minBPM}</span>
                                <span>{question.maxBPM}</span>
                            </div>
                        </div>

                        {/* Number Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-neutral-600 mb-2">
                                Or enter manually:
                            </label>
                            <input
                                type="number"
                                min={question.minBPM}
                                max={question.maxBPM}
                                value={userBPM}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val >= question.minBPM && val <= question.maxBPM) {
                                        setUserBPM(val);
                                    }
                                }}
                                disabled={checking || isPlaying}
                                className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 focus:border-orange-500 focus:outline-none text-center text-xl font-semibold"
                            />
                        </div>

                        {/* Submit Button */}
                        {!checking && (
                            <button
                                onClick={handleSubmit}
                                disabled={isPlaying}
                                className="btn-primary w-full text-lg"
                            >
                                Submit Answer
                            </button>
                        )}
                    </div>
                </div>

                {checking && result && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-6 flex flex-col items-center animate-slide-up pb-8">
                        <div className="text-center mb-4">
                            {result.correct ? (
                                <>
                                    <h3 className="text-2xl font-bold text-green-600 mb-2">
                                        {result.accuracy === 'perfect' ? '🎯 Perfect!' : '✓ Close!'}
                                    </h3>
                                    <p className="text-neutral-600">
                                        Target: <strong>{question.targetBPM} BPM</strong> • Your guess: <strong>{userBPM} BPM</strong>
                                    </p>
                                    <p className="text-sm text-neutral-500 mt-1">
                                        Difference: ±{result.difference} BPM
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-bold text-red-600 mb-2">
                                        Not quite
                                    </h3>
                                    <p className="text-neutral-600">
                                        Target: <strong>{question.targetBPM} BPM</strong> • Your guess: <strong>{userBPM} BPM</strong>
                                    </p>
                                    <p className="text-sm text-neutral-500 mt-1">
                                        Difference: {result.difference} BPM (need ±6 or better)
                                    </p>
                                </>
                            )}
                        </div>
                        <button
                            onClick={handleNext}
                            className="mt-4 btn-primary w-full max-w-md text-lg"
                        >
                            Next Question
                        </button>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

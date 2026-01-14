import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { generateScaleQuestion, type ScaleQuestion } from '../../logic/trainers/scaleTrainer';
import { audioEngine } from '../../audio/audioEngine';
import { loadInstrument, getInstrumentSampleId } from '../../audio/sampleLoader';
import { ModeHeader } from '../ModeHeader';
import { RoundControls } from '../RoundControls';
import { AnswerGrid } from '../AnswerGrid';
import { Feedback } from '../Feedback';
import { ProgressMeter } from '../ProgressMeter';
import { ParticleEffect } from '../ParticleEffect';
import { BrandLogo } from '../BrandLogo';
import { Footer } from '../Footer';
import { recordAnswer, updateBestStreak, loadStats, saveStats } from '../../logic/statsTracker';
import { updateChallengeProgress, getDailyChallenges } from '../../logic/dailyChallenges';
import type { Difficulty } from '../../types/game';

interface ScalesModeProps {
    difficulty: Difficulty;
    streak: number;
    runProgress: number;
    onCorrect: (points: number) => void;
    onWrong: () => void;
    onNext: () => void;
}

export const ScalesMode: React.FC<ScalesModeProps> = ({
    difficulty,
    streak,
    runProgress,
    onCorrect,
    onWrong,
    onNext
}) => {
    const navigate = useNavigate();
    const { state } = useGame();
    const [question, setQuestion] = useState<ScaleQuestion | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [correctId, setCorrectId] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);
    const [showParticles, setShowParticles] = useState(false);
    const [dailyChallenges, setDailyChallenges] = useState(getDailyChallenges());
    const hasAutoPlayedRef = useRef(false);
    const hasInitializedRef = useRef(false);
    const lastDifficultyRef = useRef<string>('');

    useEffect(() => {
        // Only load question if difficulty actually changed or first init
        if (!hasInitializedRef.current || lastDifficultyRef.current !== difficulty) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ScalesMode.tsx:initEffect:willLoad',message:'Difficulty changed, will load question',data:{difficulty,wasInitialized:hasInitializedRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            
            hasInitializedRef.current = true;
            lastDifficultyRef.current = difficulty;
            
            const newQuestion = generateScaleQuestion(difficulty);
            setQuestion(newQuestion);
            hasAutoPlayedRef.current = false; // Reset for new question
        } else {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ScalesMode.tsx:initEffect:skipped',message:'Skipped duplicate init effect',data:{difficulty},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
        }
    }, [difficulty]);

    const playScale = useCallback(async () => {
        // CRITICAL: Unlock audio FIRST, inside user gesture
        await audioEngine.ensureUnlocked();
        
        if (!question || isPlaying) return;
        
        // Validate question has valid notes before playing
        if (!question.notes || question.notes.length === 0) {
            return;
        }
        
        setIsPlaying(true);

        try {
            // Force recreate audio context on user interaction
            await audioEngine.init(true);
            await loadInstrument(state.currentInstrument);
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Double-check question is still valid
            if (!question || !question.notes || question.notes.length === 0) {
                setIsPlaying(false);
                return;
            }
            
            const sampleId = getInstrumentSampleId(state.currentInstrument);
            audioEngine.playScale(question.notes, 400, sampleId, 60, 4);
            
            // Wait for scale to finish (approximate: notes.length * 400ms + buffer)
            const duration = question.notes.length * 400 + 500;
            setTimeout(() => {
                setIsPlaying(false);
            }, duration);
        } catch (error) {
            console.error('Error playing scale:', error);
            setIsPlaying(false);
        }
    }, [question, isPlaying]);

    // Auto-play once when question loads
    useEffect(() => {
        // Only auto-play if question is fully ready and we haven't played yet
        if (!question || !question.notes || question.notes.length === 0) {
            return;
        }
        
        if (!hasAutoPlayedRef.current && !selectedId && !isPlaying && !checking) {
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
                    await loadInstrument(state.currentInstrument);
                    // Additional delay to ensure everything is stable
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    // Final validation before playing
                    if (question && question.notes && question.notes.length > 0 && !isPlaying) {
                        playScale();
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
    }, [question, selectedId, isPlaying, checking, playScale]);

    const handleAnswer = (id: string) => {
        if (checking || !question || isPlaying) return;

        setSelectedId(id);
        setChecking(true);

        const isCorrect = id === question.scaleId;

        if (isCorrect) {
            setCorrectId(id);
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 2000);
            
            const newStreak = streak + 1;
            const newRunProgress = runProgress + 1;
            const isPerfectRun = newRunProgress === 10;
            
            // Update stats
            let stats = loadStats();
            stats = recordAnswer(stats, true, 'scale', isPerfectRun);
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
            setCorrectId(question.scaleId);
            
            // Update stats
            let stats = loadStats();
            stats = recordAnswer(stats, false, 'scale');
            saveStats(stats);
            
            onWrong();
        }
    };

    const handleNext = () => {
        setSelectedId(null);
        setCorrectId(null);
        setChecking(false);
        const newQuestion = generateScaleQuestion(difficulty);
        setQuestion(newQuestion);
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
                    title="Scales"
                    difficulty={difficulty}
                    streak={streak}
                    runProgress={runProgress}
                    tip="Best results: short daily practice."
                />

                <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center">
                    <div className="card w-full max-w-xl mx-auto mb-8 bg-white/50 backdrop-blur-sm">
                        <RoundControls
                            onPlay={playScale}
                            onReplay={playScale}
                            isPlaying={isPlaying}
                            label="Play"
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
                            multiplier={streak >= 20 ? 4 : streak >= 10 ? 3 : streak >= 5 ? 2 : 1}
                            onShowParticles={() => setShowParticles(true)}
                        />
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

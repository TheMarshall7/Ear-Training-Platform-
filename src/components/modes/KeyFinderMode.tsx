import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { generateKeyFinderQuestion, type KeyFinderQuestion } from '../../logic/trainers/keyFinderTrainer';
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

interface KeyFinderModeProps {
    difficulty: Difficulty;
    streak: number;
    runProgress: number;
    onCorrect: (points: number) => void;
    onWrong: () => void;
    onNext: () => void;
}

export const KeyFinderMode: React.FC<KeyFinderModeProps> = ({
    difficulty,
    streak,
    runProgress,
    onCorrect,
    onWrong,
    onNext
}) => {
    const navigate = useNavigate();
    const { state } = useGame();
    const [question, setQuestion] = useState<KeyFinderQuestion | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [correctKey, setCorrectKey] = useState<string | null>(null);
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
            fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyFinderMode.tsx:initEffect:willLoad',message:'Difficulty changed, will load question',data:{difficulty,wasInitialized:hasInitializedRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            
            hasInitializedRef.current = true;
            lastDifficultyRef.current = difficulty;
            
            const newQuestion = generateKeyFinderQuestion(difficulty);
            setQuestion(newQuestion);
            hasAutoPlayedRef.current = false;
        } else {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/f5df97dd-5c11-4203-9fc6-7cdc14ae8fb5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'KeyFinderMode.tsx:initEffect:skipped',message:'Skipped duplicate init effect',data:{difficulty},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
        }
    }, [difficulty]);

    const playProgression = useCallback(async () => {
        if (!question || isPlaying) return;
        setIsPlaying(true);

        try {
            if (!question.chordSequence || question.chordSequence.length === 0) {
                setIsPlaying(false);
                return;
            }
            
            // Force recreate audio context on user interaction
            await audioEngine.init(true);
            await loadInstrument(state.currentInstrument);
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Double-check question is still valid
            if (!question || !question.chordSequence) {
                setIsPlaying(false);
                return;
            }
            
            // Play the chord progression using the audio engine
            // Tempo: 800ms per chord (slower for easier listening)
            const sampleId = getInstrumentSampleId(state.currentInstrument);
            audioEngine.playChordSequence(question.chordSequence, 800, sampleId, 60);
            
            // Calculate total duration: (number of chords * tempo) + extra buffer
            const totalDuration = question.chordSequence.length * 800 + 500;
            
            setTimeout(() => {
                setIsPlaying(false);
            }, totalDuration);
        } catch (error) {
            console.error('Error playing progression:', error);
            setIsPlaying(false);
        }
    }, [question, isPlaying]);

    // Auto-play once when question loads
    useEffect(() => {
        if (!question || !question.chordSequence || question.chordSequence.length === 0) {
            return;
        }
        
        if (!hasAutoPlayedRef.current && !selectedKey && !isPlaying && !checking) {
            hasAutoPlayedRef.current = true;
            const timer = setTimeout(async () => {
                if (!question || !question.chordSequence) {
                    hasAutoPlayedRef.current = false;
                    return;
                }
                
                try {
                    await audioEngine.init();
                    await loadInstrument(state.currentInstrument);
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    if (question && question.chordSequence && !isPlaying) {
                        playProgression();
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
    }, [question, selectedKey, isPlaying, checking, playProgression]);

    const handleAnswer = (key: string) => {
        if (checking || !question || isPlaying) return;

        setSelectedKey(key);
        setChecking(true);

        const isCorrect = key === question.targetKey;

        if (isCorrect) {
            setCorrectKey(key);
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 2000);
            
            const newStreak = streak + 1;
            const newRunProgress = runProgress + 1;
            const isPerfectRun = newRunProgress === 10;
            
            // Update stats
            let stats = loadStats();
            stats = recordAnswer(stats, true, 'keyFinder', isPerfectRun);
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
            setCorrectKey(question.targetKey);
            
            // Update stats
            let stats = loadStats();
            stats = recordAnswer(stats, false, 'keyFinder');
            saveStats(stats);
            
            onWrong();
        }
    };

    const handleNext = () => {
        setSelectedKey(null);
        setCorrectKey(null);
        setChecking(false);
        hasAutoPlayedRef.current = false;
        const newQuestion = generateKeyFinderQuestion(difficulty);
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
                    title="Key Finder"
                    difficulty={difficulty}
                    streak={streak}
                    runProgress={runProgress}
                    tip="Listen to the progression and identify the key."
                />

                <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center">
                    <div className="card w-full max-w-xl mx-auto mb-8 bg-white/50 backdrop-blur-sm">
                        <RoundControls
                            onPlay={playProgression}
                            onReplay={playProgression}
                            isPlaying={isPlaying}
                            label="Play Progression"
                        />
                    </div>

                    <AnswerGrid
                        options={question.options}
                        onSelect={handleAnswer}
                        disabled={checking || isPlaying}
                        selectedId={selectedKey}
                        correctId={correctKey}
                    />
                </div>

                {checking && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-6 flex flex-col items-center animate-slide-up pb-8">
                        <Feedback 
                            correct={correctKey === selectedKey} 
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

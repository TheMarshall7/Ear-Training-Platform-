import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { generatePerfectPitchQuestion, type PerfectPitchQuestion } from '../../logic/trainers/perfectPitchTrainer';
import { audioEngine } from '../../audio/audioEngine';
import { loadInstrument, getInstrumentSampleId } from '../../audio/sampleLoader';
import { noteNameToMidi } from '../../config/harmonyRules';
import { ModeHeader } from '../ModeHeader';
import { RoundControls } from '../RoundControls';
import { NoteButtonGrid } from '../NoteButtonGrid';
import { Feedback } from '../Feedback';
import { ProgressMeter } from '../ProgressMeter';
import { ParticleEffect } from '../ParticleEffect';
import { BrandLogo } from '../BrandLogo';
import { Footer } from '../Footer';
import { recordAnswer, updateBestStreak, loadStats, saveStats } from '../../logic/statsTracker';
import { updateChallengeProgress, getDailyChallenges } from '../../logic/dailyChallenges';
import type { Difficulty } from '../../types/game';

interface PerfectPitchModeProps {
    difficulty: Difficulty;
    streak: number;
    runProgress: number;
    onCorrect: (points: number) => void;
    onWrong: () => void;
    onNext: () => void;
}

export const PerfectPitchMode: React.FC<PerfectPitchModeProps> = ({
    difficulty,
    streak,
    runProgress,
    onCorrect,
    onWrong,
    onNext
}) => {
    const navigate = useNavigate();
    const { state } = useGame();
    const [question, setQuestion] = useState<PerfectPitchQuestion | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedNote, setSelectedNote] = useState<string | null>(null);
    const [correctNote, setCorrectNote] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);
    const [showParticles, setShowParticles] = useState(false);
    const [dailyChallenges, setDailyChallenges] = useState(getDailyChallenges());
    const hasAutoPlayedRef = useRef(false);

    useEffect(() => {
        // Only load instrument once, not on every difficulty change
        // It will be loaded when needed in play functions
        const newQuestion = generatePerfectPitchQuestion(difficulty);
        setQuestion(newQuestion);
        hasAutoPlayedRef.current = false; // Reset for new question
    }, [difficulty]);

    const playNote = useCallback(async () => {
        if (!question || isPlaying) return;
        setIsPlaying(true);

        try {
            // Ensure we have a valid question before initializing audio
            if (!question.targetNote) {
                setIsPlaying(false);
                return;
            }
            
            // Force recreate audio context on user interaction
            await audioEngine.init();
            await loadInstrument(state.currentInstrument);
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Double-check question is still valid
            if (!question || !question.targetNote) {
                setIsPlaying(false);
                return;
            }
            
            // Play ONLY the single note - no chords
            const midiNote = noteNameToMidi(question.targetNote, 4);
            const sampleId = getInstrumentSampleId(state.currentInstrument);
            audioEngine.playNote(sampleId, midiNote, 60, 0, 1.0);
            
            setTimeout(() => {
                setIsPlaying(false);
            }, 1500);
        } catch (error) {
            console.error('Error playing note:', error);
            setIsPlaying(false);
        }
    }, [question, isPlaying]);

    // Auto-play once when question loads
    useEffect(() => {
        // Only auto-play if question is fully ready and we haven't played yet
        if (!question || !question.targetNote) {
            return;
        }
        
        if (!hasAutoPlayedRef.current && !selectedNote && !isPlaying && !checking) {
            hasAutoPlayedRef.current = true;
            const timer = setTimeout(async () => {
                // Double-check question is still valid before playing
                if (!question || !question.targetNote) {
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
                    if (question && question.targetNote && !isPlaying) {
                        playNote();
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
    }, [question, selectedNote, isPlaying, checking, playNote]);

    const handleAnswer = (note: string) => {
        if (checking || !question || isPlaying) return;

        setSelectedNote(note);
        setChecking(true);

        const isCorrect = note === question.targetNote;

        if (isCorrect) {
            setCorrectNote(note);
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 2000);
            
            const newStreak = streak + 1;
            const newRunProgress = runProgress + 1;
            const isPerfectRun = newRunProgress === 10;
            
            // Update stats
            let stats = loadStats();
            stats = recordAnswer(stats, true, 'perfectPitch', isPerfectRun);
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
            setCorrectNote(question.targetNote);
            
            // Update stats
            let stats = loadStats();
            stats = recordAnswer(stats, false, 'perfectPitch');
            saveStats(stats);
            
            onWrong();
        }
    };

    const handleNext = () => {
        setSelectedNote(null);
        setCorrectNote(null);
        setChecking(false);
        hasAutoPlayedRef.current = false; // Reset for new question
        const newQuestion = generatePerfectPitchQuestion(difficulty);
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
                    title="Perfect Pitch"
                    difficulty={difficulty}
                    streak={streak}
                    runProgress={runProgress}
                    tip="Best results: short daily practice."
                />

                <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center">
                    <div className="card w-full max-w-xl mx-auto mb-8 bg-white/50 backdrop-blur-sm">
                        <RoundControls
                            onPlay={playNote}
                            onReplay={playNote}
                            isPlaying={isPlaying}
                            label="Play"
                        />
                    </div>

                    <NoteButtonGrid
                        notes={question.allowedNotes}
                        onSelect={handleAnswer}
                        disabled={checking || isPlaying}
                        selectedNote={selectedNote}
                        correctNote={correctNote}
                    />
                </div>

                {checking && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-6 flex flex-col items-center animate-slide-up pb-8">
                        <Feedback 
                            correct={correctNote === selectedNote} 
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

/**
 * Tempo Trainer Logic
 * 
 * Generates tempo (BPM) identification questions for the tempo training mode.
 * This mode plays a metronome or rhythm pattern at a specific tempo,
 * and the user must identify the BPM (beats per minute).
 * 
 * This module:
 * - Generates random tempos between 60-180 BPM
 * - Provides scoring based on accuracy (±3 BPM = Perfect, ±6 BPM = Close)
 * - Returns timing information for metronome playback
 */

import type { Difficulty } from '../../types/game';

/**
 * Tempo ranges by difficulty
 */
const TEMPO_RANGES: Record<Difficulty, { min: number; max: number; step: number }> = {
    easy: { min: 80, max: 140, step: 10 },    // Easier to distinguish, rounded to 10s
    medium: { min: 70, max: 160, step: 5 },   // Mid-range, rounded to 5s
    hard: { min: 60, max: 180, step: 1 }      // Full range, any BPM
};

/**
 * Number of beats to play
 */
const BEATS_TO_PLAY: Record<Difficulty, number> = {
    easy: 8,     // 8 beats (2 bars of 4/4)
    medium: 12,  // 12 beats (3 bars of 4/4)
    hard: 16     // 16 beats (4 bars of 4/4)
};

/**
 * Accuracy thresholds for scoring
 */
export const TEMPO_ACCURACY = {
    PERFECT: 3,  // Within ±3 BPM
    CLOSE: 6,    // Within ±6 BPM
    MISS: 999    // Everything else
};

/**
 * Question data structure for tempo identification
 */
export interface TempoQuestion {
    /** The target tempo in BPM */
    targetBPM: number;
    
    /** Number of beats to play */
    beatsToPlay: number;
    
    /** Time between beats in milliseconds */
    beatInterval: number;
    
    /** Suggested tempo range for UI slider */
    minBPM: number;
    maxBPM: number;
}

/**
 * Result of checking a tempo answer
 */
export interface TempoAnswerResult {
    /** Whether the answer is correct (within acceptable range) */
    isCorrect: boolean;
    
    /** Accuracy level: 'perfect', 'close', or 'miss' */
    accuracy: 'perfect' | 'close' | 'miss';
    
    /** Difference between user's guess and target (in BPM) */
    difference: number;
    
    /** Points earned for this answer */
    points: number;
}

/**
 * Generate a random tempo identification question
 * 
 * The question includes:
 * - A random BPM within the difficulty range
 * - Number of beats to play
 * - Timing information for playback
 * 
 * @param difficulty - Difficulty level ('easy', 'medium', 'hard')
 * @returns Complete tempo question
 */
export const generateTempoQuestion = (difficulty: Difficulty): TempoQuestion => {
    const range = TEMPO_RANGES[difficulty];
    
    // Generate random BPM within range, aligned to step
    const steps = Math.floor((range.max - range.min) / range.step) + 1;
    const randomStep = Math.floor(Math.random() * steps);
    const targetBPM = range.min + (randomStep * range.step);
    
    // Calculate beat interval in milliseconds
    // 60,000 ms per minute / BPM = ms per beat
    const beatInterval = 60000 / targetBPM;
    
    return {
        targetBPM,
        beatsToPlay: BEATS_TO_PLAY[difficulty],
        beatInterval,
        minBPM: range.min,
        maxBPM: range.max
    };
};

/**
 * Check if a tempo answer is correct and calculate points
 * 
 * Scoring:
 * - Perfect (±3 BPM): 50 points
 * - Close (±6 BPM): 30 points
 * - Miss: 0 points
 * 
 * @param targetBPM - The correct BPM
 * @param userBPM - User's guess
 * @returns Result including accuracy, points, and correctness
 */
export const checkTempoAnswer = (targetBPM: number, userBPM: number): TempoAnswerResult => {
    const difference = Math.abs(targetBPM - userBPM);
    
    let accuracy: 'perfect' | 'close' | 'miss';
    let points: number;
    let isCorrect: boolean;
    
    if (difference <= TEMPO_ACCURACY.PERFECT) {
        accuracy = 'perfect';
        points = 50;
        isCorrect = true;
    } else if (difference <= TEMPO_ACCURACY.CLOSE) {
        accuracy = 'close';
        points = 30;
        isCorrect = true;
    } else {
        accuracy = 'miss';
        points = 0;
        isCorrect = false;
    }
    
    return {
        isCorrect,
        accuracy,
        difference,
        points
    };
};

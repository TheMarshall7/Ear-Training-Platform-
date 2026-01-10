/**
 * Melody Trainer Logic
 * 
 * Generates melody identification questions where users identify scale degrees
 * of each note in a melodic sequence.
 * 
 * This module:
 * - Loads curated melody configurations from JSON
 * - Filters melodies by difficulty level
 * - Generates questions with complete melodic sequences
 * - Provides note sequences and degree sequences for validation
 * 
 * Flow:
 * 1. Play a short melodic phrase
 * 2. User inputs the scale degree of each note in sequence
 * 3. Validation checks each position for correctness
 */

import melodiesConfig from '../../config/melodies.json';
import { degreeToNoteName } from '../../config/harmonyRules';
import type { Difficulty } from '../../types/game';

/**
 * Question data structure for melody identification.
 * Contains the complete melodic sequence and metadata.
 */
export interface MelodyQuestion {
    /** Unique identifier for the melody */
    melodyId: string;
    
    /** Optional name/description of the melody */
    name: string;
    
    /** Array of scale degrees (1-7) forming the melody */
    degrees: number[];
    
    /** Array of note names converted from degrees */
    notes: string[];
    
    /** Tempo in milliseconds between notes */
    tempoMs: number;
    
    /** Musical structure tag (e.g., "period", "sentence", "basicIdea") */
    structureTag: string;
}

/**
 * Generate a random melody identification question.
 * 
 * The question includes:
 * - A complete melodic sequence (3-12 notes depending on difficulty)
 * - Note names for playback
 * - Scale degrees for validation
 * 
 * Easy: 3-5 notes, stepwise motion, clear tonic emphasis
 * Medium: 5-8 notes, simple phrases
 * Hard: 8-12 notes, varied contour, more complex phrases
 * 
 * @param difficulty - Difficulty level ('easy', 'medium', 'hard')
 * @returns Complete melody question with sequence data
 */
export const generateMelodyQuestion = (difficulty: Difficulty): MelodyQuestion => {
    // Filter melodies by difficulty level
    const possibleMelodies = melodiesConfig.melodies.filter(m => m.difficulty === difficulty);

    // Fallback to first melody if none found for this difficulty
    if (possibleMelodies.length === 0) {
        const fallback = melodiesConfig.melodies[0];
        return {
            melodyId: fallback.id,
            name: fallback.name,
            degrees: fallback.degrees,
            notes: fallback.degrees.map(d => degreeToNoteName(d)),
            tempoMs: fallback.tempoMs,
            structureTag: fallback.structureTag
        };
    }

    // Randomly select a melody from the difficulty-appropriate pool
    const target = possibleMelodies[Math.floor(Math.random() * possibleMelodies.length)];

    // Convert scale degrees to note names (in C major)
    // This provides the actual notes for audio playback
    const notes = target.degrees.map(degree => degreeToNoteName(degree));

    return {
        melodyId: target.id,
        name: target.name,
        degrees: target.degrees,
        notes,
        tempoMs: target.tempoMs,
        structureTag: target.structureTag
    };
};

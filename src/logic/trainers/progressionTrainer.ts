/**
 * Progression Trainer Logic
 * 
 * Generates chord progression identification questions.
 * A progression is a sequence of chords that establishes a key and creates musical movement.
 * 
 * This module:
 * - Uses progressionGenerator to create musically valid progressions
 * - Validates user input step-by-step as they build the progression
 * - Calculates points based on difficulty and progression length
 * - Manages round state for progression mode
 * 
 * Flow:
 * 1. Generate a progression using harmony rules
 * 2. Play chords one at a time
 * 3. User inputs scale degrees step-by-step
 * 4. Validate each step immediately
 * 5. Calculate points when complete
 */

import { generateProgression, createSessionState, type SessionState } from '../progressionGenerator';
import { degreeToMidiChord } from '../../config/harmonyRules';
import type { Difficulty } from '../../types/game';

/**
 * Question data structure for progression identification.
 * Contains the target progression and MIDI chord specifications.
 */
export interface ProgressionQuestion {
    /** Array of scale degrees (1-7) forming the target progression */
    targetDegrees: number[];
    
    /** Array of chord specifications with MIDI notes for each degree */
    chordSpecs: Array<{ 
        degree: number; 
        midiNotes: number[] 
    }>;
}

/**
 * Round state for progression mode.
 * Tracks question, user input, validation results, and session state.
 */
export interface ProgressionRoundState {
    /** Current progression question, or null if not yet generated */
    question: ProgressionQuestion | null;
    
    /** User's input sequence of scale degrees */
    userDegrees: number[];
    
    /** Final outcome: 'success', 'fail', or null if not yet resolved */
    resolvedOutcome: 'success' | 'fail' | null;
    
    /** Index of the step where user made an error, or null if no error */
    wrongAtStep: number | null;
    
    /** Points earned for this round */
    pointsEarned: number;
    
    /** Session state for progression generation (tracks history, cadences, etc.) */
    sessionState: SessionState;
}

/**
 * Generate a new progression question.
 * 
 * Uses harmony rules to generate musically valid progressions.
 * Validates all degrees and chord specs before returning.
 * 
 * @param difficulty - Difficulty level ('easy', 'medium', 'hard')
 * @param sessionState - Session state for progression generation
 * @returns Complete progression question with chord specs
 */
export function generateProgressionQuestion(
    difficulty: Difficulty,
    sessionState: SessionState
): ProgressionQuestion {
    try {
        // Generate progression using harmony rules
        const degrees = generateProgression(difficulty, sessionState);
        
        // Validate degrees exist and are non-empty
        if (!degrees || degrees.length === 0) {
            throw new Error('Generated empty progression');
        }

        // Validate all degrees are in valid range (1-7)
        const validDegrees = degrees.filter(d => d >= 1 && d <= 7);
        if (validDegrees.length !== degrees.length) {
            console.warn('Some degrees were invalid, using valid ones only');
            if (validDegrees.length === 0) {
                throw new Error('No valid degrees in progression');
            }
        }
        
        console.log('Generated progression degrees:', validDegrees);
        
        // Convert each degree to MIDI chord notes
        const chordSpecs = validDegrees.map(degree => {
            const midiNotes = degreeToMidiChord(degree);
            if (midiNotes.length === 0) {
                console.error(`Failed to generate MIDI notes for degree ${degree}`);
                // Return a fallback chord (C major triad)
                return {
                    degree,
                    midiNotes: [60, 64, 67] // C4, E4, G4
                };
            }
            return {
                degree,
                midiNotes
            };
        });

        // Validate all chord specs have notes
        const validSpecs = chordSpecs.filter(spec => spec.midiNotes && spec.midiNotes.length > 0);
        if (validSpecs.length !== chordSpecs.length) {
            console.warn('Some chord specs are invalid');
        }

        console.log('Chord specs:', validSpecs);

        if (validSpecs.length === 0) {
            throw new Error('No valid chord specs generated');
        }

        return {
            targetDegrees: validDegrees,
            chordSpecs: validSpecs
        };
    } catch (error) {
        console.error('Error in generateProgressionQuestion:', error);
        // Return a safe fallback progression (I-V-I)
        return {
            targetDegrees: [1, 5, 1],
            chordSpecs: [
                { degree: 1, midiNotes: [60, 64, 67] }, // C major
                { degree: 5, midiNotes: [67, 71, 74] }, // G major
                { degree: 1, midiNotes: [60, 64, 67] }  // C major
            ]
        };
    }
}

/**
 * Validate user input step-by-step as they build the progression.
 * 
 * This function checks if the most recently entered degree matches
 * the expected degree at that position. It's called after each user input.
 * 
 * @param targetDegrees - The correct progression sequence
 * @param userDegrees - The user's input sequence so far
 * @returns Validation result with error position and completion status
 */
export function validateProgressionStep(
    targetDegrees: number[],
    userDegrees: number[]
): { isValid: boolean; wrongAtStep: number | null; isComplete: boolean } {
    // Empty input is valid (user hasn't started yet)
    if (userDegrees.length === 0) {
        return { isValid: true, wrongAtStep: null, isComplete: false };
    }

    // Check the most recently entered degree
    const currentIndex = userDegrees.length - 1;
    
    // Compare last entered degree with expected degree at this position
    if (userDegrees[currentIndex] !== targetDegrees[currentIndex]) {
        return {
            isValid: false,
            wrongAtStep: currentIndex,
            isComplete: false
        };
    }

    // Check if progression is complete (all degrees entered correctly)
    const isComplete = userDegrees.length === targetDegrees.length;
    
    return {
        isValid: true,
        wrongAtStep: null,
        isComplete
    };
}

/**
 * Calculate points for a completed progression.
 * 
 * Points are based on:
 * - Difficulty level (base points)
 * - Progression length (bonus points per chord)
 * 
 * @param difficulty - Difficulty level
 * @param isCorrect - Whether the progression was completed correctly
 * @param length - Number of chords in the progression
 * @returns Points earned (0 if incorrect)
 */
export function calculatePoints(
    difficulty: Difficulty,
    isCorrect: boolean,
    length: number
): number {
    if (!isCorrect) return 0;

    // Base points vary by difficulty
    const basePoints = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 30 : 40;
    
    // Bonus points for longer progressions (5 points per chord)
    const lengthBonus = length * 5;
    
    return basePoints + lengthBonus;
}

/**
 * Create initial round state for a new progression question.
 * 
 * @returns Fresh round state with empty question and user input
 */
export function createProgressionRoundState(): ProgressionRoundState {
    return {
        question: null,
        userDegrees: [],
        resolvedOutcome: null,
        wrongAtStep: null,
        pointsEarned: 0,
        sessionState: createSessionState()
    };
}

import { generateProgression, createSessionState, type SessionState } from './progressionGenerator';
import { degreeToMidiChord } from '../config/harmonyRules';
import type { Difficulty } from './GameContext';

export interface ProgressionQuestion {
    targetDegrees: number[];
    chordSpecs: Array<{ degree: number; midiNotes: number[] }>;
}

export interface ProgressionRoundState {
    question: ProgressionQuestion | null;
    userDegrees: number[];
    resolvedOutcome: 'success' | 'fail' | null;
    wrongAtStep: number | null; // Step index where user went wrong
    pointsEarned: number;
    sessionState: SessionState;
}

/**
 * Generate a new progression question
 */
export function generateProgressionQuestion(
    difficulty: Difficulty,
    sessionState: SessionState
): ProgressionQuestion {
    try {
        const degrees = generateProgression(difficulty, sessionState);
        
        // Validate degrees
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
        
        const chordSpecs = validDegrees.map(degree => {
            const midiNotes = degreeToMidiChord(degree);
            if (midiNotes.length === 0) {
                console.error(`Failed to generate MIDI notes for degree ${degree}`);
                // Return a fallback chord (C major)
                return {
                    degree,
                    midiNotes: [60, 64, 67] // C major
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
        // Return a safe fallback
        return {
            targetDegrees: [1, 5, 1],
            chordSpecs: [
                { degree: 1, midiNotes: [60, 64, 67] },
                { degree: 5, midiNotes: [67, 71, 74] },
                { degree: 1, midiNotes: [60, 64, 67] }
            ]
        };
    }
}

/**
 * Validate user input step-by-step
 * Returns: { isValid: boolean, wrongAtStep: number | null, isComplete: boolean }
 */
export function validateProgressionStep(
    targetDegrees: number[],
    userDegrees: number[]
): { isValid: boolean; wrongAtStep: number | null; isComplete: boolean } {
    // Check if current step is correct
    if (userDegrees.length === 0) {
        return { isValid: true, wrongAtStep: null, isComplete: false };
    }

    const currentIndex = userDegrees.length - 1;
    
    // Check if the last entered degree matches
    if (userDegrees[currentIndex] !== targetDegrees[currentIndex]) {
        return {
            isValid: false,
            wrongAtStep: currentIndex,
            isComplete: false
        };
    }

    // Check if progression is complete
    const isComplete = userDegrees.length === targetDegrees.length;
    
    return {
        isValid: true,
        wrongAtStep: null,
        isComplete
    };
}

/**
 * Calculate points for a completed progression
 */
export function calculatePoints(
    difficulty: Difficulty,
    isCorrect: boolean,
    length: number
): number {
    if (!isCorrect) return 0;

    const basePoints = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 30 : 40;
    const lengthBonus = length * 5; // Bonus for longer progressions
    
    return basePoints + lengthBonus;
}

/**
 * Create initial round state
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

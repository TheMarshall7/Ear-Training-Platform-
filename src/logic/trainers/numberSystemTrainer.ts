/**
 * Number System Trainer Logic
 * 
 * Generates scale degree identification questions using the Nashville Number System.
 * The number system identifies notes by their position (degree) in a scale.
 * 
 * This module:
 * - Loads chord progression configurations from JSON
 * - Generates questions that establish a key via progression
 * - Tests ability to identify scale degrees (1-7) within that key
 * 
 * Flow:
 * 1. Play a chord progression to establish the key (C major)
 * 2. Play a single note
 * 3. User identifies the scale degree of that note
 */

import numberSystemConfig from '../../config/numberSystem.json';
import { degreeToMidiChord, degreeToNoteName } from '../../config/harmonyRules';
import type { Difficulty } from '../../types/game';

/**
 * Question data structure for number system identification.
 * Contains progression data and target note information.
 */
export interface NumberSystemQuestion {
    /** Array of scale degrees forming the key-establishing progression */
    progressionDegrees: number[];
    
    /** Array of MIDI note arrays, one for each chord in the progression */
    progressionChords: number[][];
    
    /** Note name of the target note to identify (e.g., "C", "D", "E") */
    targetNote: string;
    
    /** Scale degree of the target note (1-7) */
    targetDegree: number;
    
    /** MIDI note number for the target note */
    targetMidi: number;
    
    /** Array of allowed scale degrees for this difficulty */
    allowedDegrees: number[];
    
    /** Array of multiple choice options (degree numbers as strings) */
    options: { id: string; name: string }[];
}

/**
 * Generate a random number system identification question.
 * 
 * The question includes:
 * - A chord progression to establish the key (always C major in MVP)
 * - A single target note to identify by scale degree
 * - Multiple choice options showing scale degrees (1-7)
 * 
 * @param difficulty - Difficulty level ('easy', 'medium', 'hard')
 * @returns Complete number system question with progression and target
 */
export const generateNumberSystemQuestion = (difficulty: Difficulty): NumberSystemQuestion => {
    // Get progressions and difficulty config from JSON
    const progressions = numberSystemConfig.progressions;
    const difficultyConfig = numberSystemConfig.difficulties[difficulty];
    const allowedDegrees = difficultyConfig?.allowedDegrees || [1, 2, 3, 4, 5, 6, 7];

    // Randomly select a progression to establish the key
    const progression = progressions[Math.floor(Math.random() * progressions.length)];
    const progressionDegrees = progression.degrees;

    // Convert progression degrees to MIDI chord arrays
    // Each degree becomes a triad in root position
    const progressionChords = progressionDegrees.map(degree => degreeToMidiChord(degree));

    // Randomly select target degree from allowed pool
    const targetDegree = allowedDegrees[Math.floor(Math.random() * allowedDegrees.length)];
    
    // Convert target degree to note name (in C major)
    const targetNote = degreeToNoteName(targetDegree);
    
    // Map scale degrees to MIDI notes (C4 = 60 as base)
    // This creates a consistent pitch reference
    const SCALE_DEGREES: Record<number, number> = {
        1: 60, // C4
        2: 62, // D4
        3: 64, // E4
        4: 65, // F4
        5: 67, // G4
        6: 69, // A4
        7: 71  // B4
    };
    const targetMidi = SCALE_DEGREES[targetDegree] || 60;

    // Options are all allowed degrees as strings
    // User selects the degree number (1-7) that matches the target note
    const options = allowedDegrees.map(degree => ({
        id: degree.toString(),
        name: degree.toString()
    }));

    return {
        progressionDegrees,
        progressionChords,
        targetNote,
        targetDegree,
        targetMidi,
        allowedDegrees,
        options
    };
};

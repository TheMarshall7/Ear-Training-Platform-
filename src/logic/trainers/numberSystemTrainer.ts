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
 * Common functional progressions that sound natural and practical.
 * These are weighted more heavily (80%) to reinforce real-world patterns.
 */
const COMMON_FUNCTIONAL_PROGRESSIONS = [
    [1, 4, 5, 1],      // I-IV-V-I (most common)
    [1, 5, 6, 4],      // I-V-vi-IV (pop progression)
    [2, 5, 1],         // ii-V-I (jazz standard)
    [1, 6, 4, 5],      // I-vi-IV-V (50s progression)
    [1, 4, 1, 5],      // I-IV-I-V
    [1, 5, 1],         // I-V-I (simple)
    [4, 5, 1],         // IV-V-I (plagal resolution)
    [6, 4, 1, 5],      // vi-IV-I-V (relative minor start)
    [1, 6, 2, 5, 1],   // I-vi-ii-V-I (circle progression)
    [2, 5, 6, 1]       // ii-V-vi-I (deceptive resolution)
];

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

    // 80% chance to use a common functional progression, 20% chance for exploratory
    const useCommon = Math.random() < 0.8;
    let progressionDegrees: number[];
    
    if (useCommon) {
        // Select from common functional progressions
        progressionDegrees = COMMON_FUNCTIONAL_PROGRESSIONS[
            Math.floor(Math.random() * COMMON_FUNCTIONAL_PROGRESSIONS.length)
        ];
    } else {
        // Select from full progression library for variety
        const progression = progressions[Math.floor(Math.random() * progressions.length)];
        progressionDegrees = progression.degrees;
    }

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
    const shuffledOptions = options
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    return {
        progressionDegrees,
        progressionChords,
        targetNote,
        targetDegree,
        targetMidi,
        allowedDegrees,
        options: shuffledOptions
    };
};

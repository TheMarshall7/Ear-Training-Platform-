/**
 * Perfect Pitch Trainer Logic
 * 
 * Generates perfect pitch identification questions.
 * Perfect pitch is the ability to identify a note by name without a reference.
 * 
 * This module:
 * - Loads note pool configurations from JSON
 * - Filters allowed notes by difficulty level
 * - Generates random single-note questions
 * - Provides note names for identification
 */

import perfectPitchConfig from '../../config/perfectPitch.json';
import type { Difficulty } from '../../types/game';

/**
 * Question data structure for perfect pitch identification.
 * Contains the target note and available options.
 */
export interface PerfectPitchQuestion {
    /** The note name to identify (e.g., "C", "D", "E") */
    targetNote: string;
    
    /** Array of all allowed note names for this difficulty */
    allowedNotes: string[];
    
    /** Array of multiple choice options (all allowed notes) */
    options: { id: string; name: string }[];
}

/**
 * Generate a random perfect pitch identification question.
 * 
 * The question includes:
 * - A single target note to identify
 * - All allowed notes for this difficulty as options
 * 
 * Easy: 3 notes (C, G, D)
 * Medium: 6 notes (C, D, E, F, G, A)
 * Hard: 7 notes (all diatonic: C, D, E, F, G, A, B)
 * 
 * @param difficulty - Difficulty level ('easy', 'medium', 'hard')
 * @returns Complete perfect pitch question with options
 */
export const generatePerfectPitchQuestion = (difficulty: Difficulty): PerfectPitchQuestion => {
    // Get allowed notes for this difficulty from config
    const difficultyConfig = perfectPitchConfig.difficulties[difficulty];
    const allowedNotes = difficultyConfig?.allowedNotes || ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

    // Randomly select the target note from allowed pool
    const targetNote = allowedNotes[Math.floor(Math.random() * allowedNotes.length)];

    // Options are all allowed notes (user must identify which one was played)
    const options = allowedNotes.map(note => ({
        id: note,
        name: note
    }));
    const shuffledOptions = options
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    return {
        targetNote,
        allowedNotes,
        options: shuffledOptions
    };
};

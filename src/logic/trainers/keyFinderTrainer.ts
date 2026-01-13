/**
 * Key Finder Trainer Logic
 * 
 * Generates key identification questions for the key finder training mode.
 * This mode plays chord progressions that strongly imply a specific key,
 * and the user must identify which key the progression is in.
 * 
 * This module:
 * - Generates progressions in all 12 major keys
 * - Uses common progressions (I-IV-V, I-vi-IV-V, ii-V-I, etc.)
 * - Provides multiple choice options for key identification
 * - Validates user answers
 */

import type { Difficulty } from '../../types/game';

/**
 * All 12 major keys
 */
const MAJOR_KEYS = [
    'C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'
] as const;

/**
 * Map each major key to its tonic MIDI note (in octave 4)
 */
const KEY_TO_MIDI: Record<string, number> = {
    'C': 60,   // C4
    'Db': 61,  // C#4/Db4
    'D': 62,   // D4
    'Eb': 63,  // D#4/Eb4
    'E': 64,   // E4
    'F': 65,   // F4
    'F#': 66,  // F#4/Gb4
    'G': 67,   // G4
    'Ab': 68,  // G#4/Ab4
    'A': 69,   // A4
    'Bb': 70,  // A#4/Bb4
    'B': 71    // B4
};

/**
 * Chord progression templates
 * Each template is an array of scale degrees (1-7) in Roman numeral order
 */
interface ProgressionTemplate {
    name: string;
    degrees: number[];
    difficulties: Difficulty[];
}

const PROGRESSION_TEMPLATES: ProgressionTemplate[] = [
    // Easy progressions
    { name: 'I-V-I', degrees: [1, 5, 1], difficulties: ['easy', 'medium', 'hard'] },
    { name: 'I-IV-V-I', degrees: [1, 4, 5, 1], difficulties: ['easy', 'medium', 'hard'] },
    { name: 'I-V-vi-IV', degrees: [1, 5, 6, 4], difficulties: ['easy', 'medium', 'hard'] },
    
    // Medium progressions
    { name: 'I-vi-IV-V', degrees: [1, 6, 4, 5], difficulties: ['medium', 'hard'] },
    { name: 'ii-V-I', degrees: [2, 5, 1], difficulties: ['medium', 'hard'] },
    { name: 'I-IV-vi-V', degrees: [1, 4, 6, 5], difficulties: ['medium', 'hard'] },
    
    // Hard progressions
    { name: 'I-iii-vi-IV-V', degrees: [1, 3, 6, 4, 5], difficulties: ['hard'] },
    { name: 'I-vi-ii-V-I', degrees: [1, 6, 2, 5, 1], difficulties: ['hard'] },
    { name: 'I-IV-I-V-vi-IV', degrees: [1, 4, 1, 5, 6, 4], difficulties: ['hard'] }
];

/**
 * Chord quality for each scale degree in a major key
 */
const CHORD_QUALITIES: Record<number, 'major' | 'minor' | 'diminished'> = {
    1: 'major',      // I
    2: 'minor',      // ii
    3: 'minor',      // iii
    4: 'major',      // IV
    5: 'major',      // V
    6: 'minor',      // vi
    7: 'diminished'  // vii°
};

/**
 * Chord interval patterns (semitones from root)
 */
const CHORD_INTERVALS: Record<string, number[]> = {
    major: [0, 4, 7],      // Root, Major 3rd, Perfect 5th
    minor: [0, 3, 7],      // Root, Minor 3rd, Perfect 5th
    diminished: [0, 3, 6]  // Root, Minor 3rd, Diminished 5th
};

/**
 * Major scale intervals (semitones from tonic)
 */
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

/**
 * Question data structure for key identification
 */
export interface KeyFinderQuestion {
    /** The target key to identify (e.g., "C", "G", "Bb") */
    targetKey: string;
    
    /** The progression template used */
    progressionName: string;
    
    /** Array of chord sequences (each chord is an array of MIDI notes) */
    chordSequence: number[][];
    
    /** Array of multiple choice options (includes correct answer) */
    options: { id: string; name: string }[];
}

/**
 * Convert a scale degree to MIDI notes for a chord in a given key
 * 
 * @param key - The key (e.g., "C", "G", "Bb")
 * @param degree - Scale degree (1-7)
 * @returns Array of MIDI note numbers forming the chord
 */
function degreeToChord(key: string, degree: number): number[] {
    const tonicMidi = KEY_TO_MIDI[key];
    const scaleInterval = MAJOR_SCALE_INTERVALS[degree - 1];
    const rootMidi = tonicMidi + scaleInterval;
    
    const chordQuality = CHORD_QUALITIES[degree];
    const intervals = CHORD_INTERVALS[chordQuality];
    
    return intervals.map(offset => rootMidi + offset);
}

/**
 * Generate a random key identification question
 * 
 * The question includes:
 * - A randomly selected major key
 * - A progression that strongly implies that key
 * - The chord sequence as MIDI notes for playback
 * - Multiple choice options (4 keys, including the correct one)
 * 
 * @param difficulty - Difficulty level ('easy', 'medium', 'hard')
 * @returns Complete key finder question with options
 */
export const generateKeyFinderQuestion = (difficulty: Difficulty): KeyFinderQuestion => {
    // Filter progressions available at this difficulty
    const availableProgressions = PROGRESSION_TEMPLATES.filter(
        template => template.difficulties.includes(difficulty)
    );
    
    // Randomly select a progression template
    const template = availableProgressions[
        Math.floor(Math.random() * availableProgressions.length)
    ];
    
    // Randomly select a key
    const targetKey = MAJOR_KEYS[Math.floor(Math.random() * MAJOR_KEYS.length)];
    
    // Generate the chord sequence
    const chordSequence = template.degrees.map(degree => 
        degreeToChord(targetKey, degree)
    );
    
    // Generate multiple choice options
    // Start with the correct answer
    const options = [{ id: targetKey, name: targetKey }];
    
    // Add 3 random distractor keys
    while (options.length < 4) {
        const randomKey = MAJOR_KEYS[Math.floor(Math.random() * MAJOR_KEYS.length)];
        // Avoid duplicates
        if (!options.find(opt => opt.id === randomKey)) {
            options.push({ id: randomKey, name: randomKey });
        }
    }
    
    // Shuffle options so correct answer isn't always first
    const shuffledOptions = options
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
    
    return {
        targetKey,
        progressionName: template.name,
        chordSequence,
        options: shuffledOptions
    };
};

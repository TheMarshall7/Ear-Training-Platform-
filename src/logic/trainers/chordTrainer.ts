/**
 * Chord Trainer Logic
 * 
 * Generates chord identification questions for the chord training mode.
 * A chord is a group of notes played simultaneously, typically 3 or more notes.
 * 
 * This module:
 * - Loads chord configurations from JSON
 * - Filters chords by difficulty level
 * - Generates random questions with multiple choice options
 * - Provides MIDI note arrays for chord playback
 */

import chordsConfig from '../../config/chords.json';
import gameModesConfig from '../../config/gameModes.json';

/**
 * Question data structure for chord identification.
 * Contains the target chord and multiple choice options.
 */
export interface ChordQuestion {
    /** Unique identifier for the chord type (e.g., "maj", "min", "dim") */
    chordId: string;
    
    /** Human-readable chord name (e.g., "Major", "Minor", "Diminished") */
    chordName: string;
    
    /** MIDI note number for the root note of the chord */
    rootMidi: number;
    
    /** Array of MIDI note numbers forming the complete chord */
    notes: number[];
    
    /** Array of multiple choice options (includes correct answer) */
    options: { id: string; name: string }[];
}

/**
 * Generate a random chord identification question.
 * 
 * The question includes:
 * - A root note in a comfortable range (C3 to C4)
 * - A complete chord built from the root using the chord's interval pattern
 * - 4 multiple choice options (correct answer + 3 distractors)
 * 
 * @param difficulty - Difficulty level ('easy', 'medium', 'hard')
 * @returns Complete chord question with options
 */
export const generateChordQuestion = (difficulty: string): ChordQuestion => {
    // Get allowed chord types for the specified difficulty
    const modeConfig = gameModesConfig.chord.find(m => m.id === difficulty) || gameModesConfig.chord[0];
    const allowedIds = modeConfig.chords;

    // Filter available chords to only those allowed at this difficulty
    const possibleChords = chordsConfig.filter(c => allowedIds.includes(c.id));
    
    // Randomly select the target chord to identify
    const target = possibleChords[Math.floor(Math.random() * possibleChords.length)];

    // Generate root note between C3 (48) and C4 (60)
    // This range provides good chord voicing
    const rootMidi = 36 + Math.floor(Math.random() * 12);

    // Build chord by adding interval offsets to root note
    // Each chord config defines intervals relative to root
    const notes = target.intervals.map(offset => rootMidi + offset);

    // Generate multiple choice options
    // Start with correct answer, then add random distractors
    const options = [target];
    while (options.length < 4 && options.length < possibleChords.length) {
        const random = possibleChords[Math.floor(Math.random() * possibleChords.length)];
        // Avoid duplicates
        if (!options.find(o => o.id === random.id)) {
            options.push(random);
        }
    }

    // Shuffle options so correct answer isn't always first
    const shuffledOptions = options
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => ({ id: value.id, name: value.name }));

    return {
        chordId: target.id,
        chordName: target.name,
        rootMidi,
        notes,
        options: shuffledOptions
    };
};

/**
 * Interval Trainer Logic
 * 
 * Generates interval identification questions for the interval training mode.
 * An interval is the distance between two notes, measured in semitones.
 * 
 * This module:
 * - Loads interval configurations from JSON
 * - Filters intervals by difficulty level
 * - Generates random questions with multiple choice options
 * - Provides MIDI note values for audio playback
 */

import intervalsConfig from '../../config/intervals.json';
import gameModesConfig from '../../config/gameModes.json';

/**
 * Question data structure for interval identification.
 * Contains the target interval and multiple choice options.
 */
export interface IntervalQuestion {
    /** Unique identifier for the interval (e.g., "m2", "P5") */
    intervalId: string;
    
    /** Human-readable interval name (e.g., "Minor 2nd", "Perfect 5th") */
    intervalName: string;
    
    /** MIDI note number for the root note */
    rootMidi: number;
    
    /** MIDI note number for the target note (root + interval) */
    targetMidi: number;
    
    /** Array of multiple choice options (includes correct answer) */
    options: { id: string; name: string }[];
}

/**
 * Generate a random interval identification question.
 * 
 * The question includes:
 * - A root note in a singable range (G3 to G4)
 * - A target note that forms the interval with the root
 * - 4 multiple choice options (correct answer + 3 distractors)
 * 
 * @param difficulty - Difficulty level ('easy', 'medium', 'hard')
 * @returns Complete interval question with options
 */
export const generateIntervalQuestion = (difficulty: string): IntervalQuestion => {
    // Get allowed intervals for this difficulty from game config
    const modeConfig = gameModesConfig.interval.find(m => m.id === difficulty) || gameModesConfig.interval[0];
    const allowedIds = modeConfig.intervals;

    // Filter available intervals to only those allowed at this difficulty
    const possibleIntervals = intervalsConfig.filter(i => allowedIds.includes(i.id));

    // Randomly select the target interval to identify
    const target = possibleIntervals[Math.floor(Math.random() * possibleIntervals.length)];

    // Generate root note in singable range: G3 (55) to G4 (67)
    // This keeps intervals in a comfortable vocal range
    const rootMidi = 55 + Math.floor(Math.random() * 12);
    
    // Calculate target note by adding interval semitones to root
    const targetMidi = rootMidi + target.semitones;

    // Generate multiple choice options
    // Start with correct answer, then add random distractors
    const options = [target];
    while (options.length < 4 && options.length < possibleIntervals.length) {
        const random = possibleIntervals[Math.floor(Math.random() * possibleIntervals.length)];
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
        intervalId: target.id,
        intervalName: target.name,
        rootMidi,
        targetMidi,
        options: shuffledOptions
    };
};

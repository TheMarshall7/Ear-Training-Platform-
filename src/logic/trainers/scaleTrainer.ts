/**
 * Scale Trainer Logic
 * 
 * Generates scale identification questions for the scale training mode.
 * A scale is a sequence of notes following a specific pattern.
 * 
 * This module:
 * - Loads scale configurations from JSON
 * - Filters scales by difficulty level
 * - Generates random questions with multiple choice options
 * - Provides note sequences for scale playback
 */

import scalesConfig from '../../config/scales.json';
import type { Difficulty } from '../../types/game';

/**
 * Question data structure for scale identification.
 * Contains the target scale and multiple choice options.
 */
export interface ScaleQuestion {
    /** Unique identifier for the scale type (e.g., "major", "minor", "dorian") */
    scaleId: string;
    
    /** Human-readable scale name (e.g., "Major", "Natural Minor", "Dorian") */
    scaleName: string;
    
    /** Array of note names in the scale (e.g., ["C", "D", "E", "F", "G", "A", "B"]) */
    notes: string[];
    
    /** Array of multiple choice options (includes correct answer) */
    options: { id: string; name: string }[];
}

/**
 * Generate a random scale identification question.
 * 
 * The question includes:
 * - A complete scale sequence (notes in order)
 * - 4 multiple choice options (correct answer + 3 distractors from same difficulty)
 * 
 * @param difficulty - Difficulty level ('easy', 'medium', 'hard')
 * @returns Complete scale question with options
 */
export const generateScaleQuestion = (difficulty: Difficulty): ScaleQuestion => {
    // Filter scales by difficulty level
    const possibleScales = scalesConfig.scales.filter(s => s.difficulty === difficulty);
    
    // Fallback to first scale if none found for this difficulty
    if (possibleScales.length === 0) {
        const fallback = scalesConfig.scales[0];
        return {
            scaleId: fallback.id,
            scaleName: fallback.name,
            notes: fallback.notes,
            options: [{ id: fallback.id, name: fallback.name }]
        };
    }

    // Randomly select the target scale to identify
    const target = possibleScales[Math.floor(Math.random() * possibleScales.length)];

    // Generate multiple choice options
    // Start with correct answer, then add random distractors from same difficulty
    const options = [target];
    while (options.length < 4 && options.length < possibleScales.length) {
        const random = possibleScales[Math.floor(Math.random() * possibleScales.length)];
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
        scaleId: target.id,
        scaleName: target.name,
        notes: target.notes,
        options: shuffledOptions
    };
};

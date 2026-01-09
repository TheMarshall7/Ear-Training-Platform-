import melodiesConfig from '../config/melodies.json';
import { degreeToNoteName } from '../config/harmonyRules';
import type { Difficulty } from './GameContext';

export interface MelodyQuestion {
    melodyId: string;
    name: string;
    degrees: number[];
    notes: string[]; // Converted from degrees
    tempoMs: number;
    structureTag: string;
}

export const generateMelodyQuestion = (difficulty: Difficulty): MelodyQuestion => {
    // Filter melodies by difficulty
    const possibleMelodies = melodiesConfig.melodies.filter(m => m.difficulty === difficulty);

    if (possibleMelodies.length === 0) {
        // Fallback
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

    // Pick random melody
    const target = possibleMelodies[Math.floor(Math.random() * possibleMelodies.length)];

    // Convert degrees to note names
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

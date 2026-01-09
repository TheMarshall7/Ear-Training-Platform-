import numberSystemConfig from '../config/numberSystem.json';
import { degreeToMidiChord, degreeToNoteName } from '../config/harmonyRules';
import type { Difficulty } from './GameContext';

export interface NumberSystemQuestion {
    progressionDegrees: number[];
    progressionChords: number[][]; // MIDI notes for each chord
    targetNote: string; // Note name
    targetDegree: number; // Scale degree (1-7)
    targetMidi: number; // MIDI note for playback
    allowedDegrees: number[];
    options: { id: string; name: string }[]; // Degree options as strings
}

export const generateNumberSystemQuestion = (difficulty: Difficulty): NumberSystemQuestion => {
    // Get progressions and difficulty config
    const progressions = numberSystemConfig.progressions;
    const difficultyConfig = numberSystemConfig.difficulties[difficulty];
    const allowedDegrees = difficultyConfig?.allowedDegrees || [1, 2, 3, 4, 5, 6, 7];

    // Pick random progression
    const progression = progressions[Math.floor(Math.random() * progressions.length)];
    const progressionDegrees = progression.degrees;

    // Convert progression degrees to MIDI chords
    const progressionChords = progressionDegrees.map(degree => degreeToMidiChord(degree));

    // Pick random target degree from allowed pool
    const targetDegree = allowedDegrees[Math.floor(Math.random() * allowedDegrees.length)];
    const targetNote = degreeToNoteName(targetDegree);
    
    // Convert target degree to MIDI (using C4 = 60 as base)
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

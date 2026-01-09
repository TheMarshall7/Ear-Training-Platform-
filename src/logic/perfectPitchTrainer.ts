import perfectPitchConfig from '../config/perfectPitch.json';
import type { Difficulty } from './GameContext';

export interface PerfectPitchQuestion {
    targetNote: string;
    allowedNotes: string[];
    options: { id: string; name: string }[];
}

export const generatePerfectPitchQuestion = (difficulty: Difficulty): PerfectPitchQuestion => {
    const difficultyConfig = perfectPitchConfig.difficulties[difficulty];
    const allowedNotes = difficultyConfig?.allowedNotes || ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

    // Pick random target note from allowed pool
    const targetNote = allowedNotes[Math.floor(Math.random() * allowedNotes.length)];

    // Options are all allowed notes
    const options = allowedNotes.map(note => ({
        id: note,
        name: note
    }));

    return {
        targetNote,
        allowedNotes,
        options
    };
};

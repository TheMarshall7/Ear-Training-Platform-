export type ChordFunction = 'T' | 'PD' | 'D';

export interface FunctionPool {
    T: number[]; // Tonic: [1, 6, 3]
    PD: number[]; // Predominant: [2, 4]
    D: number[]; // Dominant: [5, 7]
}

export interface CadenceRule {
    type: 'authentic' | 'deceptive' | 'half';
    sequence: number[]; // e.g., [5, 1] for authentic
    allowedDifficulties: ('easy' | 'medium' | 'hard')[];
}

export interface DifficultyTemplate {
    minLength: number;
    maxLength: number;
    template: ChordFunction[]; // e.g., ['T', 'PD', 'D', 'T']
    allowRepeats: boolean; // Allow same function to repeat
    allowDeceptive: boolean;
}

export interface HarmonyConfig {
    functionPools: FunctionPool;
    cadences: CadenceRule[];
    difficultyTemplates: Record<'easy' | 'medium' | 'hard', DifficultyTemplate>;
    generationParams: {
        historySize: number; // N=15 for anti-repeat buffer
        maxAttempts: number; // Max attempts to generate unique progression
    };
}

export const harmonyRules: HarmonyConfig = {
    functionPools: {
        T: [1, 6, 3], // Tonic function
        PD: [2, 4],   // Predominant function
        D: [5, 7]     // Dominant function (7 is diminished)
    },
    cadences: [
        {
            type: 'authentic',
            sequence: [5, 1],
            allowedDifficulties: ['easy', 'medium', 'hard']
        },
        {
            type: 'deceptive',
            sequence: [5, 6],
            allowedDifficulties: ['medium', 'hard']
        },
        {
            type: 'half',
            sequence: [5], // End on 5
            allowedDifficulties: [] // Not included in MVP
        }
    ],
    difficultyTemplates: {
        easy: {
            minLength: 2,
            maxLength: 3,
            template: ['T', 'D', 'T'], // Base template
            allowRepeats: false,
            allowDeceptive: false
        },
        medium: {
            minLength: 3,
            maxLength: 4,
            template: ['T', 'PD', 'D', 'T'], // Base template
            allowRepeats: false,
            allowDeceptive: true
        },
        hard: {
            minLength: 5,
            maxLength: 6,
            template: ['T', 'PD', 'D', 'T'], // Base template - will be extended with repeats
            allowRepeats: true,
            allowDeceptive: true
        }
    },
    generationParams: {
        historySize: 15,
        maxAttempts: 50
    }
};

// C Major scale degrees in MIDI (C3 = 48)
const SCALE_DEGREES: Record<number, number> = {
    1: 48, // C3
    2: 50, // D3
    3: 52, // E3
    4: 53, // F3
    5: 55, // G3
    6: 57, // A3
    7: 59  // B3
};

// Chord interval patterns (semitones from root)
const CHORD_INTERVALS: Record<string, number[]> = {
    major: [0, 4, 7],      // Root, Major 3rd, Perfect 5th
    minor: [0, 3, 7],      // Root, Minor 3rd, Perfect 5th
    diminished: [0, 3, 6]  // Root, Minor 3rd, Diminished 5th
};

// C Major chord types by degree
const CHORD_TYPES: Record<number, string> = {
    1: 'major',      // C major
    2: 'minor',      // D minor
    3: 'minor',      // E minor
    4: 'major',      // F major
    5: 'major',      // G major
    6: 'minor',      // A minor
    7: 'diminished'  // B diminished
};

// Convert degree to MIDI notes for root position triad
export function degreeToMidiChord(degree: number): number[] {
    const rootMidi = SCALE_DEGREES[degree];
    if (!rootMidi) return [];

    const chordType = CHORD_TYPES[degree];
    const intervals = CHORD_INTERVALS[chordType];
    
    return intervals.map(offset => rootMidi + offset);
}

// Note name to degree mapping (C Major)
const NOTE_TO_DEGREE: Record<string, number> = {
    'C': 1,
    'D': 2,
    'E': 3,
    'F': 4,
    'G': 5,
    'A': 6,
    'B': 7
};

// Degree to note name mapping
const DEGREE_TO_NOTE: Record<number, string> = {
    1: 'C',
    2: 'D',
    3: 'E',
    4: 'F',
    5: 'G',
    6: 'A',
    7: 'B'
};

/**
 * Convert scale degree (1-7) to note name in C Major
 */
export function degreeToNoteName(degree: number): string {
    return DEGREE_TO_NOTE[degree] || 'C';
}

/**
 * Convert note name to scale degree in C Major
 */
export function noteNameToDegree(note: string): number {
    // Handle note names with accidentals by stripping them for diatonic mapping
    const baseNote = note.replace(/[#b]/, '').toUpperCase();
    return NOTE_TO_DEGREE[baseNote] || 1;
}

/**
 * Convert note name to MIDI number (C4 = 60)
 * Handles basic accidentals: # (sharp), b (flat)
 * For MVP, only handles diatonic notes: C, D, E, F, G, A, B
 * Accidentals are approximated (not perfect for all cases)
 */
export function noteNameToMidi(note: string, octave: number = 4): number {
    const baseNote = note.replace(/[#b]/, '').toUpperCase();
    const hasSharp = note.includes('#');
    const hasFlat = note.includes('b');
    
    // Base MIDI for C4 = 60
    const baseMidi = (octave - 4) * 12 + 60;
    
    // Diatonic note offsets from C
    const noteOffsets: Record<string, number> = {
        'C': 0,
        'D': 2,
        'E': 4,
        'F': 5,
        'G': 7,
        'A': 9,
        'B': 11
    };
    
    const offset = noteOffsets[baseNote] || 0;
    let semitoneAdjust = 0;
    
    if (hasSharp) semitoneAdjust = 1;
    if (hasFlat) semitoneAdjust = -1;
    
    return baseMidi + offset + semitoneAdjust;
}

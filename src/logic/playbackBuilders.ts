import type { PlaySpec, IntervalDirection } from '../types/resources';
import { degreeToNoteName, degreeToMidiChord } from '../config/harmonyRules';

/**
 * Build a playSpec for a scale
 */
export function buildScalePlaySpec(notes: string[], tempoMs: number = 400): PlaySpec {
    return {
        type: 'noteSequence',
        notes,
        tempoMs
    };
}

/**
 * Build a playSpec for an interval
 */
export function buildIntervalPlaySpec(
    root: string,
    semitones: number,
    direction: IntervalDirection,
    tempoMs: number = 800
): PlaySpec {
    return {
        type: 'interval',
        root,
        semitones,
        direction,
        tempoMs
    };
}

/**
 * Build a playSpec for a chord
 */
export function buildChordPlaySpec(notes: string[]): PlaySpec {
    return {
        type: 'chord',
        notes,
        tempoMs: 0 // Not used for single chord
    };
}

/**
 * Build a playSpec for a chord progression
 */
export function buildProgressionPlaySpec(
    degrees: number[],
    tempoMs: number = 900
): PlaySpec {
    const chords = degrees.map(degree => {
        const midiNotes = degreeToMidiChord(degree);
        // Convert MIDI to note names (C4 = 60, octave 4)
        const notes = midiNotes.map(midi => {
            // Simple conversion: C4 = 60, so we can derive note name
            const octave = Math.floor(midi / 12) - 1;
            const noteInOctave = midi % 12;
            const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            return noteNames[noteInOctave] + octave;
        });
        return { notes };
    });

    return {
        type: 'chordSequence',
        chords,
        tempoMs
    };
}

/**
 * Build a playSpec for a melody
 */
export function buildMelodyPlaySpec(degrees: number[], tempoMs: number = 400): PlaySpec {
    const notes = degrees.map(degree => degreeToNoteName(degree));
    return {
        type: 'noteSequence',
        notes,
        tempoMs
    };
}

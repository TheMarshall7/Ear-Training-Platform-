import type { ResourceItem, ResourceCategory, Difficulty } from '../types/resources';
import { buildScalePlaySpec, buildIntervalPlaySpec, buildChordPlaySpec, buildProgressionPlaySpec, buildMelodyPlaySpec } from './playbackBuilders';
import scalesConfig from '../config/scales.json';
import intervalsConfig from '../config/intervals.json';
import chordsConfig from '../config/chords.json';
import melodiesConfig from '../config/melodies.json';
import numberSystemConfig from '../config/numberSystem.json';

/**
 * Convert scales config to ResourceItems
 */
export function getScaleResources(): ResourceItem[] {
    return scalesConfig.scales.map(scale => ({
        id: scale.id,
        category: 'scales' as ResourceCategory,
        title: scale.name,
        subtitle: scale.description,
        difficulty: scale.difficulty as Difficulty,
        playSpec: buildScalePlaySpec(scale.notes, 400),
        metadata: {}
    }));
}

/**
 * Convert intervals config to ResourceItems (one per interval, direction handled at playback)
 */
export function getIntervalResources(): ResourceItem[] {
    return intervalsConfig.map(interval => ({
        id: interval.id,
        category: 'intervals' as ResourceCategory,
        title: interval.name,
        subtitle: `${interval.semitones} semitone${interval.semitones !== 1 ? 's' : ''}`,
        playSpec: buildIntervalPlaySpec('C4', interval.semitones, 'asc', 800),
        metadata: {}
    }));
}

/**
 * Convert chords config to ResourceItems
 * For each chord type, create a resource with a C root chord
 */
export function getChordResources(): ResourceItem[] {
    return chordsConfig.map(chordType => {
        // Build notes for C major chord using the interval pattern
        const rootMidi = 60; // C4
        const notes = chordType.intervals.map(offset => {
            const midiNote = rootMidi + offset;
            const octave = Math.floor(midiNote / 12) - 1;
            const noteInOctave = midiNote % 12;
            const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            return noteNames[noteInOctave] + octave;
        });

        return {
            id: `chord_${chordType.id}`,
            category: 'chords' as ResourceCategory,
            title: `${chordType.name} Chord`,
            subtitle: `C ${chordType.name}`,
            playSpec: buildChordPlaySpec(notes),
            metadata: {
                chordType: chordType.name
            }
        };
    });
}

/**
 * Convert progressions from numberSystem config to ResourceItems
 */
export function getProgressionResources(): ResourceItem[] {
    const progressions = numberSystemConfig.progressions;
    const commonNames: Record<string, string> = {
        '1-5-1': 'I-V-I',
        '1-4-5-1': 'I-IV-V-I',
        '6-4-5-1': 'vi-IV-V-I',
        '1-6-4-5-1': 'I-vi-IV-V-I',
        '1-5-6-4-1': 'I-V-vi-IV-I'
    };

    return progressions.map((prog, index) => {
        const degreeString = prog.degrees.join('-');
        const name = commonNames[degreeString] || degreeString;

        // Determine difficulty based on length and complexity
        let difficulty: Difficulty = 'easy';
        if (prog.degrees.length > 4) {
            difficulty = 'hard';
        } else if (prog.degrees.length > 3) {
            difficulty = 'medium';
        }

        return {
            id: `progression_${index}`,
            category: 'progressions' as ResourceCategory,
            title: name,
            subtitle: `Degrees: ${degreeString}`,
            difficulty,
            playSpec: buildProgressionPlaySpec(prog.degrees, 900),
            metadata: {
                degrees: prog.degrees
            }
        };
    });
}

/**
 * Convert melodies config to ResourceItems
 */
export function getMelodyResources(): ResourceItem[] {
    return melodiesConfig.melodies.map(melody => ({
        id: melody.id,
        category: 'melodies' as ResourceCategory,
        title: melody.name,
        subtitle: `Degrees: ${melody.degrees.join('-')}`,
        difficulty: melody.difficulty as Difficulty,
        playSpec: buildMelodyPlaySpec(melody.degrees, melody.tempoMs),
        metadata: {
            structureTag: melody.structureTag,
            degrees: melody.degrees
        }
    }));
}

/**
 * Get all resources for a category
 */
export function getResourcesByCategory(category: ResourceCategory): ResourceItem[] {
    switch (category) {
        case 'scales':
            return getScaleResources();
        case 'intervals':
            return getIntervalResources();
        case 'chords':
            return getChordResources();
        case 'progressions':
            return getProgressionResources();
        case 'melodies':
            return getMelodyResources();
        default:
            return [];
    }
}

/**
 * Get all resources
 */
export function getAllResources(): ResourceItem[] {
    return [
        ...getScaleResources(),
        ...getIntervalResources(),
        ...getChordResources(),
        ...getProgressionResources(),
        ...getMelodyResources()
    ];
}

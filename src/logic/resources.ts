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
 * Determine chord difficulty based on chord type
 */
function getChordDifficulty(chordId: string): Difficulty {
    // Easy: Basic triads
    const easyChords = ['maj', 'min', 'dim', 'aug'];
    
    // Medium: 7th chords and suspensions
    const mediumChords = [
        'maj7', 'min7', 'dom7', 'dim7', 'halfdim7', 'minmaj7',
        'sus4', 'sus2', 'add9'
    ];
    
    // Hard: Extended and altered jazz chords (everything else)
    // Includes: 9ths, 11ths, 13ths, and all altered dominants
    
    if (easyChords.includes(chordId)) {
        return 'easy';
    } else if (mediumChords.includes(chordId)) {
        return 'medium';
    } else {
        return 'hard';
    }
}

/**
 * Get descriptive subtitle for jazz chords
 */
function getChordSubtitle(chordType: any): string {
    const chordId = chordType.id;
    
    // Add helpful descriptions for jazz chords
    if (chordId.includes('altered')) {
        return 'C7♯9♯5 • Altered Scale';
    }
    if (chordId.includes('13')) {
        const alterations = [];
        if (chordId.includes('b5')) alterations.push('♭5');
        if (chordId.includes('sharp5')) alterations.push('♯5');
        if (chordId.includes('b9')) alterations.push('♭9');
        if (chordId.includes('sharp9')) alterations.push('♯9');
        
        if (alterations.length > 0) {
            return `C13${alterations.join('')} • Jazz Extension`;
        }
        return 'C13 • Jazz Extension';
    }
    if (chordId.includes('11')) {
        return 'C11 • Extended Harmony';
    }
    if (chordId.includes('9')) {
        const alterations = [];
        if (chordId.includes('b5')) alterations.push('♭5');
        if (chordId.includes('sharp5')) alterations.push('♯5');
        if (chordId.includes('b9')) alterations.push('♭9');
        if (chordId.includes('sharp9')) alterations.push('♯9');
        
        if (alterations.length > 0) {
            return `C9${alterations.join('')} • Altered`;
        }
        return 'C9 • Extended';
    }
    if (chordId.includes('7')) {
        const alterations = [];
        if (chordId.includes('b5')) alterations.push('♭5');
        if (chordId.includes('sharp5')) alterations.push('♯5');
        if (chordId.includes('b9')) alterations.push('♭9');
        if (chordId.includes('sharp9')) alterations.push('♯9');
        
        if (alterations.length > 0) {
            return `C7${alterations.join('')} • Altered Dominant`;
        }
        return `C${chordType.name}`;
    }
    
    return `C ${chordType.name}`;
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

        const difficulty = getChordDifficulty(chordType.id);
        const subtitle = getChordSubtitle(chordType);

        return {
            id: `chord_${chordType.id}`,
            category: 'chords' as ResourceCategory,
            title: `${chordType.name}`,
            subtitle: subtitle,
            difficulty: difficulty,
            playSpec: buildChordPlaySpec(notes),
            metadata: {
                chordType: chordType.name,
                isJazzChord: difficulty === 'hard'
            }
        };
    });
}

/**
 * Convert progressions from numberSystem config to ResourceItems
 */
export function getProgressionResources(): ResourceItem[] {
    const resources: ResourceItem[] = [];
    
    // First, add cadences
    const cadenceNames: Record<string, string> = {
        '5-1': 'V-I',
        '4-1': 'IV-I',
        '5-6': 'V-vi',
        '1-5': 'I-V',
        '2-5': 'ii-V',
        '4-5': 'IV-V',
        '6-5': 'vi-V'
    };
    
    if (numberSystemConfig.cadences) {
        numberSystemConfig.cadences.forEach((cadence, index) => {
            const degreeString = cadence.degrees.join('-');
            const romanNumeral = cadenceNames[degreeString] || degreeString;
            resources.push({
                id: `cadence_${index}`,
                category: 'progressions' as ResourceCategory,
                title: cadence.name || romanNumeral,
                subtitle: `${romanNumeral} • Degrees: ${degreeString}`,
                difficulty: 'medium' as Difficulty, // Cadences are typically medium difficulty
                playSpec: buildProgressionPlaySpec(cadence.degrees, 900),
                metadata: {
                    degrees: cadence.degrees,
                    isCadence: true
                }
            });
        });
    }
    
    // Then add regular progressions
    const progressions = numberSystemConfig.progressions;
    const commonNames: Record<string, string> = {
        '1-5-1': 'I-V-I',
        '1-4-5-1': 'I-IV-V-I',
        '6-4-5-1': 'vi-IV-V-I',
        '1-6-4-5-1': 'I-vi-IV-V-I',
        '1-5-6-4-1': 'I-V-vi-IV-I',
        '1-6-2-5-1': 'I-vi-ii-V-I',
        '1-5-6-3-4-1': 'I-V-vi-iii-IV-I',
        '1-3-4-5-1': 'I-iii-IV-V-I',
        '1-4-1-5-1': 'I-IV-I-V-I',
        '1-6-4-1-5-1': 'I-vi-IV-I-V-I',
        '1-5-1-4-1': 'I-V-I-IV-I',
        '1-2-5-1': 'I-ii-V-I',
        '1-4-6-5-1': 'I-IV-vi-V-I',
        '1-3-6-4-5-1': 'I-iii-vi-IV-V-I',
        '1-7-6-5-1': 'I-vii°-vi-V-I',
        '1-4-2-5-1': 'I-IV-ii-V-I',
        '1-6-2-4-5-1': 'I-vi-ii-IV-V-I',
        '1-5-4-1': 'I-V-IV-I',
        '1-3-4-1': 'I-iii-IV-I',
        '1-6-3-4-1': 'I-vi-iii-IV-I',
        '1-4-5-6-4-1': 'I-IV-V-vi-IV-I',
        '1-5-3-6-4-1': 'I-V-iii-vi-IV-I',
        '1-2-3-4-5-1': 'I-ii-iii-IV-V-I',
        '1-6-4-5-4-1': 'I-vi-IV-V-IV-I',
        '1-4-5-6-2-5-1': 'I-IV-V-vi-ii-V-I',
        '1-3-4-5-6-5-1': 'I-iii-IV-V-vi-V-I',
        '1-5-6-3-4-1-4-5-1': 'I-V-vi-iii-IV-I-IV-V-I',
        '1-6-4-2-5-1': 'I-vi-IV-ii-V-I',
        '1-4-1-6-4-5-1': 'I-IV-I-vi-IV-V-I',
        '1-5-6-4-2-5-1': 'I-V-vi-IV-ii-V-I',
        '6-4-1-5': 'vi-IV-I-V',
        '2-5-1': 'ii-V-I',
        '4-5-3-6': 'IV-V-iii-vi',
        '4-5': 'IV-V',
        '3-6-4-1': 'iii-vi-IV-I',
        '2-4-1-5': 'ii-IV-I-V',
        '4-3-6-5': 'IV-iii-vi-V',
        '3-4-1-5': 'iii-IV-I-V',
        '6-2-5-1': 'vi-ii-V-I',
        '2-5-6-4': 'ii-V-vi-IV',
        '4-1-5-1': 'IV-I-V-I',
        '3-6-2-5': 'iii-vi-ii-V',
        '6-5-1': 'vi-V-I',
        '2-5-6-1': 'ii-V-vi-I',
        '4-6-5-1': 'IV-vi-V-I',
        '3-4-5-1': 'iii-IV-V-I',
        '6-1-4-5': 'vi-I-IV-V',
        '2-3-6-5': 'ii-iii-vi-V',
        '4-2-5-1': 'IV-ii-V-I',
        '3-5-6-4': 'iii-V-vi-IV',
        '6-4-2-5': 'vi-IV-ii-V',
        '2-4-5-1': 'ii-IV-V-I',
        '4-1-6-5': 'IV-I-vi-V',
        '3-6-1-4': 'iii-vi-I-IV'
    };

    progressions.forEach((prog, index) => {
        const degreeString = prog.degrees.join('-');
        const name = commonNames[degreeString] || degreeString;

        // Determine difficulty based on length and complexity
        let difficulty: Difficulty = 'easy';
        if (prog.degrees.length > 4) {
            difficulty = 'hard';
        } else if (prog.degrees.length > 3) {
            difficulty = 'medium';
        }

        resources.push({
            id: `progression_${index}`,
            category: 'progressions' as ResourceCategory,
            title: name,
            subtitle: `Degrees: ${degreeString}`,
            difficulty,
            playSpec: buildProgressionPlaySpec(prog.degrees, 900),
            metadata: {
                degrees: prog.degrees,
                isCadence: false
            }
        });
    });
    
    return resources;
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

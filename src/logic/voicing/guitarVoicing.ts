const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const MIN_GUITAR_MIDI = 52; // E3
const DROP_D_MIN_MIDI = 50; // D3
const STANDARD_TUNING_MIDI = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4
const BASS_MIN_MIDI = 40; // E2
const BASS_DROP_D_MIN_MIDI = 38; // D2

const uniqueSorted = (notes: number[]) =>
    Array.from(new Set(notes)).sort((a, b) => a - b);

const getGuitarMinMidi = (rootMidi?: number) => {
    if (rootMidi == null) return MIN_GUITAR_MIDI;
    const pitchClass = ((rootMidi % 12) + 12) % 12;
    return pitchClass === 2 ? DROP_D_MIN_MIDI : MIN_GUITAR_MIDI;
};

const normalizeInterval = (interval: number) => ((interval % 12) + 12) % 12;

const getChordIntervals = (midiNotes: number[], rootMidi: number) => {
    const intervals = midiNotes
        .map(note => normalizeInterval(note - rootMidi))
        .filter(interval => Number.isFinite(interval));
    if (!intervals.includes(0)) {
        intervals.unshift(0);
    }
    return uniqueSorted(intervals);
};

const buildOpenVoicingFallback = (intervals: number[], rootMidi: number) => {
    const voiced: number[] = [rootMidi];
    const isLowRegister = rootMidi < 59; // Below B3, open up the triad

    intervals
        .filter(interval => interval !== 0)
        .forEach(interval => {
            let note = rootMidi + interval;
            if (isLowRegister && interval <= 7) {
                note += 12;
            }
            while (note - voiced[voiced.length - 1] < 3) {
                note += 12;
            }
            voiced.push(note);
        });

    const rootOctave = rootMidi + 12;
    if (!voiced.some(note => Math.abs(note - rootOctave) < 1)) {
        voiced.push(rootOctave);
    }

    const fifthInterval =
        intervals.find(interval => interval % 12 === 7) ??
        intervals.find(interval => interval % 12 === 6 || interval % 12 === 8);
    if (fifthInterval != null) {
        const fifthAbove = rootMidi + fifthInterval + 12;
        if (!voiced.some(note => Math.abs(note - fifthAbove) < 1)) {
            voiced.push(fifthAbove);
        }
    }

    return uniqueSorted(voiced);
};

const getRootFretForString = (
    rootPitchClass: number,
    openMidi: number,
    minMidi: number
) => {
    let candidate = Math.max(minMidi, openMidi);
    while (normalizeInterval(candidate) !== rootPitchClass) {
        candidate += 1;
    }
    const fret = candidate - openMidi;
    if (fret < 0 || fret > 14) return null;
    return fret;
};

const scoreShape = (
    frets: Array<number | null>,
    rootMidi: number,
    intervals: number[],
    allowOpen: boolean,
    requiredIntervals: number[]
) => {
    const played: number[] = [];
    frets.forEach((fret, index) => {
        if (fret == null) return;
        played.push(STANDARD_TUNING_MIDI[index] + fret);
    });
    if (played.length < 3) return -Infinity;

    const coverage = new Set(played.map(note => normalizeInterval(note - rootMidi)));
    const hasMinorThird = intervals.includes(3);
    const hasMajorThird = intervals.includes(4);
    const hasThird = hasMinorThird || hasMajorThird;
    const hasSeventh = intervals.some(interval => [9, 10, 11].includes(interval));
    const hasFifth = intervals.some(interval => [6, 7, 8].includes(interval));

    const lowest = Math.min(...played);
    const rootInBass = normalizeInterval(lowest - rootMidi) === 0;

    const usedFrets = frets.filter((fret): fret is number => fret != null);
    const maxFret = Math.max(...usedFrets);
    const minFret = Math.min(...usedFrets);
    const span = maxFret - minFret;

    let score = coverage.size * 10 + usedFrets.length;
    requiredIntervals.forEach(required => {
        if (!coverage.has(normalizeInterval(required))) {
            score -= 20;
        }
    });
    if (rootInBass) score += 6;
    if (hasThird && (coverage.has(3) || coverage.has(4))) score += 4;
    if (hasThird && !(coverage.has(3) || coverage.has(4))) score -= 12;
    if (hasSeventh && coverage.has(9)) score += 2;
    if (hasSeventh && coverage.has(10)) score += 3;
    if (hasSeventh && coverage.has(11)) score += 3;
    if (hasSeventh && !(coverage.has(9) || coverage.has(10) || coverage.has(11))) score -= 6;
    if (hasFifth && (coverage.has(6) || coverage.has(7) || coverage.has(8))) score += 2;
    if (span > 4) score -= 10;
    score -= maxFret * 0.1;
    if (allowOpen) {
        score += frets.filter(fret => fret === 0).length * 0.5;
    }

    return score;
};

type FretShape = Array<number | null>;

type GuitarVoicingContext = 'trainer' | 'resource';

const buildShapeForRootString = (
    rootStringIndex: number,
    rootPitchClass: number,
    intervals: number[],
    minMidi: number,
    context: GuitarVoicingContext,
    requiredIntervals: number[]
): { midiNotes: number[]; rootMidi: number; score: number } | null => {
    const openMidi = STANDARD_TUNING_MIDI[rootStringIndex];
    const rootFret = getRootFretForString(rootPitchClass, openMidi, minMidi);
    if (rootFret == null) return null;

    const rootMidi = openMidi + rootFret;
    const allowOpen = context === 'resource' ? false : rootFret <= 2;
    const maxSpan = context === 'resource' ? 3 : 4;
    const rangeStart = allowOpen ? 0 : rootFret;
    const rangeEnd = rootFret + maxSpan;
    const intervalSet = new Set(intervals.map(normalizeInterval));

    const candidates: Array<Array<number | null>> = STANDARD_TUNING_MIDI.map((stringMidi, index) => {
        if (context === 'resource' && index < rootStringIndex) {
            return [null];
        }
        const choices: Array<number | null> = [];
        for (let fret = rangeStart; fret <= rangeEnd; fret += 1) {
            const midi = stringMidi + fret;
            if (midi < minMidi) continue;
            if (intervalSet.has(normalizeInterval(midi - rootMidi))) {
                choices.push(fret);
            }
        }
        if (index === rootStringIndex) {
            if (!choices.includes(rootFret)) {
                return [];
            }
            return [rootFret];
        }
        choices.push(null);
        return choices;
    });

    const frets: FretShape = new Array(6).fill(null);
    let best: FretShape | null = null;
    let bestScore = -Infinity;

    const search = (stringIndex: number) => {
        if (stringIndex >= 6) {
            const score = scoreShape(frets, rootMidi, intervals, allowOpen, requiredIntervals);
            if (score > bestScore) {
                bestScore = score;
                best = [...frets];
            }
            return;
        }
        const options = candidates[stringIndex];
        if (options.length === 0) return;
        options.forEach(option => {
            frets[stringIndex] = option;
            search(stringIndex + 1);
        });
        frets[stringIndex] = null;
    };

    search(0);
    if (!best) return null;

    const bestShape: FretShape = best;
    const voiced = bestShape
        .map((fret: number | null, index: number) => (fret == null ? null : STANDARD_TUNING_MIDI[index] + fret))
        .filter((note: number | null): note is number => note != null);

    if (voiced.length < 3) return null;
    return { midiNotes: uniqueSorted(voiced), rootMidi, score: bestScore };
};

const findBestGuitarShape = (
    intervals: number[],
    rootMidi: number,
    context: GuitarVoicingContext,
    requiredIntervals: number[]
): { midiNotes: number[]; rootMidi: number; score: number } | null => {
    const rootPitchClass = normalizeInterval(rootMidi);
    const minMidi = getGuitarMinMidi(rootMidi);
    const rootStrings = context === 'resource' ? [1, 2] : [0, 1, 2]; // A, D (resource), otherwise E/A/D
    let bestShape: { midiNotes: number[]; rootMidi: number; score: number } | null = null;
    let bestScore = -Infinity;

    rootStrings.forEach(rootStringIndex => {
        const shape = buildShapeForRootString(
            rootStringIndex,
            rootPitchClass,
            intervals,
            minMidi,
            context,
            requiredIntervals
        );
        if (!shape) return;
        if (shape.score > bestScore) {
            bestScore = shape.score;
            bestShape = shape;
        }
    });

    return bestShape;
};

export const voiceGuitarChord = (
    midiNotes: number[],
    rootMidi?: number,
    context: GuitarVoicingContext = 'trainer'
): number[] => {
    const cleanNotes = midiNotes.filter(note => Number.isFinite(note));
    if (cleanNotes.length === 0) return [];

    const baseRoot = rootMidi ?? Math.min(...cleanNotes);
    const intervals = getChordIntervals(cleanNotes, baseRoot);
    const requiredIntervals = context === 'resource'
        ? intervals.filter(interval => [2, 5, 9, 10, 11].includes(normalizeInterval(interval)))
        : [];
    const shape = findBestGuitarShape(intervals, baseRoot, context, requiredIntervals);

    if (shape) {
        if (context !== 'resource') {
            return shape.midiNotes;
        }
        const targetMin = 55; // G3
        const targetMax = 70; // A4
        let voiced = [...shape.midiNotes];
        while (Math.min(...voiced) < targetMin) {
            voiced = voiced.map(note => note + 12);
        }
        while (Math.max(...voiced) > targetMax) {
            voiced = voiced.map(note => note - 12);
        }
        return uniqueSorted(voiced);
    }

    const minMidi = getGuitarMinMidi(baseRoot);
    const transposed = cleanNotes.map(note => note);
    while (Math.min(...transposed) < minMidi) {
        for (let i = 0; i < transposed.length; i += 1) {
            transposed[i] += 12;
        }
    }
    const fallbackIntervals = getChordIntervals(transposed, baseRoot);
    const fallback = buildOpenVoicingFallback(fallbackIntervals, Math.max(baseRoot, minMidi));
    if (context !== 'resource') {
        return fallback;
    }
    const targetMin = 55; // G3
    const targetMax = 70; // A4
    let voiced = [...fallback];
    while (Math.min(...voiced) < targetMin) {
        voiced = voiced.map(note => note + 12);
    }
    while (Math.max(...voiced) > targetMax) {
        voiced = voiced.map(note => note - 12);
    }
    return uniqueSorted(voiced);
};

export const midiToNoteName = (midi: number): string => {
    const pitchClass = ((midi % 12) + 12) % 12;
    const octave = Math.floor(midi / 12) - 1;
    return `${NOTE_NAMES[pitchClass]}${octave}`;
};

const getBassMinMidi = (rootMidi?: number) => {
    if (rootMidi == null) return BASS_MIN_MIDI;
    const pitchClass = ((rootMidi % 12) + 12) % 12;
    return pitchClass === 2 ? BASS_DROP_D_MIN_MIDI : BASS_MIN_MIDI;
};

const transposeRootIntoBassRange = (rootMidi: number, minMidi: number, maxMidi: number) => {
    let root = rootMidi;
    while (root < minMidi) root += 12;
    while (root > maxMidi) root -= 12;
    return root;
};

export const voiceBassChord = (
    midiNotes: number[],
    rootMidi?: number,
    context: 'trainer' | 'resource' = 'trainer'
): number[] => {
    const cleanNotes = midiNotes.filter(note => Number.isFinite(note));
    if (cleanNotes.length === 0) return [];

    const baseRoot = rootMidi ?? Math.min(...cleanNotes);
    const minMidi = context === 'resource' ? 52 : getBassMinMidi(baseRoot);
    const maxMidi = context === 'resource' ? 64 : 52;
    const bassRoot = transposeRootIntoBassRange(baseRoot, minMidi, maxMidi);

    const intervals = getChordIntervals(cleanNotes, baseRoot);
    const thirdInterval = intervals.includes(3) ? 3 : intervals.includes(4) ? 4 : null;
    const fifthInterval = intervals.find(interval => [7, 6, 8].includes(interval)) ?? null;
    const seventhInterval = intervals.find(interval => [10, 11, 9].includes(interval)) ?? null;
    const extensionInterval = intervals.find(interval => [2, 14, 5, 17].includes(interval)) ?? null;

    const voiced: number[] = [bassRoot];
    const upperRegister = context === 'resource' ? 24 : 12;

    if (thirdInterval != null) {
        voiced.push(bassRoot + thirdInterval + upperRegister);
    }
    if (seventhInterval != null) {
        voiced.push(bassRoot + seventhInterval + upperRegister);
    } else if (fifthInterval != null) {
        voiced.push(bassRoot + fifthInterval + upperRegister);
    }
    if (extensionInterval != null) {
        voiced.push(bassRoot + extensionInterval + upperRegister);
    } else if (thirdInterval == null && fifthInterval != null) {
        voiced.push(bassRoot + fifthInterval + upperRegister);
    }

    const filtered = voiced.filter(note => note >= minMidi);
    return uniqueSorted(filtered);
};

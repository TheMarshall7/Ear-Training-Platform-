import chordsConfig from '../config/chords.json';
import gameModesConfig from '../config/gameModes.json';

export interface ChordQuestion {
    chordId: string;
    chordName: string;
    rootMidi: number;
    notes: number[]; // relative semitones check or absolute? let's do absolute
    options: { id: string; name: string }[];
}

export const generateChordQuestion = (difficulty: string): ChordQuestion => {
    // Get allowed chords for the specified difficulty
    // gameModes.json now has "easy", "medium", "hard" for chords
    const modeConfig = gameModesConfig.chord.find(m => m.id === difficulty) || gameModesConfig.chord[0];
    const allowedIds = modeConfig.chords;

    const possibleChords = chordsConfig.filter(c => allowedIds.includes(c.id));
    const target = possibleChords[Math.floor(Math.random() * possibleChords.length)];

    // Root between C3 and C4
    const rootMidi = 48 + Math.floor(Math.random() * 12);

    const notes = target.intervals.map(offset => rootMidi + offset);

    // Options
    const options = [target];
    while (options.length < 4 && options.length < possibleChords.length) {
        const random = possibleChords[Math.floor(Math.random() * possibleChords.length)];
        if (!options.find(o => o.id === random.id)) {
            options.push(random);
        }
    }

    const shuffledOptions = options
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => ({ id: value.id, name: value.name }));

    return {
        chordId: target.id,
        chordName: target.name,
        rootMidi,
        notes,
        options: shuffledOptions
    };
};

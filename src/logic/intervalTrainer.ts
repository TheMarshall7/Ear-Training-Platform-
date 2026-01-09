import intervalsConfig from '../config/intervals.json';
import gameModesConfig from '../config/gameModes.json';

export interface IntervalQuestion {
    intervalId: string;
    intervalName: string;
    rootMidi: number;
    targetMidi: number;
    options: { id: string; name: string }[];
}

export const generateIntervalQuestion = (difficulty: string): IntervalQuestion => {
    // Get allowed intervals for this difficulty
    const modeConfig = gameModesConfig.interval.find(m => m.id === difficulty) || gameModesConfig.interval[0];
    const allowedIds = modeConfig.intervals;

    // Filter full list
    const possibleIntervals = intervalsConfig.filter(i => allowedIds.includes(i.id));

    // Pick random target
    const target = possibleIntervals[Math.floor(Math.random() * possibleIntervals.length)];

    // Root note: Middle C (60) +/- random range to keep it in singable range
    // Range: G3 (55) to G4 (67)
    const rootMidi = 55 + Math.floor(Math.random() * 12);
    const targetMidi = rootMidi + target.semitones;

    // Generate options (include the correct one + random distractors)
    // We want 4 options usually
    const options = [target];
    while (options.length < 4 && options.length < possibleIntervals.length) {
        const random = possibleIntervals[Math.floor(Math.random() * possibleIntervals.length)];
        if (!options.find(o => o.id === random.id)) {
            options.push(random);
        }
    }

    // Shuffle options
    const shuffledOptions = options
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => ({ id: value.id, name: value.name }));

    return {
        intervalId: target.id,
        intervalName: target.name,
        rootMidi,
        targetMidi,
        options: shuffledOptions
    };
};

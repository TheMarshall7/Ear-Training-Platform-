import scalesConfig from '../config/scales.json';
import type { Difficulty } from './GameContext';

export interface ScaleQuestion {
    scaleId: string;
    scaleName: string;
    notes: string[];
    options: { id: string; name: string }[];
}

export const generateScaleQuestion = (difficulty: Difficulty): ScaleQuestion => {
    // Filter scales by difficulty
    const possibleScales = scalesConfig.scales.filter(s => s.difficulty === difficulty);
    
    if (possibleScales.length === 0) {
        // Fallback to first scale if none found
        const fallback = scalesConfig.scales[0];
        return {
            scaleId: fallback.id,
            scaleName: fallback.name,
            notes: fallback.notes,
            options: [{ id: fallback.id, name: fallback.name }]
        };
    }

    // Pick random target scale
    const target = possibleScales[Math.floor(Math.random() * possibleScales.length)];

    // Generate options (correct + distractors from same difficulty)
    const options = [target];
    while (options.length < 4 && options.length < possibleScales.length) {
        const random = possibleScales[Math.floor(Math.random() * possibleScales.length)];
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
        scaleId: target.id,
        scaleName: target.name,
        notes: target.notes,
        options: shuffledOptions
    };
};

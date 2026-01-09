import { harmonyRules, type ChordFunction, type Difficulty } from '../config/harmonyRules';

export interface SessionState {
    history: string[]; // Array of degree sequences like "1-4-5-1"
    degreeUsageCount: Record<number, number>; // Track frequency of each degree
}

const DEFAULT_SESSION_STATE: SessionState = {
    history: [],
    degreeUsageCount: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }
};

/**
 * Generate a valid chord progression based on functional harmony rules
 * with anti-memorization features
 */
export function generateProgression(
    difficulty: Difficulty,
    sessionState: SessionState = DEFAULT_SESSION_STATE
): number[] {
    const config = harmonyRules;
    const template = config.difficultyTemplates[difficulty];
    const { historySize, maxAttempts } = config.generationParams;

    let attempts = 0;
    let progression: number[] = [];

    while (attempts < maxAttempts) {
        progression = buildProgressionFromTemplate(template, config, difficulty);
        const sequenceKey = progression.join('-');

        // Check if this progression is unique in history
        if (!sessionState.history.includes(sequenceKey)) {
            // Update usage counts
            progression.forEach(deg => {
                sessionState.degreeUsageCount[deg] = (sessionState.degreeUsageCount[deg] || 0) + 1;
            });

            // Add to history (maintain rolling buffer)
            sessionState.history.push(sequenceKey);
            if (sessionState.history.length > historySize) {
                sessionState.history.shift();
            }

            return progression;
        }

        attempts++;
    }

    // Fallback: if we can't generate unique, return the last generated one
    // (should rarely happen with proper history management)
    if (progression.length === 0) {
        console.warn('Failed to generate progression after max attempts, using fallback');
        return [1, 5, 1];
    }
    return progression;
}

/**
 * Build a progression from a template with weighted randomness
 */
function buildProgressionFromTemplate(
    template: typeof harmonyRules.difficultyTemplates.easy,
    config: typeof harmonyRules,
    difficulty: Difficulty
): number[] {
    const { functionPools, cadences } = config;
    const progression: number[] = [];

    // Determine length
    const length = Math.floor(Math.random() * (template.maxLength - template.minLength + 1)) + template.minLength;

    // Build progression following template pattern
    let templateIndex = 0;
    let lastFunction: ChordFunction | null = null;
    let hasPD = false;
    let hasD = false;

    for (let i = 0; i < length; i++) {
        let currentFunction: ChordFunction;

        // Follow template pattern, but allow some flexibility
        if (templateIndex < template.template.length) {
            currentFunction = template.template[templateIndex];
        } else {
            // If template exhausted, continue with last function or choose logically
            if (hasD) {
                // After dominant, must go to tonic (or deceptive)
                currentFunction = 'T';
            } else if (hasPD && !hasD) {
                // After predominant, should go to dominant
                currentFunction = 'D';
            } else {
                // Otherwise, continue with last function or choose T/PD
                currentFunction = lastFunction || (Math.random() < 0.5 ? 'T' : 'PD');
            }
        }

        // Enforce: PD must come before D
        if (currentFunction === 'D' && !hasPD && difficulty !== 'easy') {
            // If we haven't had PD yet and it's not easy mode, insert PD first
            if (i < length - 1) {
                currentFunction = 'PD';
            } else {
                // Last chord, must be D or T - if we need D, we'll allow it but warn
                // Actually, let's just make it T to be safe
                currentFunction = 'T';
            }
        }

        // Track function usage
        if (currentFunction === 'PD') hasPD = true;
        if (currentFunction === 'D') hasD = true;

        // Select degree from function pool with weighted randomness
        const pool = functionPools[currentFunction];
        const degree = selectDegreeFromPool(pool, config);

        progression.push(degree);

        // Handle repeats - for hard mode, allow repeating the same function
        if (template.allowRepeats && Math.random() < 0.35 && i < length - 1) {
            // 35% chance to repeat same function if allowed (for hard mode)
            // Don't advance templateIndex, allowing the same function to be selected again
            // This creates natural repeats in the progression
        } else {
            templateIndex++;
        }

        lastFunction = currentFunction;
    }

    // Enforce cadence at the end
    const cadence = selectCadence(difficulty, template.allowDeceptive);
    if (cadence) {
        // Replace last chords with cadence
        const cadenceLength = cadence.sequence.length;
        if (progression.length >= cadenceLength) {
            // Replace the last N chords with the cadence
            progression.splice(-cadenceLength, cadenceLength, ...cadence.sequence);
        } else {
            // If progression is shorter than cadence, replace entire progression
            progression.splice(0, progression.length, ...cadence.sequence);
        }
    }

    // Final validation: ensure PD comes before D
    const pdIndex = progression.findIndex(d => functionPools.PD.includes(d));
    const dIndex = progression.findIndex(d => functionPools.D.includes(d));
    
    if (pdIndex !== -1 && dIndex !== -1 && pdIndex > dIndex && difficulty !== 'easy') {
        // Invalid order - fix by swapping or rebuilding
        // Simple fix: swap positions if PD comes after D
        if (pdIndex > dIndex) {
            [progression[pdIndex], progression[dIndex]] = [progression[dIndex], progression[pdIndex]];
        }
    }

    // Ensure progression is not empty and has valid degrees (1-7)
    if (progression.length === 0) {
        console.warn('Generated empty progression, using fallback');
        return [1, 5, 1];
    }

    // Validate all degrees are valid (1-7)
    const validDegrees = progression.filter(d => d >= 1 && d <= 7);
    if (validDegrees.length !== progression.length) {
        console.warn('Progression contains invalid degrees, filtering them out');
        if (validDegrees.length === 0) {
            return [1, 5, 1];
        }
        return validDegrees;
    }

    return progression;
}

/**
 * Select a degree from a function pool with weighted randomness
 * (prefer less-used degrees)
 */
function selectDegreeFromPool(
    pool: number[],
    config: typeof harmonyRules
): number {
    // For now, simple random selection
    // In future, could weight by usage frequency
    return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Select an appropriate cadence for the difficulty
 */
function selectCadence(
    difficulty: Difficulty,
    allowDeceptive: boolean
): { sequence: number[] } | null {
    const { cadences } = harmonyRules;
    
    const availableCadences = cadences.filter(c => 
        c.allowedDifficulties.includes(difficulty)
    );

    if (availableCadences.length === 0) {
        // Default authentic cadence
        return { sequence: [5, 1] };
    }

    // Prefer authentic, but allow deceptive if enabled
    if (allowDeceptive && Math.random() < 0.3) {
        const deceptive = availableCadences.find(c => c.type === 'deceptive');
        if (deceptive) return { sequence: deceptive.sequence };
    }

    const authentic = availableCadences.find(c => c.type === 'authentic');
    return authentic ? { sequence: authentic.sequence } : { sequence: [5, 1] };
}

/**
 * Create a new session state
 */
export function createSessionState(): SessionState {
    return { ...DEFAULT_SESSION_STATE };
}

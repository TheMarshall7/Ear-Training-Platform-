export type ResourceCategory = 'scales' | 'intervals' | 'chords' | 'progressions' | 'melodies';

// Re-export as const for runtime use if needed
export const ResourceCategoryValues = ['scales', 'intervals', 'chords', 'progressions', 'melodies'] as const;

export type Difficulty = 'easy' | 'medium' | 'hard';

export type IntervalDirection = 'asc' | 'desc';

export type ScaleDirection = 'ascending' | 'descending' | 'scrambled-asc' | 'scrambled-desc';

export interface PlaySpec {
    type: 'noteSequence' | 'interval' | 'chord' | 'chordSequence';
    notes?: string[];
    chords?: { notes: string[] }[];
    root?: string;
    semitones?: number;
    direction?: IntervalDirection;
    tempoMs: number;
}

export interface ResourceItem {
    id: string;
    category: ResourceCategory;
    title: string;
    subtitle?: string;
    difficulty?: Difficulty;
    playSpec: PlaySpec;
    metadata?: {
        structureTag?: string;
        degrees?: number[];
        chordType?: string;
        isCadence?: boolean;
    };
}

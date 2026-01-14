/**
 * Instrument configuration
 * Each instrument needs a C4.wav sample file
 * Samples can be loaded from local /samples/ folder or from CDN URLs
 */

export interface InstrumentConfig {
    id: string;
    name: string;
    sampleUrl: string; // Can be local path (/samples/piano/C4.wav) or CDN URL
    description?: string;
}

export const instruments: InstrumentConfig[] = [
    {
        id: 'bell',
        name: 'Bell',
        sampleUrl: '/samples/piano/C4.wav',
        description: 'Clear bell tone (default)'
    },
    {
        id: 'piano',
        name: 'Piano',
        sampleUrl: '/samples/SC_PM_piano_clean_soft_mid_C.wav',
        description: 'Clean piano sound'
    },
    {
        id: 'guitar',
        name: 'Guitar',
        sampleUrl: '/samples/hhos_guitar_single_note_05_c.wav',
        description: 'Acoustic guitar pluck'
    },
    {
        id: 'bass',
        name: 'Bass',
        sampleUrl: '/samples/CO_FC_bass_guitar_note_C.wav',
        description: 'Bass guitar tone'
    }
];

/**
 * Get instrument config by ID
 */
export function getInstrument(id: string): InstrumentConfig | undefined {
    return instruments.find(inst => inst.id === id);
}

/**
 * Get default instrument
 */
export function getDefaultInstrument(): InstrumentConfig {
    return instruments[0];
}

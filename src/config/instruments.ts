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
        id: 'piano',
        name: 'Piano',
        sampleUrl: '/samples/piano/C4.wav',
        description: 'Classic piano sound'
    },
    {
        id: 'grandPiano',
        name: 'Grand Piano',
        // Option 1: Use a CDN-hosted sample (uncomment and replace URL)
        // sampleUrl: 'https://your-cdn.com/piano-c4.wav',
        // Option 2: Add your own sample to /public/samples/grandPiano/C4.wav
        sampleUrl: '/samples/grandPiano/C4.wav',
        description: 'Rich grand piano sound'
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
